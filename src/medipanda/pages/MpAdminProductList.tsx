import AttachFileIcon from '@mui/icons-material/AttachFile';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import {
  getDownloadProductSummariesExcel,
  getProductSummaries,
  ProductSummaryResponse,
  updateProductExtraInfo_1,
  uploadProductExtraInfo
} from 'medipanda/backend';
import { useMpDeleteDialog } from 'medipanda/hooks/useMpDeleteDialog';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MpAdminProductList() {
  const [data, setData] = useState<Sequenced<ProductSummaryResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [rateTableDialogOpen, setRateTableDialogOpen] = useState(false);
  const [rateTableFile, setRateTableFile] = useState<File | null>(null);
  const notImplementedDialog = useMpNotImplementedDialog();
  const deleteDialog = useMpDeleteDialog();
  const errorDialog = useMpErrorDialog();
  const infoDialog = useMpInfoDialog();

  const formik = useFormik({
    initialValues: {
      searchType: 'productName' as 'productName' | 'productCode' | 'manufacturerName' | 'composition' | 'note',
      searchKeyword: '',
      isAcquisition: false,
      isPromotion: false,
      isOutOfStock: false,
      isStopSelling: false,
      pageIndex: 0,
      pageSize: 20
    },
    onSubmit: async () => {
      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    }
  });

  const getStatusDisplay = (product: ProductSummaryResponse): string => {
    const statuses: string[] = [];
    if (product.isAcquisition) statuses.push('취급품목');
    if (product.isPromotion) statuses.push('프로모션');
    if (product.isOutOfStock) statuses.push('품절');
    if (product.isStopSelling) statuses.push('판매중단');
    return statuses.join(', ');
  };

  const getChangedRateDisplay = (product: ProductSummaryResponse): string => {
    if (product.changedFeeRate && product.changedMonth) {
      return `${product.changedFeeRate}% (${product.changedMonth})`;
    } else if (product.changedFeeRate) {
      return `${product.changedFeeRate}%`;
    }
    return '-';
  };

  const columns = useMemo<ColumnDef<Sequenced<ProductSummaryResponse>>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedItems.length === data.length && data.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems(data.map((item) => item.id));
              } else {
                setSelectedItems([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedItems.includes(row.original.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems((prev) => [...prev, row.original.id]);
              } else {
                setSelectedItems((prev) => prev.filter((id) => id !== row.original.id));
              }
            }}
          />
        ),
        size: 50
      },
      {
        header: 'No',
        accessorKey: 'sequence',
        cell: ({ row }) => row.original.sequence,
        size: 60
      },
      {
        header: '제약사',
        accessorKey: 'manufacturerName',
        cell: ({ row }) => row.original.manufacturerName ?? '-',
        size: 150
      },
      {
        header: '제품명',
        accessorKey: 'productName',
        cell: ({ row }) => (
          <Link to={`/admin/products/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.productName ?? '-'}
          </Link>
        ),
        size: 300
      },
      {
        header: '성분명',
        accessorKey: 'composition',
        cell: ({ row }) => row.original.composition ?? '-',
        size: 250
      },
      {
        header: '제품코드',
        accessorKey: 'productCode',
        cell: ({ row }) => row.original.productCode,
        size: 120
      },
      {
        header: '약가',
        accessorKey: 'price',
        cell: ({ row }) => {
          return row.original.price !== null ? `${row.original.price.toLocaleString()}` : '-';
        },
        size: 100
      },
      {
        header: '기본수수료율',
        accessorKey: 'feeRate',
        cell: ({ row }) => (row.original.feeRate !== null ? `${row.original.feeRate}%` : '-'),
        size: 120
      },
      {
        header: '변경요율',
        accessorKey: 'changedFeeRate',
        cell: ({ row }) => getChangedRateDisplay(row.original),
        size: 120
      },
      {
        header: '상태',
        accessorKey: 'status',
        cell: ({ row }) => getStatusDisplay(row.original),
        size: 200
      },
      {
        header: '비고',
        accessorKey: 'note',
        cell: ({ row }) => row.original.note ?? '-',
        size: 200
      }
    ],
    [data, selectedItems]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: formik.values.pageIndex,
        pageSize: formik.values.pageSize
      }
    },
    pageCount: totalPages,
    manualPagination: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getProductSummaries({
        productName: formik.values.searchType === 'productName' ? formik.values.searchKeyword : undefined,
        composition: formik.values.searchType === 'composition' ? formik.values.searchKeyword : undefined,
        productCode: formik.values.searchType === 'productCode' ? formik.values.searchKeyword : undefined,
        manufacturerName: formik.values.searchType === 'manufacturerName' ? formik.values.searchKeyword : undefined,
        note: formik.values.searchType === 'note' ? formik.values.searchKeyword : undefined,
        isAcquisition: formik.values.isAcquisition || undefined,
        isPromotion: formik.values.isPromotion || undefined,
        isOutOfStock: formik.values.isOutOfStock || undefined,
        isStopSelling: formik.values.isStopSelling || undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch product list:', error);
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  const handleDelete = () => {
    const count = selectedItems.length;
    const message =
      count === 1
        ? `제품 ${data.find((item) => item.id === selectedItems[0])?.productName}을 삭제하시겠습니까?`
        : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedItems.map((id) => updateProductExtraInfo_1(id)));
          setSelectedItems([]);
          fetchData();
        } catch (error) {
          console.error('Failed to delete products:', error);
        }
      }
    });
  };

  const handleRateTableUpload = async () => {
    if (!rateTableFile) return;

    try {
      await uploadProductExtraInfo({ file: rateTableFile });
      infoDialog.showInfo('요율표를 성공적으로 업로드했습니다.');
      await fetchData();
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to upload rate table:', error);
        errorDialog.showError('요율표 업로드 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          제품관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <Select
                      name="searchType"
                      value={formik.values.searchType}
                      onChange={(e) => formik.setFieldValue('searchType', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="productName">제품명</MenuItem>
                      <MenuItem value="productCode">제품코드</MenuItem>
                      <MenuItem value="manufacturerName">제약사</MenuItem>
                      <MenuItem value="composition">성분명</MenuItem>
                      <MenuItem value="note">비고</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    name="searchKeyword"
                    size="small"
                    placeholder="검색어를 입력해주세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={formik.values.isAcquisition}
                          onChange={(e) => formik.setFieldValue('isAcquisition', e.target.checked)}
                        />
                      }
                      label="취급품목"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={formik.values.isPromotion}
                          onChange={(e) => formik.setFieldValue('isPromotion', e.target.checked)}
                        />
                      }
                      label="프로모션"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={formik.values.isOutOfStock}
                          onChange={(e) => formik.setFieldValue('isOutOfStock', e.target.checked)}
                        />
                      }
                      label="품절"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={formik.values.isStopSelling}
                          onChange={(e) => formik.setFieldValue('isStopSelling', e.target.checked)}
                        />
                      }
                      label="판매중단"
                    />
                  </FormGroup>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button variant="contained" size="small" type="submit">
                      검색
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </Box>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  href={getDownloadProductSummariesExcel({
                    productName: formik.values.searchType === 'productName' ? formik.values.searchKeyword : undefined,
                    composition: formik.values.searchType === 'composition' ? formik.values.searchKeyword : undefined,
                    productCode: formik.values.searchType === 'productCode' ? formik.values.searchKeyword : undefined,
                    manufacturerName: formik.values.searchType === 'manufacturerName' ? formik.values.searchKeyword : undefined,
                    note: formik.values.searchType === 'note' ? formik.values.searchKeyword : undefined,
                    isAcquisition: formik.values.isAcquisition || undefined,
                    isPromotion: formik.values.isPromotion || undefined,
                    isOutOfStock: formik.values.isOutOfStock || undefined,
                    isStopSelling: formik.values.isStopSelling || undefined,
                    page: formik.values.pageIndex,
                    size: formik.values.pageSize
                  })}
                  target="_blank"
                  sx={{
                    bgcolor: 'success.main',
                    color: 'white',
                    '&:hover': { bgcolor: 'success.dark' }
                  }}
                >
                  <FileDownloadIcon fontSize="small" />
                </IconButton>
                <Button variant="contained" color="error" size="small" disabled={selectedItems.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant="contained" color="success" size="small" component={Link} to="/admin/products/new">
                  추가
                </Button>
                <Button variant="contained" color="success" size="small" onClick={() => setRateTableDialogOpen(true)}>
                  요율표업로드
                </Button>
              </Stack>
            </Stack>

            <ScrollX>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableCell key={header.id} style={{ width: header.getSize() }}>
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            데이터를 로드하는 중입니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            검색 결과가 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollX>

            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={formik.values.pageIndex + 1}
                onChange={(_, value) => {
                  formik.setFieldValue('pageIndex', value - 1);
                }}
                color="primary"
                variant="outlined"
                showFirstButton
                showLastButton
              />
            </Stack>
          </Box>
        </MainCard>
      </Grid>

      <Dialog open={rateTableDialogOpen} onClose={() => setRateTableDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>요율표업로드</DialogTitle>
        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
          <Button
            variant="contained"
            color="success"
            size="small"
            href={import.meta.env.VITE_APP_URL_FILE_PRODUCT_RATE_TABLE}
            target="_blank"
          >
            양식 다운로드
          </Button>
        </Box>
        <DialogContent sx={{ textAlign: 'center', py: 4 }}>
          <Button variant="contained" color="success" component="label" startIcon={<AttachFileIcon />} sx={{ px: 4, py: 2 }}>
            파일
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setRateTableFile(file);
                }
              }}
            />
          </Button>
          {rateTableFile && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              선택된 파일: {rateTableFile.name}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button
            variant="contained"
            color="inherit"
            onClick={() => {
              setRateTableDialogOpen(false);
              setRateTableFile(null);
            }}
            sx={{ px: 4 }}
          >
            취소
          </Button>
          <Button variant="contained" color="success" onClick={handleRateTableUpload} disabled={!rateTableFile} sx={{ px: 4 }}>
            업데이트
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
