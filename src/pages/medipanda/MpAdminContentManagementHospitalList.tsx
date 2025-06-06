import { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  FormControl,
  Grid,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { AttachCircle, CloseCircle } from 'iconsax-react';
import { MpHospital, MpHospitalSearchRequest, mpFetchHospitalList } from 'api-definitions/MpContent';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

export default function MpAdminContentManagementHospitalList() {
  const [data, setData] = useState<MpHospital[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      page: 0,
      size: 10,
      region: '시도',
      district: '시군구',
      searchKeyword: '',
      startDate: null as Date | null,
      endDate: null as Date | null
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const searchRequest: MpHospitalSearchRequest = {
          page: values.page,
          size: values.size,
          region: values.region === '시도' ? undefined : values.region,
          district: values.district === '시군구' ? undefined : values.district,
          searchKeyword: values.searchKeyword || undefined,
          startDate: values.startDate ? values.startDate.toISOString().split('T')[0] : undefined,
          endDate: values.endDate ? values.endDate.toISOString().split('T')[0] : undefined
        };
        const response = await mpFetchHospitalList(searchRequest);
        setData(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error('Failed to fetch hospital list:', error);
        showError('병원 목록을 조회하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    formik.submitForm();
  }, [formik.values.page]);

  const handleExcelUpload = () => {
    setUploadDialog(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
          개원병원페이지
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={1.5}>
              <FormControl fullWidth size="small">
                <Select
                  name="region"
                  value={formik.values.region}
                  onChange={formik.handleChange}
                  sx={{
                    borderRadius: '20px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  <MenuItem value="시도">시도</MenuItem>
                  <MenuItem value="서울">서울</MenuItem>
                  <MenuItem value="경기">경기</MenuItem>
                  <MenuItem value="인천">인천</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={1.5}>
              <FormControl fullWidth size="small">
                <Select
                  name="district"
                  value={formik.values.district}
                  onChange={formik.handleChange}
                  sx={{
                    borderRadius: '20px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  <MenuItem value="시군구">시군구</MenuItem>
                  <MenuItem value="강남구">강남구</MenuItem>
                  <MenuItem value="고양시">고양시</MenuItem>
                  <MenuItem value="성남시">성남시</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={1.5}>
              <DatePicker
                value={formik.values.startDate}
                onChange={(date) => formik.setFieldValue('startDate', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        '& fieldset': {
                          borderColor: '#D1D5DB'
                        }
                      }
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={1.5}>
              <DatePicker
                value={formik.values.endDate}
                onChange={(date) => formik.setFieldValue('endDate', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '20px',
                        '& fieldset': {
                          borderColor: '#D1D5DB'
                        }
                      }
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                name="searchKeyword"
                value={formik.values.searchKeyword}
                onChange={formik.handleChange}
                placeholder=""
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    '& fieldset': {
                      borderColor: '#D1D5DB'
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={() => formik.submitForm()}
                sx={{
                  bgcolor: '#6B7280',
                  borderRadius: '20px',
                  height: '40px',
                  '&:hover': { bgcolor: '#4B5563' }
                }}
              >
                검색
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1">
            검색결과 <strong>{totalElements.toLocaleString()}</strong> 건
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              onClick={handleExcelUpload}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '20px',
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              엑셀업로드
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#10B981',
                borderRadius: '20px',
                '&:hover': { bgcolor: '#059669' }
              }}
              onClick={() => openNotImplementedDialog('작성')}
            >
              작성
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  No
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  지역
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  병의원명
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  주소
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  회가개설일
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  분류
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      데이터를 불러오는 중...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      데이터가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell align="center">{totalElements - formik.values.page * formik.values.size - index}</TableCell>
                    <TableCell align="center">{item.region}</TableCell>
                    <TableCell align="center">{item.hospitalName}</TableCell>
                    <TableCell align="center">{item.address}</TableCell>
                    <TableCell align="center">{item.registrationDate}</TableCell>
                    <TableCell align="center">{item.category}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(totalElements / formik.values.size)}
            page={formik.values.page + 1}
            onChange={(_, page) => formik.setFieldValue('page', page - 1)}
            disabled={isLoading}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '4px'
              },
              '& .Mui-selected': {
                bgcolor: '#6366F1 !important',
                color: 'white'
              }
            }}
          />
        </Box>

        <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">개원병원정보 업로드</Typography>
            <IconButton onClick={() => setUploadDialog(false)}>
              <CloseCircle size="20" />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AttachCircle size="48" color="#6B7280" />
              <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                파일을 선택하거나 여기로 드래그하세요
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                엑셀 파일(.xlsx, .xls)만 업로드 가능합니다
              </Typography>
              <Button
                variant="contained"
                onClick={() => openNotImplementedDialog('파일 업로드')}
                sx={{
                  bgcolor: '#10B981',
                  borderRadius: '20px',
                  px: 4,
                  '&:hover': { bgcolor: '#059669' }
                }}
              >
                파일 선택
              </Button>
            </Box>
          </DialogContent>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
}
