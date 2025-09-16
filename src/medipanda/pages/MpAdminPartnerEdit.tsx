import { MpDrugCompanySelectModal } from '@/medipanda/components/MpDrugCompanySelectModal';
import { MpMemberSelectModal } from '@/medipanda/components/MpMemberSelectModal';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { AxiosError } from 'axios';
import { useFormik } from 'formik';
import { SearchNormal1 } from 'iconsax-react';
import {
  ContractStatus,
  createPartner,
  DrugCompanyResponse,
  getPartnerDetails,
  MemberResponse,
  PharmacyStatus,
  PharmacyStatusLabel,
  updatePartner,
} from '@/backend';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';

export default function MpAdminPartnerEdit() {
  const navigate = useNavigate();
  const { partnerId: paramPartnerId } = useParams();
  const isNew = paramPartnerId === undefined;
  const partnerId = Number(paramPartnerId);

  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [drugCompanySelectModalOpen, setDrugCompanySelectModalOpen] = useState(false);
  const [memberSelectModalOpen, setMemberSelectModalOpen] = useState(false);

  const { alert, alertError } = useMpModal();

  useEffect(() => {
    if (!isNew) {
      fetchDetail(partnerId);
    }
  }, [isNew, partnerId]);

  const fetchDetail = async (partnerId: number) => {
    if (Number.isNaN(partnerId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/partners');
    }

    setLoading(true);
    try {
      const detail = await getPartnerDetails(partnerId);

      formik.setValues({
        drugCompany: { id: -1, name: detail.drugCompanyName, code: '' },
        memberId: '',
        memberName: detail.memberName,
        companyName: detail.companyName,
        contractType: detail.contractType,
        institutionCode: detail.institutionCode,
        institutionName: detail.institutionName,
        businessNumber: detail.businessNumber,
        medicalDepartment: detail.medicalDepartment ?? '',
        pharmacyName: detail.pharmacyName ?? '',
        pharmacyAddress: detail.pharmacyAddress ?? '',
        pharmacyStatus: detail.pharmacyStatus,
        note: detail.note ?? '',
      });
    } catch (error) {
      console.error('Failed to fetch partner data:', error);
      enqueueSnackbar('거래선 정보를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      drugCompany: null as DrugCompanyResponse | null,
      memberId: '',
      memberName: '',
      companyName: '',
      contractType: ContractStatus.CONTRACT as keyof typeof ContractStatus,
      institutionCode: '',
      institutionName: '',
      businessNumber: '',
      medicalDepartment: '',
      pharmacyName: '',
      pharmacyAddress: '',
      pharmacyStatus: PharmacyStatus.NORMAL as keyof typeof PharmacyStatus | null,
      note: '',
    },
    onSubmit: async values => {
      if (values.drugCompany === null) {
        await alert('제약사를 선택하세요.');
        return;
      }

      if (values.memberName === '') {
        await alert('사용자를 선택하세요.');
        return;
      }

      if (values.institutionName === '') {
        await alert('거래처명을 입력하세요.');
        return;
      }

      if (values.businessNumber === '') {
        await alert('사업자등록번호를 입력하세요.');
        return;
      }

      try {
        if (isNew) {
          await createPartner({
            drugCompanyId: values.drugCompany!.id,
            userId: values.memberId,
            drugCompany: values.drugCompany!.name,
            companyName: values.companyName,
            contractType: values.contractType!,
            institutionCode: values.institutionCode,
            institutionName: values.institutionName,
            businessNumber: values.businessNumber,
            medicalDepartment: values.medicalDepartment,
            pharmacyName: values.pharmacyName,
            pharmacyAddress: values.pharmacyAddress,
            pharmacyStatus: values.pharmacyStatus!,
            note: values.note,
          });
        } else {
          await updatePartner(partnerId, {
            drugCompanyId: null,
            drugCompanyName: null,
            companyName: values.companyName,
            contractType: values.contractType,
            institutionCode: values.institutionCode,
            institutionName: values.institutionName,
            businessNumber: values.businessNumber,
            medicalDepartment: values.medicalDepartment,
            pharmacyName: values.pharmacyName,
            pharmacyAddress: values.pharmacyAddress,
            pharmacyStatus: values.pharmacyStatus,
            note: values.note,
          });
        }

        enqueueSnackbar('거래선 정보가 저장되었습니다.', { variant: 'success' });
        navigate('/admin/partners');
      } catch (e) {
        if (e instanceof AxiosError && e.response?.status === 409) {
          await alert('해당 제약사-거래처 조합이 이미 등록되어 있습니다.');
          return;
        }

        console.error(e);
        await alert('거래선 정보 저장에 실패했습니다.');
      }
    },
  });

  const handlePharmaceuticalSearch = () => {
    setDrugCompanySelectModalOpen(true);
  };

  const handleDrugCompanySelect = (drugCompany: DrugCompanyResponse) => {
    formik.setFieldValue('drugCompany', drugCompany);
    setDrugCompanySelectModalOpen(false);
  };

  const handleMemberSelect = (member: MemberResponse) => {
    formik.setFieldValue('memberId', member.id);
    formik.setFieldValue('memberName', member.name);
    formik.setFieldValue('companyName', member.companyName);

    setMemberSelectModalOpen(false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>{isNew ? '거래선등록' : '거래선수정'}</Typography>

      <Card component={Stack} sx={{ p: 3, gap: 3 }}>
        <Stack direction='row' sx={{ gap: 2 }}>
          <TextField
            fullWidth
            label={(formik.values.drugCompany?.name ?? '') !== '' ? '제약사명' : ''}
            placeholder={(formik.values.drugCompany?.name ?? '') === '' ? '제약사명' : ''}
            name='drugCompany'
            value={formik.values.drugCompany?.name ?? ''}
            required
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={handlePharmaceuticalSearch} edge='end'>
                    <SearchNormal1 size={20} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 0' }}
          />

          <TextField
            fullWidth
            label={formik.values.memberName !== '' ? '사용자명' : ''}
            placeholder={formik.values.memberName === '' ? '사용자명' : ''}
            value={formik.values.memberName}
            required
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position='end'>
                  <IconButton onClick={() => setMemberSelectModalOpen(true)} edge='end'>
                    <SearchNormal1 size={20} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ flex: '1 0' }}
          />
        </Stack>

        <Stack direction='row' sx={{ gap: 2 }}>
          <TextField
            fullWidth
            label='거래처코드'
            name='institutionCode'
            value={formik.values.institutionCode}
            onChange={formik.handleChange}
            placeholder={isNew ? '' : formik.values.institutionCode}
            sx={{ flex: '1 0' }}
          />

          <TextField
            fullWidth
            label='거래처명'
            name='institutionName'
            value={formik.values.institutionName}
            onChange={formik.handleChange}
            required
            sx={{ flex: '1 0' }}
          />
        </Stack>

        <Stack direction='row' sx={{ gap: 2 }}>
          <TextField
            fullWidth
            label='사업자등록번호'
            name='businessNumber'
            value={formik.values.businessNumber}
            onChange={formik.handleChange}
            required
            sx={{ flex: '1 0' }}
          />

          <TextField
            fullWidth
            select
            label='진료과'
            name='medicalDepartment'
            value={formik.values.medicalDepartment}
            onChange={formik.handleChange}
            sx={{ flex: '1 0' }}
          >
            <MenuItem value={'세미병원'}>세미병원</MenuItem>
            <MenuItem value={'종합병원'}>종합병원</MenuItem>
            <MenuItem value={'보건소'}>보건소</MenuItem>
            <MenuItem value={'가정의학과'}>가정의학과</MenuItem>
            <MenuItem value={'내과'}>내과</MenuItem>
            <MenuItem value={'마취의학과'}>마취의학과</MenuItem>
            <MenuItem value={'마취통증의학과'}>마취통증의학과</MenuItem>
            <MenuItem value={'비뇨기과'}>비뇨기과</MenuItem>
            <MenuItem value={'산부인과'}>산부인과</MenuItem>
            <MenuItem value={'성형외과'}>성형외과</MenuItem>
            <MenuItem value={'소아과'}>소아과</MenuItem>
            <MenuItem value={'신경과'}>신경과</MenuItem>
            <MenuItem value={'신경외과'}>신경외과</MenuItem>
            <MenuItem value={'신경정신과'}>신경정신과</MenuItem>
            <MenuItem value={'안과'}>안과</MenuItem>
            <MenuItem value={'일반의원'}>일반의원</MenuItem>
            <MenuItem value={'일반외과'}>일반외과</MenuItem>
            <MenuItem value={'이비인후과'}>이비인후과</MenuItem>
            <MenuItem value={'재활의학과'}>재활의학과</MenuItem>
            <MenuItem value={'정신과'}>정신과</MenuItem>
            <MenuItem value={'정형외과'}>정형외과</MenuItem>
            <MenuItem value={'치과'}>치과</MenuItem>
            <MenuItem value={'통증의학과'}>통증의학과</MenuItem>
            <MenuItem value={'피부과'}>피부과</MenuItem>
          </TextField>
        </Stack>

        <Stack sx={{ gap: 1 }}>
          <Typography variant='subtitle2' color='text.secondary'>
            문전약국
          </Typography>
          <TableContainer>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>약국명</TableCell>
                  <TableCell>약국 주소</TableCell>
                  <TableCell width={150}>상태</TableCell>
                  <TableCell width={120}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <TextField
                      fullWidth
                      size='small'
                      name='pharmacyName'
                      value={formik.values.pharmacyName}
                      onChange={formik.handleChange}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      size='small'
                      name='pharmacyAddress'
                      value={formik.values.pharmacyAddress}
                      onChange={formik.handleChange}
                    />
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size='small'>
                      <Select name='pharmacyStatus' value={formik.values.pharmacyStatus} onChange={formik.handleChange}>
                        {[PharmacyStatus.NORMAL, PharmacyStatus.CLOSED].map(pharmacyStatus => (
                          <MenuItem key={pharmacyStatus} value={pharmacyStatus}>
                            {PharmacyStatusLabel[pharmacyStatus]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>

        <TextField fullWidth label='비고' name='note' value={formik.values.note} onChange={formik.handleChange} multiline rows={4} />

        <Stack direction='row' sx={{ justifyContent: 'center', gap: 2 }}>
          <Button variant='outlined' size='large' component={RouterLink} to='/admin/partners' sx={{ minWidth: 120 }}>
            취소
          </Button>
          <Button variant='contained' size='large' onClick={formik.submitForm} sx={{ minWidth: 120 }}>
            저장
          </Button>
        </Stack>
      </Card>

      <MpDrugCompanySelectModal
        open={drugCompanySelectModalOpen}
        onClose={() => setDrugCompanySelectModalOpen(false)}
        onSelect={handleDrugCompanySelect}
      />

      <MpMemberSelectModal
        open={memberSelectModalOpen}
        onClose={() => setMemberSelectModalOpen(false)}
        onSelect={handleMemberSelect}
        additionalFilter={{
          contractStatus: ContractStatus.CONTRACT,
        }}
      />
    </Stack>
  );
}
