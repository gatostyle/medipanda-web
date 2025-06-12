import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
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
  InputAdornment
} from '@mui/material';
import { SearchNormal1, Add, Minus } from 'iconsax-react';
import {
  MpPartnerPharmacyRow,
  MpPartnerPharmaceuticalCompany,
  MpPartnerCompanySearchResult,
  mpGetPartnerPharmaceuticalCompanies,
  mpGetPartnerCompanySearchResults,
  mpGetPartnerEmptyPharmacyRow
} from 'medipanda/api-definitions/MpPartnerEdit';

export default function MpAdminPartnerEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  const [pharmaceuticalSearchOpen, setPharmaceuticalSearchOpen] = useState(false);
  const [companySearchOpen, setCompanySearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [companySearchKeyword, setCompanySearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<MpPartnerPharmaceuticalCompany[]>([]);
  const [companySearchResults, setCompanySearchResults] = useState<MpPartnerCompanySearchResult[]>([]);
  const [emptyPharmacyRow, setEmptyPharmacyRow] = useState<MpPartnerPharmacyRow | null>(null);
  const [pharmacyRows, setPharmacyRows] = useState<MpPartnerPharmacyRow[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      const [pharmCompanies, companyResults, emptyRow] = await Promise.all([
        mpGetPartnerPharmaceuticalCompanies(),
        mpGetPartnerCompanySearchResults(),
        mpGetPartnerEmptyPharmacyRow()
      ]);
      setSearchResults(pharmCompanies);
      setCompanySearchResults(companyResults);
      setEmptyPharmacyRow(emptyRow);
      setPharmacyRows([{ ...emptyRow, id: 1 }]);
    };
    loadInitialData();
  }, []);

  const formik = useFormik({
    initialValues: {
      drugCompany: '',
      companyName: '',
      institutionCode: '',
      institutionName: '',
      businessNumber: '',
      medicalDepartment: '',
      notes: ''
    },
    onSubmit: async (values) => {
      console.log('Form submitted:', values, pharmacyRows);
      navigate('/admin/partners');
    }
  });

  const handlePharmaceuticalSearch = () => {
    setPharmaceuticalSearchOpen(true);
  };

  const handlePharmaceuticalSelect = (company: MpPartnerPharmaceuticalCompany) => {
    formik.setFieldValue('drugCompany', company.name);
    setPharmaceuticalSearchOpen(false);
  };

  const handleCompanySearch = () => {
    setCompanySearchOpen(true);
  };

  const handleCompanySelect = (company: MpPartnerCompanySearchResult) => {
    formik.setFieldValue('companyName', company.name);
    setCompanySearchOpen(false);
  };

  const handleAddPharmacy = () => {
    if (!emptyPharmacyRow) return;
    const newId = Math.max(...pharmacyRows.map((r) => r.id)) + 1;
    setPharmacyRows([...pharmacyRows, { ...emptyPharmacyRow, id: newId }]);
  };

  const handleRemovePharmacy = (id: number) => {
    if (pharmacyRows.length > 1) {
      setPharmacyRows(pharmacyRows.filter((row) => row.id !== id));
    }
  };

  const handlePharmacyChange = (id: number, field: keyof MpPartnerPharmacyRow, value: unknown) => {
    setPharmacyRows(pharmacyRows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  };

  const handleCancel = () => {
    navigate('/admin/partners');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        거래선등록
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Card sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="제약사명"
                name="drugCompany"
                value={formik.values.drugCompany}
                onChange={formik.handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handlePharmaceuticalSearch} edge="end">
                        <SearchNormal1 size={20} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="회사명"
                name="companyName"
                value={formik.values.companyName}
                onChange={formik.handleChange}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleCompanySearch} edge="end">
                        <SearchNormal1 size={20} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="거래처코드"
                name="institutionCode"
                value={formik.values.institutionCode}
                disabled
                placeholder={isEditMode ? formik.values.institutionCode : ''}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="거래처명"
                name="institutionName"
                value={formik.values.institutionName}
                onChange={formik.handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="사업자등록번호"
                name="businessNumber"
                value={formik.values.businessNumber}
                onChange={formik.handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="진료과"
                name="medicalDepartment"
                value={formik.values.medicalDepartment}
                onChange={formik.handleChange}
              >
                <MenuItem value="">선택</MenuItem>
                <MenuItem value={'DERMATOLOGY'}>피부과</MenuItem>
                <MenuItem value={'INTERNAL_MEDICINE'}>내과</MenuItem>
                <MenuItem value={'ORTHOPEDICS'}>정형외과</MenuItem>
                <MenuItem value={'PEDIATRICS'}>소아과</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                문전약국
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>약국명</TableCell>
                      <TableCell>약국 주소</TableCell>
                      <TableCell width={150}>정산</TableCell>
                      <TableCell width={120}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pharmacyRows.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={row.pharmacyName}
                            onChange={(e) => handlePharmacyChange(row.id, 'pharmacyName', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            fullWidth
                            size="small"
                            value={row.pharmacyAddress}
                            onChange={(e) => handlePharmacyChange(row.id, 'pharmacyAddress', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            fullWidth
                            size="small"
                            value={row.state ? 'true' : 'false'}
                            onChange={(e) => handlePharmacyChange(row.id, 'state', e.target.value === 'true')}
                          >
                            <MenuItem value={'true'}>정상</MenuItem>
                            <MenuItem value={'false'}>폐업</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={handleAddPharmacy}
                              startIcon={<Add size={16} />}
                            >
                              +추가
                            </Button>
                            {pharmacyRows.length > 1 && (
                              <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleRemovePharmacy(row.id)}
                                startIcon={<Minus size={16} />}
                                sx={{ bgcolor: 'grey.500', '&:hover': { bgcolor: 'grey.600' } }}
                              >
                                -삭제
                              </Button>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="비고"
                name="notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                multiline
                rows={4}
              />
            </Grid>
          </Grid>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button variant="outlined" size="large" onClick={handleCancel} sx={{ minWidth: 120 }}>
              취소
            </Button>
            <Button variant="contained" color="success" size="large" type="submit" sx={{ minWidth: 120 }}>
              저장
            </Button>
          </Stack>
        </Card>
      </form>

      <Dialog open={pharmaceuticalSearchOpen} onClose={() => setPharmaceuticalSearchOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>제약사 조회</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="검색어를 입력하세요"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <Button variant="contained" size="small">
                검색
              </Button>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>제약사명</TableCell>
                    <TableCell align="center" width={100}>
                      선택
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {searchResults.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell align="center">
                        <Button variant="contained" size="small" onClick={() => handlePharmaceuticalSelect(company)}>
                          선택
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction="row" justifyContent="center">
              <Button onClick={() => setPharmaceuticalSearchOpen(false)}>취소</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog open={companySearchOpen} onClose={() => setCompanySearchOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>회사명 조회</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                size="small"
                placeholder="검색어를 입력하세요"
                value={companySearchKeyword}
                onChange={(e) => setCompanySearchKeyword(e.target.value)}
              />
              <Button variant="contained" size="small">
                검색
              </Button>
            </Stack>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>회사명</TableCell>
                    <TableCell align="center" width={100}>
                      선택
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companySearchResults.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell>{company.name}</TableCell>
                      <TableCell align="center">
                        <Button variant="contained" size="small" onClick={() => handleCompanySelect(company)}>
                          선택
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Stack direction="row" justifyContent="center">
              <Button onClick={() => setCompanySearchOpen(false)}>취소</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
