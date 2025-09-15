import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import { DatePicker } from '@mui/x-date-pickers';
import { DocumentDownload } from 'iconsax-react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  FormControl,
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
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import {
  DateString,
  deleteSalesAgencyProduct,
  getDownloadSalesAgencyProductsExcel,
  getSalesAgencyProducts,
  SalesAgencyProductSummaryResponse,
} from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { formatYyyyMmDd, SafeDate } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminSalesAgencyProductList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'productName' | 'clientName' | '',
    searchKeyword: '',
    date: '',
    page: '1',
  };

  const { searchType, searchKeyword, date: paramDate, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const date = useMemo(() => SafeDate(paramDate) ?? null, [paramDate]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<SalesAgencyProductSummaryResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const deleteDialog = useMpDeleteDialog();
  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      date: null as Date | null,
      page: null,
    },
    onSubmit: async values => {
      if (values.searchType === '' && values.searchKeyword !== '') {
        await alert('검색유형을 선택하세요.');
        return;
      }

      const url = setUrlParams(
        {
          ...values,
          date: values.date !== null ? formatYyyyMmDd(values.date) : undefined,
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
    setLoading(true);
    try {
      const response = await getSalesAgencyProducts({
        productName: searchType === 'productName' && searchKeyword !== '' ? searchKeyword : undefined,
        clientName: searchType === 'clientName' && searchKeyword !== '' ? searchKeyword : undefined,
        startAt: date ? new DateString(date) : undefined,
        endAt: date ? new DateString(date) : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch sales agency product list:', error);
      await alertError('영업대행상품 목록을 불러오는 중 오류가 발생했습니다.');
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
      date,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, date, page]);

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
        header: '썸네일',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={row.original.thumbnailUrl ?? ''}
              alt='썸네일'
              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
            />
          </Box>
        ),
        size: 80,
      },
      {
        header: '위탁사',
        cell: ({ row }) => row.original.clientName,
        size: 150,
      },
      {
        header: '상품명',
        cell: ({ row }) => (
          <Link component={RouterLink} to={`/admin/sales-agency-products/${row.original.id}`}>
            {row.original.productName}
          </Link>
        ),
        size: 300,
      },
      {
        header: '판매가',
        cell: ({ row }) => row.original.price.toLocaleString(),
        size: 100,
      },
      {
        header: '계약일',
        cell: ({ row }) => formatYyyyMmDd(row.original.contractDate),
        size: 120,
      },
      {
        header: '노출상태',
        cell: ({ row }) => {
          const isExposed = row.original.isExposed;
          return <Chip label={isExposed ? '노출' : '미노출'} size='small' color={isExposed ? 'success' : 'default'} />;
        },
        size: 100,
      },
      {
        header: '게시기간',
        cell: ({ row }) => {
          return `${formatYyyyMmDd(row.original.startAt)} ~ ${formatYyyyMmDd(row.original.endAt)}`;
        },
        size: 200,
      },
      {
        header: '신청자 수',
        cell: ({ row }) => `${row.original.appliedCount}명`,
        size: 100,
      },
      {
        header: '판매수량',
        cell: ({ row }) => row.original.quantity.toLocaleString(),
        size: 100,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDelete = () => {
    const count = selectedIds.length;
    const message =
      count === 1
        ? `상품 ${contents.find(item => item.id === selectedIds[0])?.productName}를 삭제하시겠습니까?`
        : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => deleteSalesAgencyProduct(id)));
          enqueueSnackbar('삭제가 완료되었습니다.', { variant: 'success' });
          setSelectedIds([]);
          fetchContents();
        } catch (error) {
          console.error('Failed to delete sales agency products:', error);
          await alertError('상품 삭제 중 오류가 발생했습니다.');
        }
      },
    });
  };

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4' gutterBottom>
        영업대행상품
      </Typography>

      <Card sx={{ padding: 3 }}>
        <SearchFilterBar component='form' onSubmit={formik.handleSubmit}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>검색유형</InputLabel>
              <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                <MenuItem value={'productName'}>상품명</MenuItem>
                <MenuItem value={'clientName'}>위탁사</MenuItem>
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
          <SearchFilterItem minWidth={140}>
            <DatePicker
              value={formik.values.date}
              onChange={value => formik.setFieldValue('date', value)}
              format='yyyy-MM-dd'
              views={['year', 'month', 'day']}
              label='등록일'
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
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
      </Card>

      <Card sx={{ padding: 3 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
          <Stack direction='row' spacing={2}>
            <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Button
              variant='contained'
              color='success'
              size='small'
              href={getDownloadSalesAgencyProductsExcel({
                productName: searchType === 'productName' && searchKeyword !== '' ? searchKeyword : undefined,
                clientName: searchType === 'clientName' && searchKeyword !== '' ? searchKeyword : undefined,
                startAt: date ? new DateString(date) : undefined,
                endAt: date ? new DateString(date) : undefined,
                size: 2 ** 31 - 1,
              })}
              target='_blank'
              startIcon={<DocumentDownload size={16} />}
            >
              Excel
            </Button>
            <Button variant='contained' color='error' size='small' disabled={selectedIds.length === 0} onClick={handleDelete}>
              삭제
            </Button>
            <Button variant='contained' color='success' size='small' component={RouterLink} to='/admin/sales-agency-products/new'>
              등록
            </Button>
          </Stack>
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
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
      </Card>
    </Stack>
  );
}
