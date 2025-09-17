import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Card,
  FormControl,
  InputLabel,
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
import { DatePicker } from '@mui/x-date-pickers';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { DocumentDownload } from 'iconsax-reactjs';
import { DateString, getDownloadPerformanceExcel, getPerformanceStats, type PerformanceStatsResponse, SettlementStatus } from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { DATEFORMAT_YYYY_MM, formatYyyyMm, SafeDate } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminStatisticsList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'drugCompany' | 'companyName' | 'dealerName' | 'institutionName' | '',
    searchKeyword: '',
    settlementMonth: '',
    status: '' as keyof typeof SettlementStatus | '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    settlementMonth: paramSettlementMonth,
    status,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const settlementMonth = useMemo(() => SafeDate(paramSettlementMonth) ?? null, [paramSettlementMonth]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<PerformanceStatsResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPrescriptionAmount, setTotalPrescriptionAmount] = useState(0);

  const { alert, alertError } = useMpModal();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      settlementMonth: null as Date | null,
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
          settlementMonth: values.settlementMonth !== null ? formatYyyyMm(values.settlementMonth) : undefined,
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
      const response = await getPerformanceStats({
        drugCompany: searchType === 'drugCompany' && searchKeyword !== '' ? searchKeyword : undefined,
        companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
        dealerName: searchType === 'dealerName' && searchKeyword !== '' ? searchKeyword : undefined,
        institutionName: searchType === 'institutionName' && searchKeyword !== '' ? searchKeyword : undefined,
        startMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
        endMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setTotalPrescriptionAmount(response.content.reduce((sum, item) => sum + item.prescriptionAmount, 0));
    } catch (error) {
      console.error('Failed to fetch performance statistics:', error);
      await alertError('실적통계 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
      setTotalPrescriptionAmount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    formik.setValues({
      searchType,
      searchKeyword,
      settlementMonth,
      status,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, settlementMonth, status, page]);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '제약사명',
        cell: ({ row }) => row.original.drugCompany,
        size: 120,
      },
      {
        header: '회사명',
        cell: ({ row }) => row.original.companyName,
        size: 120,
      },
      {
        header: '딜러명',
        cell: ({ row }) => row.original.dealerName,
        size: 100,
      },
      {
        header: '거래처코드',
        cell: ({ row }) => row.original.institutionCode,
        size: 120,
      },
      {
        header: '거래처명',
        cell: ({ row }) => row.original.institutionName,
        size: 120,
      },
      {
        header: '정산월',
        cell: ({ row }) => formatYyyyMm(row.original.settlementMonth),
        size: 100,
      },
      {
        header: '처방금액',
        cell: ({ row }) => row.original.prescriptionAmount.toLocaleString(),
        size: 120,
      },
      {
        header: '합계금액',
        cell: ({ row }) => row.original.totalAmount.toLocaleString(),
        size: 120,
      },
      {
        header: '수수료금액',
        cell: ({ row }) => row.original.feeAmount.toLocaleString(),
        size: 120,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>실적통계</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={formik.handleSubmit}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>검색유형</InputLabel>
              <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                <MenuItem value={'drugCompany'}>제약사명</MenuItem>
                <MenuItem value={'companyName'}>회사명</MenuItem>
                <MenuItem value={'dealerName'}>딜러명</MenuItem>
                <MenuItem value={'institutionName'}>거래처명</MenuItem>
              </Select>
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <DatePicker
              value={formik.values.settlementMonth}
              onChange={value => formik.setFieldValue('settlementMonth', value)}
              format={DATEFORMAT_YYYY_MM}
              views={['year', 'month']}
              label='정산월'
              slotProps={{
                textField: {
                  size: 'small',
                },
              }}
            />
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
          <SearchFilterActions>
            <Button variant='contained' size='small' type='submit'>
              검색
            </Button>
            <Button variant='outlined' size='small' onClick={() => formik.resetForm()}>
              초기화
            </Button>
          </SearchFilterActions>
        </MpSearchFilterBar>
      </Card>

      <Card sx={{ padding: 3 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
          <Stack direction='row' spacing={2}>
            <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
            <Typography variant='subtitle1'>총 처방금액: {totalPrescriptionAmount.toLocaleString()}원</Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Button
              variant='contained'
              color='success'
              size='small'
              href={getDownloadPerformanceExcel({
                drugCompany: searchType === 'drugCompany' && searchKeyword !== '' ? searchKeyword : undefined,
                companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
                dealerName: searchType === 'dealerName' && searchKeyword !== '' ? searchKeyword : undefined,
                institutionName: searchType === 'institutionName' && searchKeyword !== '' ? searchKeyword : undefined,
                startMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
                endMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
                size: 2 ** 31 - 1,
              })}
              target='_blank'
              startIcon={<DocumentDownload size={16} />}
            >
              Excel
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
                      {flexRender(header.column.columnDef.header, header.getContext())}
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
