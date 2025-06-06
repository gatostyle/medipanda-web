import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  Grid,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ko } from 'date-fns/locale';
import { DocumentUpload, ExportSquare } from 'iconsax-react';
import { MpApprovedItem, MpApprovedSearchRequest, mpFetchApprovedList } from 'api-definitions/MpAdjustment';
import FileUploadDialog from 'components/medipanda/FileUploadDialog';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

export default function MpAdminAdjustmentApprovedList() {
  const navigate = useNavigate();
  const [data, setData] = useState<MpApprovedItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [fileUploadOpen, setFileUploadOpen] = useState(false);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      page: 0,
      size: 10,
      searchType: '회원명',
      searchKeyword: '',
      startDate: null as Date | null,
      endDate: null as Date | null
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const searchRequest: MpApprovedSearchRequest = {
          page: values.page,
          size: values.size,
          searchType: values.searchType,
          searchKeyword: values.searchKeyword || undefined,
          startDate: values.startDate ? values.startDate.toISOString().split('T')[0] : undefined,
          endDate: values.endDate ? values.endDate.toISOString().split('T')[0] : undefined
        };
        const response = await mpFetchApprovedList(searchRequest);
        setData(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error('Failed to fetch approved list:', error);
        showError('승인내역을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    formik.submitForm();
  }, [formik.values.page]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(data.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  const handleMemberClick = (id: number) => {
    navigate(`/admin/adjustment/approved/${id}`);
  };

  const isAllSelected = selectedItems.length === data.length && data.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
          승인내역
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="body2" sx={{ mb: 2, fontWeight: 500 }}>
            검색 조건
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={2}>
              <FormControl fullWidth size="small">
                <Select
                  name="searchType"
                  value={formik.values.searchType}
                  onChange={formik.handleChange}
                  displayEmpty
                  sx={{
                    borderRadius: '4px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  <MenuItem value="회원명">회원명</MenuItem>
                  <MenuItem value="담당명">담당명</MenuItem>
                  <MenuItem value="딜러번호">딜러번호</MenuItem>
                  <MenuItem value="제약사명">제약사명</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={2}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '12px', color: '#6B7280' }}>
                시작일
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
                        borderRadius: '4px',
                        '& fieldset': {
                          borderColor: '#D1D5DB'
                        }
                      }
                    }
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={2}>
              <Typography variant="body2" sx={{ mb: 1, fontSize: '12px', color: '#6B7280' }}>
                종료일
              </Typography>
              <DatePicker
                value={formik.values.endDate}
                onChange={(date) => formik.setFieldValue('endDate', date)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: {
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
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
                placeholder="검색어를 입력하세요"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '4px',
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
                  borderRadius: '4px',
                  '&:hover': { bgcolor: '#4B5563' }
                }}
              >
                검색
              </Button>
            </Grid>
          </Grid>
        </Paper>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body1">
              검색결과 <strong>{totalElements}</strong> 건
            </Typography>
            <Button
              variant="contained"
              startIcon={<ExportSquare />}
              onClick={() => openNotImplementedDialog('Excel 다운로드')}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '4px',
                fontSize: '14px',
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              Excel
            </Button>
          </Box>
          <Button
            variant="contained"
            startIcon={<DocumentUpload />}
            onClick={() => setFileUploadOpen(true)}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '4px',
              fontSize: '14px',
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            파일업로드
          </Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    sx={{ color: '#9CA3AF' }}
                  />
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  No
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  담당번호
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  정산월
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  제약사명
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  회원명
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  딜러명
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  처방금액
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  승인금액
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  차액
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  사용자확인
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  승인
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      데이터를 불러오는 중...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      데이터가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={item.id} hover>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        sx={{ color: '#9CA3AF' }}
                      />
                    </TableCell>
                    <TableCell align="center">{totalElements - formik.values.page * formik.values.size - index}</TableCell>
                    <TableCell align="center">{item.assignmentNumber}</TableCell>
                    <TableCell align="center">{item.settlementMonth}</TableCell>
                    <TableCell align="center">{item.pharmaceuticalCompany}</TableCell>
                    <TableCell align="center">
                      <Typography
                        component="span"
                        sx={{
                          color: '#3B82F6',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          '&:hover': { color: '#1E40AF' }
                        }}
                        onClick={() => handleMemberClick(item.id)}
                      >
                        {item.memberName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{item.agentName}</TableCell>
                    <TableCell align="center">{item.prescriptionAmount.toLocaleString()}</TableCell>
                    <TableCell align="center">{item.approvedAmount.toLocaleString()}</TableCell>
                    <TableCell align="center">{item.difference.toLocaleString()}</TableCell>
                    <TableCell align="center">{item.userConfirmed ? '정산요청' : '-'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label="승인"
                        sx={{
                          bgcolor: '#10B981',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 500,
                          borderRadius: '16px',
                          height: '24px'
                        }}
                      />
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

        <FileUploadDialog open={fileUploadOpen} onClose={() => setFileUploadOpen(false)} />
      </Box>
    </LocalizationProvider>
  );
}
