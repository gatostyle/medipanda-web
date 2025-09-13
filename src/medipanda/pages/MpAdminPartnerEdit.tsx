import { MpDrugCompanySelectModal } from '@/medipanda/components/MpDrugCompanySelectModal';
import { MpMemberSelectModal } from '@/medipanda/components/MpMemberSelectModal';
import {
  Box,
  Button,
  Card,
  CircularProgress,
  FormControl,
  Grid,
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
import { useNavigate, useParams } from 'react-router-dom';

export default function MpAdminPartnerEdit() {
  const navigate = useNavigate();
  const { partnerId: paramPartnerId } = useParams();
  const isNew = paramPartnerId === undefined;
  const partnerId = Number(paramPartnerId);

  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [drugCompanySelectModalOpen, setDrugCompanySelectModalOpen] = useState(false);
  const [memberSelectModalOpen, setMemberSelectModalOpen] = useState(false);

  useEffect(() => {
    if (!isNew) {
      fetchDetail(partnerId);
    }
  }, [isNew, partnerId]);

  const fetchDetail = async (partnerId: number) => {
    if (Number.isNaN(partnerId)) {
      alert('잘못된 접근입니다.');
      return navigate('/admin/partners');
    }

    setLoading(true);
    try {
      const detail = await getPartnerDetails(partnerId);

      // const [emptyRow] = await Promise.all([mpGetPartnerEmptyPharmacyRow()]);

      // setPharmacyRows([{ ...emptyRow, id: 1 }]);

      formik.setValues({
        drugCompany: { id: -1, name: detail.drugCompanyName, code: '' },
        member: null,
        companyName: detail.companyName,
        contractType: detail.contractType as ContractStatus,
        institutionCode: detail.institutionCode,
        institutionName: detail.institutionName,
        businessNumber: detail.businessNumber,
        medicalDepartment: detail.medicalDepartment ?? '',
        pharmacyName: detail.pharmacyName ?? '',
        pharmacyAddress: detail.pharmacyAddress ?? '',
        pharmacyStatus: detail.pharmacyStatus as PharmacyStatus | null,
        note: detail.note ?? '',
      });
    } catch (error) {
      console.error('Failed to fetch partner data:', error);
      enqueueSnackbar('거래선 정보를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      drugCompany: null as DrugCompanyResponse | null,
      member: null as MemberResponse | null,
      companyName: '',
      contractType: ContractStatus.CONTRACT,
      institutionCode: '',
      institutionName: '',
      businessNumber: '',
      medicalDepartment: '',
      pharmacyName: '',
      pharmacyAddress: '',
      pharmacyStatus: PharmacyStatus.NORMAL as PharmacyStatus | null,
      note: '',
    },
    onSubmit: async values => {
      if (values.drugCompany === null) {
        alert('제약사를 선택해주세요.');
        return;
      }

      if (values.member === null) {
        alert('사용자를 선택해주세요.');
        return;
      }

      try {
        if (isNew) {
          await createPartner({
            drugCompanyId: values.drugCompany!.id,
            userId: values.member!.userId,
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

        alert('거래선 정보가 저장되었습니다.');
        navigate('/admin/partners');
      } catch (e) {
        if (e instanceof AxiosError && e.response?.status === 409) {
          alert('해당 제약사-거래처 조합이 이미 등록되어 있습니다. 다시 확인해주세요.');
          return;
        }

        console.error(e);
        alert('거래선 정보 저장에 실패했습니다. 다시 시도해주세요.');
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
    formik.setFieldValue('member', member);
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
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 3 }}>
        {isNew ? '거래선등록' : '거래선수정'}
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Card sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='제약사명'
                name='drugCompany'
                value={formik.values.drugCompany?.name ?? ''}
                required
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={handlePharmaceuticalSearch} edge='end'>
                        <SearchNormal1 size={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='사용자명'
                value={formik.values.member?.name ?? ''}
                required
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setMemberSelectModalOpen(true)} edge='end'>
                        <SearchNormal1 size={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/*<Grid item xs={12} md={6}>*/}
            {/*  <TextField*/}
            {/*    fullWidth*/}
            {/*    label='회사명'*/}
            {/*    name='companyName'*/}
            {/*    value={formik.values.companyName}*/}
            {/*    onChange={formik.handleChange}*/}
            {/*    required*/}
            {/*    InputProps={{*/}
            {/*      endAdornment: (*/}
            {/*        <InputAdornment position='end'>*/}
            {/*          <IconButton onClick={handleCompanySearch} edge='end'>*/}
            {/*            <SearchNormal1 size={20} />*/}
            {/*          </IconButton>*/}
            {/*        </InputAdornment>*/}
            {/*      ),*/}
            {/*    }}*/}
            {/*  />*/}
            {/*</Grid>*/}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='거래처코드'
                name='institutionCode'
                value={formik.values.institutionCode}
                onChange={formik.handleChange}
                placeholder={isNew ? '' : formik.values.institutionCode}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='거래처명'
                name='institutionName'
                value={formik.values.institutionName}
                onChange={formik.handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label='사업자등록번호'
                name='businessNumber'
                value={formik.values.businessNumber}
                onChange={formik.handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label='진료과'
                name='medicalDepartment'
                value={formik.values.medicalDepartment}
                onChange={formik.handleChange}
              >
                <MenuItem value=''>선택</MenuItem>
                <MenuItem value={'피부과'}>피부과</MenuItem>
                <MenuItem value={'내과'}>내과</MenuItem>
                <MenuItem value={'정형외과'}>정형외과</MenuItem>
                <MenuItem value={'소아과'}>소아과</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='subtitle1' gutterBottom>
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
                    {/*{pharmacyRows.map((row) => (*/}
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
                      <TableCell>
                        {/*<Stack direction="row" spacing={1}>*/}
                        {/*  <Button*/}
                        {/*    variant="contained"*/}
                        {/*    color="success"*/}
                        {/*    size="small"*/}
                        {/*    onClick={handleAddPharmacy}*/}
                        {/*    startIcon={<Add size={16} />}*/}
                        {/*  >*/}
                        {/*    +추가*/}
                        {/*  </Button>*/}
                        {/*  {pharmacyRows.length > 1 && (*/}
                        {/*    <Button*/}
                        {/*      variant="contained"*/}
                        {/*      size="small"*/}
                        {/*      onClick={() => handleRemovePharmacy(row.id)}*/}
                        {/*      startIcon={<Minus size={16} />}*/}
                        {/*      sx={{ bgcolor: 'grey.500', '&:hover': { bgcolor: 'grey.600' } }}*/}
                        {/*    >*/}
                        {/*      -삭제*/}
                        {/*    </Button>*/}
                        {/*  )}*/}
                        {/*</Stack>*/}
                      </TableCell>
                    </TableRow>
                    {/*))}*/}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <TextField fullWidth label='비고' name='note' value={formik.values.note} onChange={formik.handleChange} multiline rows={4} />
            </Grid>
          </Grid>

          <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 4 }}>
            <Button variant='outlined' size='large' onClick={() => window.history.back()} sx={{ minWidth: 120 }}>
              취소
            </Button>
            <Button variant='contained' size='large' type='submit' sx={{ minWidth: 120 }}>
              저장
            </Button>
          </Stack>
        </Card>
      </form>

      <MpDrugCompanySelectModal
        open={drugCompanySelectModalOpen}
        onClose={() => setDrugCompanySelectModalOpen(false)}
        onSelect={handleDrugCompanySelect}
      />

      <MpMemberSelectModal open={memberSelectModalOpen} onClose={() => setMemberSelectModalOpen(false)} onSelect={handleMemberSelect} />
    </Box>
  );
}
