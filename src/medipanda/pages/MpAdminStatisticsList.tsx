import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Pagination,
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
import { DocumentDownload } from 'iconsax-react';
import { DateString, getDownloadPerformanceExcel, getPerformanceStats, PerformanceStatsResponse } from '@/backend';
import MpFormikDatePicker from '@/medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { formatYyyyMm } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useState } from 'react';

interface PerformanceStatsResponseWithMockData extends PerformanceStatsResponse {
  baseFeeRate: number;
}

function withMock<T extends PerformanceStatsResponse>(data: T): T & PerformanceStatsResponseWithMockData {
  return {
    ...data,
    baseFeeRate: 0.1,
  };
}

export default function MpAdminStatisticsList() {
  const [data, setData] = useState<Sequenced<PerformanceStatsResponseWithMockData>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPrescriptionAmount, setTotalPrescriptionAmount] = useState(0);
  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      searchType: 'companyName' as 'drugCompany' | 'companyName' | 'dealerName' | 'institutionName',
      searchKeyword: '',
      settlementDate: null as Date | null,
      pageIndex: 0,
      pageSize: 20,
    },
    onSubmit: async () => {
      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    },
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getPerformanceStats({
        drugCompany: formik.values.searchType === 'drugCompany' ? formik.values.searchKeyword : undefined,
        companyName: formik.values.searchType === 'companyName' ? formik.values.searchKeyword : undefined,
        dealerName: formik.values.searchType === 'dealerName' ? formik.values.searchKeyword : undefined,
        institutionName: formik.values.searchType === 'institutionName' ? formik.values.searchKeyword : undefined,
        startMonth: formik.values.settlementDate ? new DateString(formik.values.settlementDate) : undefined,
        endMonth: formik.values.settlementDate ? new DateString(formik.values.settlementDate) : undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
      });

      setData(withSequence(response).content.map(withMock));
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setTotalPrescriptionAmount(response.content.reduce((sum, item) => sum + item.prescriptionAmount, 0));
    } catch (error) {
      console.error('Failed to fetch performance statistics:', error);
      errorDialog.showError('실적통계 목록을 불러오는 중 오류가 발생했습니다.');
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
      setTotalPrescriptionAmount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  const handleReset = () => {
    formik.resetForm();
  };

  const table = useReactTable({
    data,
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
      {
        header: '기본수수료율',
        cell: ({ row }) => row.original.baseFeeRate.toLocaleString(),
        size: 100,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: formik.values.pageIndex,
        pageSize: formik.values.pageSize,
      },
    },
    pageCount: totalPages,
    manualPagination: true,
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          실적통계
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
                      <MenuItem value={'drugCompany'}>제약사명</MenuItem>
                      <MenuItem value={'companyName'}>회사명</MenuItem>
                      <MenuItem value={'dealerName'}>딜러명</MenuItem>
                      <MenuItem value={'institutionName'}>거래처명</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker
                    name='settlementDate'
                    placeholder='월 선택'
                    format='yyyy-MM'
                    views={['year', 'month']}
                    formik={formik}
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
                  <Button variant='outlined' size='small' onClick={handleReset}>
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
                <Typography variant='subtitle1'>총 처방금액: {totalPrescriptionAmount.toLocaleString()}원</Typography>
              </Stack>
              <Stack direction='row' spacing={1}>
                <Button
                  variant='contained'
                  color='success'
                  size='small'
                  href={getDownloadPerformanceExcel({
                    drugCompany: formik.values.searchType === 'drugCompany' ? formik.values.searchKeyword : undefined,
                    companyName: formik.values.searchType === 'companyName' ? formik.values.searchKeyword : undefined,
                    dealerName: formik.values.searchType === 'dealerName' ? formik.values.searchKeyword : undefined,
                    institutionName: formik.values.searchType === 'institutionName' ? formik.values.searchKeyword : undefined,
                    startMonth: formik.values.settlementDate ? new DateString(formik.values.settlementDate) : undefined,
                    endMonth: formik.values.settlementDate ? new DateString(formik.values.settlementDate) : undefined,
                    page: formik.values.pageIndex,
                    size: formik.values.pageSize,
                  })}
                  target='_blank'
                  startIcon={<DocumentDownload size={16} />}
                >
                  Excel
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
            </ScrollX>

            <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={formik.values.pageIndex + 1}
                onChange={(_, value) => formik.setFieldValue('pageIndex', value - 1)}
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
