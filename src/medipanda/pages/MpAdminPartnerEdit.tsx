import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
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
import { useFormik } from 'formik';
import { SearchNormal1 } from 'iconsax-react';
import {
  createPartner,
  DrugCompanyResponse,
  getDrugCompanies,
  getPartnerDetails,
  getPartners,
  PartnerResponse,
  updatePartner,
} from '@/medipanda/backend';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSession } from '../hooks/useSession';

export default function MpAdminPartnerEdit() {
  const { session } = useSession();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [pharmaceuticalSearchOpen, setPharmaceuticalSearchOpen] = useState(false);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [drugCompanies, setDrugCompanies] = useState<DrugCompanyResponse[]>([]);
  const [partnerSearchResult, setPartnerSearchResult] = useState<PartnerResponse[]>([]);
  // const [emptyPharmacyRow, setEmptyPharmacyRow] = useState<MpPartnerPharmacyRow | null>(null);
  // const [pharmacyRows, setPharmacyRows] = useState<MpPartnerPharmacyRow[]>([]);

  const isNew = id === undefined;

  useEffect(() => {
    getDrugCompanies().then(setDrugCompanies);
    if (id) {
      fetchPartnerData(parseInt(id));
    }
  }, [id]);

  const fetchPartnerData = async (partnerId: number) => {
    setLoading(true);
    try {
      const partnerDetails = await getPartnerDetails(partnerId);

      // const [emptyRow] = await Promise.all([mpGetPartnerEmptyPharmacyRow()]);

      // setPharmacyRows([{ ...emptyRow, id: 1 }]);

      formik.setValues({
        drugCompany: { id: -1, name: partnerDetails.drugCompanyName, code: '' },
        companyName: partnerDetails.companyName,
        contractType: partnerDetails.contractType,
        institutionCode: partnerDetails.institutionCode,
        institutionName: partnerDetails.institutionName,
        businessNumber: partnerDetails.businessNumber,
        medicalDepartment: partnerDetails.medicalDepartment ?? '',
        pharmacyName: partnerDetails.pharmacyName ?? '',
        pharmacyAddress: partnerDetails.pharmacyAddress ?? '',
        pharmacyStatus: partnerDetails.pharmacyStatus,
        note: partnerDetails.note ?? '',
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
      companyName: '',
      contractType: null as ('CONTRACT' | 'NON_CONTRACT') | null,
      institutionCode: '',
      institutionName: '',
      businessNumber: '',
      medicalDepartment: '',
      pharmacyName: '',
      pharmacyAddress: '',
      pharmacyStatus: 'NONE' as ('NORMAL' | 'CLOSED' | 'DELETED' | 'NONE') | null,
      note: '',
    },
    onSubmit: async values => {
      if (isNew) {
        await createPartner({
          drugCompanyId: values.drugCompany!.id,
          userId: session!.userId,
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
      } else
        await updatePartner(parseInt(id!), {
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

      alert('거래선 정보가 저장되었습니다.');
      navigate('/admin/partners');
    },
  });

  const partnerSearchFormik = useFormik({
    initialValues: {
      companyName: '',
      pageIndex: 0,
      pageSize: 20,
    },
    onSubmit: async values => {
      const response = await getPartners({
        companyName: values.companyName !== '' ? values.companyName : undefined,
        page: values.pageIndex,
        size: values.pageSize,
      });
      setPartnerSearchResult(response.content);
    },
  });

  const handlePharmaceuticalSearch = () => {
    setPharmaceuticalSearchOpen(true);
  };

  const handlePharmaceuticalSelect = (drugCompany: DrugCompanyResponse) => {
    formik.setFieldValue('drugCompany', drugCompany);
    setPharmaceuticalSearchOpen(false);
  };

  const handleCompanySearch = () => {
    partnerSearchFormik.submitForm();
    setCompanySearchOpen(true);
  };

  const handlePartnerSelect = (partner: PartnerResponse) => {
    formik.setFieldValue('companyName', partner.companyName);
    setCompanySearchOpen(false);
  };

  // const handleAddPharmacy = () => {
  //   if (!emptyPharmacyRow) return;
  //   const newId = Math.max(...pharmacyRows.map((r) => r.id)) + 1;
  //   setPharmacyRows([...pharmacyRows, { ...emptyPharmacyRow, id: newId }]);
  // };

  // const handleRemovePharmacy = (id: number) => {
  //   if (pharmacyRows.length > 1) {
  //     setPharmacyRows(pharmacyRows.filter((row) => row.id !== id));
  //   }
  // };

  // const handlePharmacyChange = (id: number, field: keyof MpPartnerPharmacyRow, value: unknown) => {
  //   setPharmacyRows(pharmacyRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  // };

  const handleCancel = () => {
    navigate('/admin/partners');
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
                value={formik.values.drugCompany?.name}
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
                label='회사명'
                name='companyName'
                value={formik.values.companyName}
                onChange={formik.handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={handleCompanySearch} edge='end'>
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
                label='거래처코드'
                name='institutionCode'
                value={formik.values.institutionCode}
                disabled
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
                <MenuItem value={'DERMATOLOGY'}>피부과</MenuItem>
                <MenuItem value={'INTERNAL_MEDICINE'}>내과</MenuItem>
                <MenuItem value={'ORTHOPEDICS'}>정형외과</MenuItem>
                <MenuItem value={'PEDIATRICS'}>소아과</MenuItem>
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
                            <MenuItem value={'NORMAL'}>정상</MenuItem>
                            <MenuItem value={'CLOSED'}>폐업</MenuItem>
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
            <Button variant='outlined' size='large' onClick={handleCancel} sx={{ minWidth: 120 }}>
              취소
            </Button>
            <Button variant='contained' color='success' size='large' type='submit' sx={{ minWidth: 120 }}>
              저장
            </Button>
          </Stack>
        </Card>
      </form>

      <Dialog open={pharmaceuticalSearchOpen} onClose={() => setPharmaceuticalSearchOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>제약사 조회</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>제약사명</TableCell>
                    <TableCell align='center' width={100}>
                      선택
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {drugCompanies.map(drugCompany => (
                    <TableRow key={drugCompany.id}>
                      <TableCell>{drugCompany.name}</TableCell>
                      <TableCell align='center'>
                        <Button variant='contained' size='small' onClick={() => handlePharmaceuticalSelect(drugCompany)}>
                          선택
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction='row' justifyContent='center'>
              <Button onClick={() => setPharmaceuticalSearchOpen(false)}>취소</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={companySearchOpen} onClose={() => setCompanySearchOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>회사명 조회</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack direction='row' spacing={1} component='form' noValidate onSubmit={partnerSearchFormik.handleSubmit}>
              <TextField
                fullWidth
                size='small'
                placeholder='검색어를 입력하세요'
                name='companyName'
                onChange={partnerSearchFormik.handleChange}
              />
              <Button variant='contained' size='small' type='submit'>
                검색
              </Button>
            </Stack>

            <TableContainer>
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <TableCell>회사명</TableCell>
                    <TableCell align='center' width={100}>
                      선택
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partnerSearchResult.map(partner => (
                    <TableRow key={partner.id}>
                      <TableCell>{partner.companyName}</TableCell>
                      <TableCell align='center'>
                        <Button variant='contained' size='small' onClick={() => handlePartnerSelect(partner)}>
                          선택
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction='row' justifyContent='center'>
              <Button onClick={() => setCompanySearchOpen(false)}>취소</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
