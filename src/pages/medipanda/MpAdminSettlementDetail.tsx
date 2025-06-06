import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  Grid,
  IconButton,
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
import { ArrowLeft, ExportSquare } from 'iconsax-react';
import { mpFetchSettlementDetail, MpSettlementDetailItem, MpSettlementDetailSearchRequest } from 'api-definitions/MpSettlement';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

export default function MpAdminSettlementDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<MpSettlementDetailItem[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      page: 0,
      size: 10,
      searchType: '거래처명',
      searchKeyword: ''
    },
    onSubmit: async (values) => {
      if (!id) return;

      setIsLoading(true);
      try {
        const searchRequest: MpSettlementDetailSearchRequest = {
          page: values.page,
          size: values.size,
          searchType: values.searchType,
          searchKeyword: values.searchKeyword || undefined
        };
        const response = await mpFetchSettlementDetail(parseInt(id), searchRequest);
        setData(response.content);
        setTotalElements(response.totalElements);
      } catch (error) {
        console.error('Failed to fetch settlement detail:', error);
        showError('정산 상세 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  useEffect(() => {
    formik.submitForm();
  }, [formik.values.page, id]);

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

  const handleBusinessPartnerClick = (id: number) => {
    navigate(`/admin/settlement/business-partner/${id}`);
  };

  const isAllSelected = selectedItems.length === data.length && data.length > 0;
  const isIndeterminate = selectedItems.length > 0 && selectedItems.length < data.length;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            mr: 2,
            bgcolor: '#F3F4F6',
            '&:hover': { bgcolor: '#E5E7EB' }
          }}
        >
          <ArrowLeft size="20" />
        </IconButton>
        <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600 }}>
          정산상세내역
        </Typography>
      </Box>

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
                <MenuItem value="거래처명">거래처명</MenuItem>
                <MenuItem value="사업자등록번호">사업자등록번호</MenuItem>
                <MenuItem value="처방코드">처방코드</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={8}>
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

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
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
                회원명
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                담당명
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                거래처명
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                사업자등록번호
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                처방코드
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                공급가액
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                세액
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                합계금액
                <br />
                (수수료율%)
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    데이터를 불러오는 중...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
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
                  <TableCell align="center">{item.memberName}</TableCell>
                  <TableCell align="center">{item.managerName}</TableCell>
                  <TableCell align="center">
                    <Typography
                      component="span"
                      sx={{
                        color: '#3B82F6',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        '&:hover': { color: '#1E40AF' }
                      }}
                      onClick={() => handleBusinessPartnerClick(item.id)}
                    >
                      {item.businessPartnerName}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">{item.businessRegistrationNumber}</TableCell>
                  <TableCell align="center">{item.prescriptionCode}</TableCell>
                  <TableCell align="center">{item.supplyAmount.toLocaleString()}</TableCell>
                  <TableCell align="center">{item.taxAmount.toLocaleString()}</TableCell>
                  <TableCell align="center">
                    {item.totalAmount.toLocaleString()}
                    <br />({item.commissionRate}%)
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
  );
}
