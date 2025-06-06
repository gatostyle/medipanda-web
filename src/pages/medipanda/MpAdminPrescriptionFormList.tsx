import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { mpFetchPrescriptionForms, MpPrescriptionForm, MpPrescriptionFormSearchRequest } from 'api-definitions/MpPrescriptionForm';

interface FormValues {
  userName: string;
  approvalStatus: string;
  startDate: string;
  endDate: string;
  searchKeyword: string;
}

export default function MpAdminPrescriptionFormList() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [prescriptionForms, setPrescriptionForms] = useState<MpPrescriptionForm[]>([]);

  const showErrorSnackbar = (message: string) => {
    enqueueSnackbar(message, { variant: 'error' });
  };

  const formik = useFormik<FormValues>({
    initialValues: {
      userName: '',
      approvalStatus: '',
      startDate: '',
      endDate: '',
      searchKeyword: ''
    },
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const searchRequest: MpPrescriptionFormSearchRequest = {
          page: 0,
          size: 100,
          userName: values.userName,
          approvalStatus: values.approvalStatus,
          startDate: values.startDate,
          endDate: values.endDate,
          searchKeyword: values.searchKeyword
        };
        const response = await mpFetchPrescriptionForms(searchRequest);
        setPrescriptionForms(response.content || []);
      } catch (error) {
        console.error('처방전 목록 조회 오류:', error);
        showErrorSnackbar('처방전 목록을 조회하는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }
  });

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const response = await mpFetchPrescriptionForms({ page: 0, size: 100 });
      setPrescriptionForms(response.content || []);
    } catch (error) {
      console.error('처방전 목록 조회 오류:', error);
      showErrorSnackbar('처방전 목록을 조회하는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(prescriptionForms.map((form) => form.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleBusinessNameClick = (form: MpPrescriptionForm) => {
    navigate(`/admin/prescription/forms/products/${form.id}`, {
      state: {
        businessName: form.businessName,
        managerCode: form.managerCode,
        dealerNumber: form.dealerNumber,
        businessNumber: form.businessNumber,
        prescriptionDate: form.prescriptionDate,
        settlementDate: form.settlementDate,
        prescriptionAmount: form.prescriptionAmount
      }
    });
  };

  const handleRegister = () => {
    navigate('/admin/prescription/forms/register');
  };

  const handleManage = (form: MpPrescriptionForm) => {
    navigate('/admin/prescription/forms/register', {
      state: {
        editMode: true,
        formData: form
      }
    });
  };

  const filteredForms = useMemo(() => {
    return prescriptionForms.filter((form) => {
      const matchesUserName = !formik.values.userName || form.userName.includes(formik.values.userName);
      const matchesStatus = !formik.values.approvalStatus || form.inputStatus === formik.values.approvalStatus;
      const matchesKeyword =
        !formik.values.searchKeyword ||
        Object.values(form).some((value) => value.toString().toLowerCase().includes(formik.values.searchKeyword.toLowerCase()));
      return matchesUserName && matchesStatus && matchesKeyword;
    });
  }, [prescriptionForms, formik.values]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        처방입력
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                name="userName"
                value={formik.values.userName}
                onChange={formik.handleChange}
                placeholder="회원명"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#10B981'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <Select
                  name="approvalStatus"
                  value={formik.values.approvalStatus}
                  onChange={formik.handleChange}
                  displayEmpty
                  sx={{
                    borderRadius: '20px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#10B981'
                    }
                  }}
                >
                  <MenuItem value="">승인상태</MenuItem>
                  <MenuItem value="입력완료">입력완료</MenuItem>
                  <MenuItem value="입력대기">입력대기</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                name="startDate"
                value={formik.values.startDate}
                onChange={formik.handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#10B981'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                type="date"
                name="endDate"
                value={formik.values.endDate}
                onChange={formik.handleChange}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#10B981'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                size="small"
                name="searchKeyword"
                value={formik.values.searchKeyword}
                onChange={formik.handleChange}
                placeholder="검색어"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#10B981'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                sx={{
                  bgcolor: '#6B7280',
                  borderRadius: '20px',
                  '&:hover': { bgcolor: '#4B5563' }
                }}
              >
                검색
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1">
          검색결과: <strong>{filteredForms.length}</strong> 건
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => showErrorSnackbar('삭제')}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 3,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            삭제
          </Button>
          <Button
            variant="contained"
            onClick={handleRegister}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 3,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            등록
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>
                <Checkbox
                  checked={selectedRows.length === filteredForms.length && filteredForms.length > 0}
                  indeterminate={selectedRows.length > 0 && selectedRows.length < filteredForms.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell sx={{ fontWeight: 600 }}>No</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>딜러번호</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>아이디</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>회원명</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>거래처코드</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>거래처명</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>사업자등록번호</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>처방월</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>정산월</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>등록일</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>처방금액</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>입력상태</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>관리</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredForms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={14} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    검색 결과가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredForms.map((form, index) => (
                <TableRow key={form.id} hover>
                  <TableCell>
                    <Checkbox checked={selectedRows.includes(form.id)} onChange={(e) => handleSelectRow(form.id, e.target.checked)} />
                  </TableCell>
                  <TableCell>{form.sequence || index + 1}</TableCell>
                  <TableCell>{form.dealerNumber}</TableCell>
                  <TableCell>{form.userId}</TableCell>
                  <TableCell>{form.userName}</TableCell>
                  <TableCell>{form.managerCode}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: '#3B82F6',
                        textDecoration: 'underline',
                        cursor: 'pointer',
                        '&:hover': { color: '#1E40AF' }
                      }}
                      onClick={() => handleBusinessNameClick(form)}
                    >
                      {form.businessName}
                    </Typography>
                  </TableCell>
                  <TableCell>{form.businessNumber}</TableCell>
                  <TableCell>{form.prescriptionDate}</TableCell>
                  <TableCell>{form.settlementDate}</TableCell>
                  <TableCell>{form.registrationDate}</TableCell>
                  <TableCell>{form.prescriptionAmount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        bgcolor: form.inputStatus === '입력완료' ? '#DCFCE7' : '#FEF3C7',
                        color: form.inputStatus === '입력완료' ? '#059669' : '#D97706',
                        px: 2,
                        py: 0.5,
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textAlign: 'center',
                        display: 'inline-block'
                      }}
                    >
                      {form.inputStatus}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleManage(form)}
                      sx={{
                        bgcolor: '#10B981',
                        borderRadius: '6px',
                        '&:hover': { bgcolor: '#059669' }
                      }}
                    >
                      관리
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
