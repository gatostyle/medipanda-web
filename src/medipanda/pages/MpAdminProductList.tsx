import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { MpProductUploadModal } from '@/medipanda/components/MpProductUploadModal';
import { DocumentDownload } from 'iconsax-react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Pagination,
  PaginationItem,
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
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { getDownloadProductSummariesExcel, getProductSummaries, ProductSummaryResponse, softDelete } from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminProductList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'productName' | 'productCode' | 'manufacturerName' | 'composition' | 'note' | '',
    searchKeyword: '',
    isAcquisition: 'false',
    isPromotion: 'false',
    isOutOfStock: 'false',
    isStopSelling: 'false',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    isAcquisition: paramIsAcquisition,
    isPromotion: paramIsPromotion,
    isOutOfStock: paramIsOutOfStock,
    isStopSelling: paramIsStopSelling,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const isAcquisition = paramIsAcquisition === 'true';
  const isPromotion = paramIsPromotion === 'true';
  const isOutOfStock = paramIsOutOfStock === 'true';
  const isStopSelling = paramIsStopSelling === 'true';
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<ProductSummaryResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const [productUploadModalOpen, setProductUploadModalOpen] = useState(false);

  const deleteDialog = useMpDeleteDialog();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      isAcquisition: false,
      isPromotion: false,
      isOutOfStock: false,
      isStopSelling: false,
      page: null,
    },
    onSubmit: values => {
      const url = setUrlParams(
        {
          ...values,
          page: 1,
        },
        initialSearchParams,
      );

      navigate(url);
    },
    onReset: () => {
      navigate('');
    },
  });

  const fetchContents = async () => {
    if (searchType === '' && searchKeyword !== '') {
      alert('검색유형을 선택해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await getProductSummaries({
        productName: searchType === 'productName' && searchKeyword !== '' ? searchKeyword : undefined,
        composition: searchType === 'composition' && searchKeyword !== '' ? searchKeyword : undefined,
        productCode: searchType === 'productCode' && searchKeyword !== '' ? searchKeyword : undefined,
        manufacturerName: searchType === 'manufacturerName' && searchKeyword !== '' ? searchKeyword : undefined,
        note: searchType === 'note' && searchKeyword !== '' ? searchKeyword : undefined,
        isAcquisition: isAcquisition || undefined,
        isPromotion: isPromotion || undefined,
        isOutOfStock: isOutOfStock || undefined,
        isStopSelling: isStopSelling || undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch product list:', error);
      alert('제품 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    formik.setValues({
      searchType,
      searchKeyword,
      isAcquisition,
      isPromotion,
      isOutOfStock,
      isStopSelling,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, isAcquisition, isPromotion, isOutOfStock, isStopSelling, page]);

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

  const table = useReactTable({
    data: contents,
    columns: [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedIds.length === contents.length && contents.length > 0}
            onChange={e => {
              if (e.target.checked) {
                setSelectedIds(contents.map(item => item.id));
              } else {
                setSelectedIds([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedIds(prev => [...prev, row.original.id]);
              } else {
                setSelectedIds(prev => prev.filter(id => id !== row.original.id));
              }
            }}
          />
        ),
        size: 50,
      },
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '제약사',
        cell: ({ row }) => row.original.manufacturerName ?? '-',
        size: 150,
      },
      {
        header: '제품명',
        cell: ({ row }) => (
          <Link component={RouterLink} to={`/admin/products/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.productName ?? '-'}
          </Link>
        ),
        size: 300,
      },
      {
        header: '성분명',
        cell: ({ row }) => row.original.composition ?? '-',
        size: 250,
      },
      {
        header: '제품코드',
        cell: ({ row }) => row.original.productCode,
        size: 120,
      },
      {
        header: '약가',
        cell: ({ row }) => {
          return row.original.price !== null ? `${row.original.price.toLocaleString()}` : '-';
        },
        size: 100,
      },
      {
        header: '기본수수료율',
        cell: ({ row }) => (row.original.feeRate !== null ? `${row.original.feeRate}%` : '-'),
        size: 120,
      },
      {
        header: '변경요율',
        cell: ({ row }) => getChangedRateDisplay(row.original),
        size: 120,
      },
      {
        header: '상태',
        cell: ({ row }) => getStatusDisplay(row.original),
        size: 200,
      },
      {
        header: '비고',
        cell: ({ row }) => row.original.note ?? '-',
        size: 200,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleDelete = () => {
    const count = selectedIds.length;
    const message =
      count === 1
        ? `제품 ${contents.find(item => item.id === selectedIds[0])?.productName}을 삭제하시겠습니까?`
        : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => softDelete(id)));
          setSelectedIds([]);
          fetchContents();
        } catch (error) {
          console.error('Failed to delete products:', error);
        }
      },
    });
  };

  const handleProductUploadSuccess = async () => {
    await fetchContents();
    setProductUploadModalOpen(false);
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          제품관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={'productName'}>제품명</MenuItem>
                      <MenuItem value={'productCode'}>제품코드</MenuItem>
                      <MenuItem value={'manufacturerName'}>제약사</MenuItem>
                      <MenuItem value={'composition'}>성분명</MenuItem>
                      <MenuItem value={'note'}>비고</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    name='searchKeyword'
                    size='small'
                    placeholder='검색어를 입력하세요'
                    fullWidth
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterItem minWidth={300}>
                  <FormGroup row>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size='small'
                          checked={formik.values.isAcquisition}
                          onChange={e => formik.setFieldValue('isAcquisition', e.target.checked)}
                        />
                      }
                      label='취급품목'
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size='small'
                          checked={formik.values.isPromotion}
                          onChange={e => formik.setFieldValue('isPromotion', e.target.checked)}
                        />
                      }
                      label='프로모션'
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size='small'
                          checked={formik.values.isOutOfStock}
                          onChange={e => formik.setFieldValue('isOutOfStock', e.target.checked)}
                        />
                      }
                      label='품절'
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          size='small'
                          checked={formik.values.isStopSelling}
                          onChange={e => formik.setFieldValue('isStopSelling', e.target.checked)}
                        />
                      }
                      label='판매중단'
                    />
                  </FormGroup>
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button variant='contained' size='small' type='submit'>
                    검색
                  </Button>
                  <Button variant='outlined' size='small' onClick={() => formik.resetForm()}>
                    초기화
                  </Button>
                </SearchFilterActions>
              </SearchFilterBar>
            </form>
          </Box>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 2 }}>
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
              <Stack direction='row' spacing={2}>
                <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
              </Stack>
              <Stack direction='row' spacing={1}>
                <Button
                  variant='contained'
                  color='success'
                  size='small'
                  href={getDownloadProductSummariesExcel({
                    productName: searchType === 'productName' && searchKeyword !== '' ? searchKeyword : undefined,
                    composition: searchType === 'composition' && searchKeyword !== '' ? searchKeyword : undefined,
                    productCode: searchType === 'productCode' && searchKeyword !== '' ? searchKeyword : undefined,
                    manufacturerName: searchType === 'manufacturerName' && searchKeyword !== '' ? searchKeyword : undefined,
                    note: searchType === 'note' && searchKeyword !== '' ? searchKeyword : undefined,
                    isAcquisition: isAcquisition || undefined,
                    isPromotion: isPromotion || undefined,
                    isOutOfStock: isOutOfStock || undefined,
                    isStopSelling: isStopSelling || undefined,
                    size: 2 ** 31 - 1,
                  })}
                  target='_blank'
                  startIcon={<DocumentDownload size={16} />}
                >
                  Excel
                </Button>
                <Button variant='contained' color='success' size='small' onClick={() => setProductUploadModalOpen(true)}>
                  요율표 업로드
                </Button>
                <Button variant='contained' color='error' size='small' disabled={selectedIds.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant='contained' color='success' size='small' component={RouterLink} to='/admin/products/new'>
                  등록
                </Button>
              </Stack>
            </Stack>

            <ScrollX>
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
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
                        <TableCell colSpan={table.getAllColumns().length} align='center' sx={{ py: 3 }}>
                          <Typography variant='body2' color='text.secondary'>
                            데이터를 로드하는 중입니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={table.getAllColumns().length} align='center' sx={{ py: 3 }}>
                          <Typography variant='body2' color='text.secondary'>
                            검색 결과가 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollX>

            <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                renderItem={item => (
                  <PaginationItem
                    {...item}
                    color='primary'
                    variant='outlined'
                    component={RouterLink}
                    to={setUrlParams({ page: item.page }, initialSearchParams)}
                  />
                )}
                color='primary'
                variant='outlined'
                showFirstButton
                showLastButton
              />
            </Stack>
          </Box>
        </MainCard>
      </Grid>

      <MpProductUploadModal
        open={productUploadModalOpen}
        onClose={() => setProductUploadModalOpen(false)}
        onSuccess={handleProductUploadSuccess}
      />
    </Grid>
  );
}
