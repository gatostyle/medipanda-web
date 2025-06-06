import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Pagination
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { MpInquiry, MpInquirySearchRequest, mpFetchInquiryList } from 'api-definitions/MpContent';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

export default function MpAdminCustomerCenterInquiryList() {
  const navigate = useNavigate();
  const [data, setData] = useState<MpInquiry[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { showError } = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      page: 0,
      size: 10,
      contractStatus: '제약유무',
      searchType: '회원명',
      searchKeyword: '',
      startDate: null as Date | null,
      endDate: null as Date | null
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const searchRequest: MpInquirySearchRequest = {
          page: values.page,
          size: values.size,
          contractStatus: values.contractStatus === '전체' ? undefined : values.contractStatus,
          searchType: values.searchType,
          searchKeyword: values.searchKeyword || undefined,
          startDate: values.startDate ? values.startDate.toISOString().split('T')[0] : undefined,
          endDate: values.endDate ? values.endDate.toISOString().split('T')[0] : undefined
        };
        const response = await mpFetchInquiryList(searchRequest);
        setData(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error('Failed to fetch inquiry list:', error);
        showError('1:1 문의 목록을 조회하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    formik.submitForm();
  }, [formik.values.page]);

  const handleDetailClick = (id: number) => {
    navigate(`/admin/customer-center/inquiry/${id}`);
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
          1:1문의내역
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={2}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '12px', color: '#6B7280' }}>
                제약유무
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  name="contractStatus"
                  value={formik.values.contractStatus}
                  onChange={formik.handleChange}
                  sx={{
                    borderRadius: '20px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  <MenuItem value="제약유무">제약유무</MenuItem>
                  <MenuItem value="제약있음">제약있음</MenuItem>
                  <MenuItem value="제약없음">제약없음</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={2}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '12px', color: '#6B7280' }}>
                회원명
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  name="searchType"
                  value={formik.values.searchType}
                  onChange={formik.handleChange}
                  sx={{
                    borderRadius: '20px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  <MenuItem value="회원명">회원명</MenuItem>
                  <MenuItem value="홍길동">홍길동</MenuItem>
                  <MenuItem value="김영희">김영희</MenuItem>
                  <MenuItem value="이철수">이철수</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={1.5}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '12px', color: '#6B7280' }}>
                문의일시
              </Typography>
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

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                size="small"
                name="searchKeyword"
                value={formik.values.searchKeyword}
                onChange={formik.handleChange}
                placeholder="회원번호, 휴대폰번호 등으로 검색"
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

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', mb: 2 }}>
          <Typography variant="body1">
            검색결과 <strong>{totalElements.toLocaleString()}</strong> 건
          </Typography>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  No
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  회원명
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  회원번호
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  휴대폰번호
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  문의제목
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  제약유무
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  답변상태
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  문의시간
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  관리
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      데이터를 불러오는 중...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      데이터가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell align="center">{totalElements - formik.values.page * formik.values.size - index}</TableCell>
                    <TableCell align="center">{item.memberName}</TableCell>
                    <TableCell align="center">{item.inquiryNumber}</TableCell>
                    <TableCell align="center">{item.phoneNumber}</TableCell>
                    <TableCell align="center">{truncateText(item.title)}</TableCell>
                    <TableCell align="center">{item.contractStatus}</TableCell>
                    <TableCell align="center">{item.response ? '답변완료' : '미답변'}</TableCell>
                    <TableCell align="center">{item.inquiryDate}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => handleDetailClick(item.id)}
                        sx={{
                          borderColor: '#6B7280',
                          color: '#6B7280',
                          borderRadius: '12px',
                          '&:hover': {
                            borderColor: '#4B5563',
                            bgcolor: 'rgba(107, 114, 128, 0.04)'
                          }
                        }}
                      >
                        내용확인
                      </Button>
                    </TableCell>
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
      </Box>
    </LocalizationProvider>
  );
}
