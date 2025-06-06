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
import { mpFetchSettlementList, MpSettlementItem, MpSettlementSearchRequest } from 'api-definitions/MpSettlement';
import { MpPagedResponse } from 'api-definitions/MpPaged';
import FileUploadDialog from 'components/medipanda/FileUploadDialog';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

export default function MpAdminSettlementList() {
  const navigate = useNavigate();
  const [pagedResponse, setPagedResponse] = useState<MpPagedResponse<MpSettlementItem> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [uploadDialog, setUploadDialog] = useState({ open: false });
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      page: 0,
      size: 10,
      searchType: '딜러번호',
      searchKeyword: '',
      startDate: null as Date | null,
      endDate: null as Date | null
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const searchRequest: MpSettlementSearchRequest = {
          page: values.page,
          size: values.size,
          searchType: values.searchType,
          searchKeyword: values.searchKeyword || undefined,
          startDate: values.startDate ? values.startDate.toISOString().split('T')[0] : undefined,
          endDate: values.endDate ? values.endDate.toISOString().split('T')[0] : undefined
        };
        const response = await mpFetchSettlementList(searchRequest);
        setPagedResponse(response);
      } catch (error) {
        console.error('Failed to fetch settlement list:', error);
        showError('정산 내역을 조회하는 중 오류가 발생했습니다.');
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
      setSelectedItems(pagedResponse?.content.map((item) => item.id) || []);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id: number) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]));
  };

  const handleRowClick = (id: number) => {
    navigate(`/admin/settlement/${id}`);
  };

  const isAllSelected = selectedItems.length === (pagedResponse?.content.length ?? 0) && (pagedResponse?.content.length ?? 0) > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < (pagedResponse?.content.length ?? 0);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ko}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
          정산내역
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
                  <MenuItem value="딜러번호">딜러번호</MenuItem>
                  <MenuItem value="제약사명">제약사명</MenuItem>
                  <MenuItem value="회원명">회원명</MenuItem>
                  <MenuItem value="딜러명">딜러명</MenuItem>
                  <MenuItem value="기타여부">기타여부</MenuItem>
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
          <Typography variant="body1">
            검색결과 <strong>{pagedResponse?.totalElements ?? 0}</strong> 건
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<DocumentUpload />}
              onClick={() => setUploadDialog({ open: true })}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '4px',
                fontSize: '14px',
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              파일업로드
            </Button>
            <Button
              variant="contained"
              startIcon={<ExportSquare />}
              onClick={() => openNotImplementedDialog('엑셀 다운로드')}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '4px',
                fontSize: '14px',
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              엑셀 다운로드
            </Button>
          </Box>
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
                  딜러번호
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
                  공급가액
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  세액
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  합계금액
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
              ) : (pagedResponse?.content.length ?? 0) === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280' }}>
                      데이터가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (pagedResponse?.content ?? []).map((item, index) => (
                  <TableRow key={item.id} hover sx={{ cursor: 'pointer' }} onClick={() => handleRowClick(item.id)}>
                    <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        sx={{ color: '#9CA3AF' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      {(pagedResponse?.totalElements ?? 0) - formik.values.page * formik.values.size - index}
                    </TableCell>
                    <TableCell align="center">{item.assignmentNumber}</TableCell>
                    <TableCell align="center">{item.settlementMonth}</TableCell>
                    <TableCell align="center">{item.pharmaceuticalCompany}</TableCell>
                    <TableCell align="center">
                      <Typography
                        component="span"
                        sx={{
                          color: '#3B82F6',
                          textDecoration: 'underline',
                          '&:hover': { color: '#1E40AF' }
                        }}
                      >
                        {item.memberName}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">{item.agentName}</TableCell>
                    <TableCell align="center">{item.prescriptionAmount.toLocaleString()}</TableCell>
                    <TableCell align="center">{item.supplyAmount.toLocaleString()}</TableCell>
                    <TableCell align="center">{item.taxAmount.toLocaleString()}</TableCell>
                    <TableCell align="center">{item.totalAmount.toLocaleString()}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.approvalStatus}
                        sx={{
                          bgcolor: '#10B981',
                          color: 'white',
                          fontSize: '12px',
                          fontWeight: 600,
                          borderRadius: '4px'
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
            count={Math.ceil((pagedResponse?.totalElements ?? 0) / formik.values.size)}
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

        <FileUploadDialog open={uploadDialog.open} onClose={() => setUploadDialog({ open: false })} />
      </Box>
    </LocalizationProvider>
  );
}
