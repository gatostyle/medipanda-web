import {
  DateString,
  getDownloadSettlementListExcel,
  getSettlements,
  SettlementResponse,
  SettlementStatus,
  SettlementStatusLabel,
  uploadSettlementExcel,
} from '@/backend';
import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import { formatYyyyMm, SafeDate } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
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
import { DatePicker } from '@mui/x-date-pickers';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { DocumentDownload } from 'iconsax-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { ArrayElement } from 'type-fest/source/internal';

export default function MpAdminSettlementList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'dealerId' | 'companyName' | '',
    searchKeyword: '',
    settlementMonth: '',
    status: '' as SettlementStatus | '',
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
  const [contents, setContents] = useState<Sequenced<SettlementResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { alert, alertError } = useMpModal();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      settlementMonth: null as Date | null,
      page: null,
    },
    onSubmit: async values => {
      if (values.searchType === '' && values.searchKeyword !== '') {
        await alert('검색유형을 선택해주세요.');
        return;
      }

      if (values.searchType === 'dealerId' && values.searchKeyword !== '' && Number.isNaN(Number(values.searchKeyword))) {
        await alert('딜러번호는 숫자만 입력할 수 있습니다.');
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
      const response = await getSettlements({
        dealerName: undefined,
        dealerId: searchType === 'dealerId' && searchKeyword !== '' ? Number(searchKeyword) : undefined,
        companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
        status: status !== '' ? status : undefined,
        startMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
        endMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch settlement list:', error);
      await alertError('정산내역 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    formik.setValues({
      status,
      settlementMonth,
      searchType,
      searchKeyword,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, settlementMonth, status, page]);

  const table = useReactTable({
    data: contents,
    columns: useMemo<ColumnDef<ArrayElement<typeof contents>>[]>(
      () => [
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
          header: '딜러번호',
          cell: ({ row }) => row.original.dealerId,
          size: 100,
        },
        {
          header: '정산월',
          cell: ({ row }) => formatYyyyMm(row.original.settlementMonth),
          size: 100,
        },
        {
          header: '회사명',
          cell: ({ row }) => row.original.companyName,
          size: 150,
        },
        {
          header: '딜러명',
          cell: ({ row }) => (
            <Link component={RouterLink} to={`/admin/settlements/${row.original.id}`}>
              {row.original.dealerName}
            </Link>
          ),
          size: 100,
        },
        {
          header: '처방금액',
          cell: ({ row }) => row.original.prescriptionAmount.toLocaleString(),
          size: 120,
        },
        {
          header: '공급가액',
          cell: ({ row }) => row.original.supplyAmount.toLocaleString(),
          size: 120,
        },
        {
          header: '세액',
          cell: ({ row }) => row.original.taxAmount.toLocaleString(),
          size: 100,
        },
        {
          header: '합계금액',
          cell: ({ row }) => row.original.totalAmount.toLocaleString(),
          size: 120,
        },
        {
          header: '사용자확인',
          cell: ({ row }) => (row.original.status !== null ? SettlementStatusLabel[row.original.status] : '-'),
          size: 100,
        },
      ],
      [],
    ),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const handleFileUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async e => {
      try {
        await uploadSettlementExcel({ file: (e.target as HTMLInputElement).files![0] });
        await alert('정산 파일을 업로드했습니다.');
        await fetchContents();
      } catch (error) {
        console.error('Failed to upload file:', error);
        await alertError('파일 업로드 중 오류가 발생했습니다.');
      }
    };
    input.click();
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          정산내역
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>사용자확인</InputLabel>
                    <Select name='status' value={formik.values.status} onChange={formik.handleChange}>
                      {Object.keys(SettlementStatus).map(settlementStatus => (
                        <MenuItem key={settlementStatus} value={settlementStatus}>
                          {SettlementStatusLabel[settlementStatus]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={'dealerId'}>딜러번호</MenuItem>
                      <MenuItem value={'companyName'}>회사명</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <DatePicker
                    value={formik.values.settlementMonth}
                    onChange={value => formik.setFieldValue('settlementMonth', value)}
                    format='yyyy-MM'
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
                  href={getDownloadSettlementListExcel({
                    dealerName: undefined,
                    dealerId: searchType === 'dealerId' && searchKeyword !== '' ? Number(searchKeyword) : undefined,
                    companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
                    status: status !== '' ? status : undefined,
                    startMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
                    endMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
                    size: 2 ** 31 - 1,
                  })}
                  target='_blank'
                  startIcon={<DocumentDownload size={16} />}
                >
                  Excel
                </Button>
                <Button variant='contained' color='success' size='small' onClick={handleFileUpload}>
                  파일 업로드
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
    </Grid>
  );
}
