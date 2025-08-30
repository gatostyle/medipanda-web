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
import { DateTimeString, ExpenseReportResponse, getDownloadExpenseReportListExcel, getExpenseReportList } from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { EXPENSE_REPORT_CLASSIFICATION_LABELS, EXPENSE_REPORT_STATUS_LABELS } from 'medipanda/ui-labels';
import { formatYyyyMmDd } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useState } from 'react';

export default function MpAdminExpenseReportList() {
  const [data, setData] = useState<Sequenced<ExpenseReportResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      reportStatus: '' as 'PENDING' | 'COMPLETED' | '',
      searchType: '' as 'companyName' | 'userId' | 'productName',
      eventDateFrom: null as Date | null,
      eventDateTo: null as Date | null,
      searchKeyword: '',
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
      const response = await getExpenseReportList({
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
        ...(formik.values.reportStatus !== '' && { reportStatus: formik.values.reportStatus }),
        companyName: formik.values.searchType === 'companyName' ? formik.values.searchKeyword : undefined,
        userId: formik.values.searchType === 'userId' ? formik.values.searchKeyword : undefined,
        productName: formik.values.searchType === 'productName' ? formik.values.searchKeyword : undefined,
        eventDateFrom: formik.values.eventDateFrom ? new DateTimeString(formik.values.eventDateFrom) : undefined,
        eventDateTo: formik.values.eventDateTo ? new DateTimeString(formik.values.eventDateTo) : undefined,
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch expense reports:', error);
      errorDialog.showError('지출보고 목록을 불러오는 중 오류가 발생했습니다.');
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
        header: '아이디',
        cell: ({ row }) => row.original.userId,
        size: 100,
      },
      {
        header: '회사명',
        cell: ({ row }) => row.original.companyName,
        size: 120,
      },
      {
        header: '제품명',
        cell: ({ row }) => row.original.productName,
        size: 150,
      },
      {
        header: '유형',
        cell: ({ row }) => {
          const value = row.original.reportType;
          return EXPENSE_REPORT_CLASSIFICATION_LABELS[value];
        },
        size: 150,
      },
      {
        header: '시행일시',
        cell: ({ row }) => {
          return `${row.original.eventStartAt !== null ? formatYyyyMmDd(row.original.eventStartAt) : '-'} ~ ${row.original.eventEndAt !== null ? formatYyyyMmDd(row.original.eventEndAt) : '-'}`;
        },
        size: 100,
      },
      {
        header: '지원금액',
        cell: ({ row }) => `${row.original.supportAmount.toLocaleString()}원`,
        size: 120,
      },
      {
        header: '신고상태',
        cell: ({ row }) => EXPENSE_REPORT_STATUS_LABELS[row.original.status],
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
          지출보고관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>신고상태</InputLabel>
                    <Select name='reportStatus' value={formik.values.reportStatus} onChange={formik.handleChange}>
                      <MenuItem value={'PENDING'}>{EXPENSE_REPORT_STATUS_LABELS['PENDING']}</MenuItem>
                      <MenuItem value={'COMPLETED'}>{EXPENSE_REPORT_STATUS_LABELS['COMPLETED']}</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={'companyName'}>회사명</MenuItem>
                      <MenuItem value={'userId'}>아이디</MenuItem>
                      <MenuItem value={'productName'}>제품명</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name='eventDateFrom' label='시작일' formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name='eventDateTo' label='종료일' formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    size='small'
                    fullWidth
                    name='searchKeyword'
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                    placeholder='검색어를 입력하세요'
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button type='submit' variant='contained' size='small'>
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
              </Stack>
              <Stack direction='row' spacing={1}>
                <Button
                  variant='contained'
                  size='small'
                  color='success'
                  startIcon={<DocumentDownload size={16} />}
                  href={getDownloadExpenseReportListExcel({
                    page: formik.values.pageIndex,
                    size: formik.values.pageSize,
                    ...(formik.values.reportStatus !== '' && { reportStatus: formik.values.reportStatus }),
                    companyName: formik.values.searchType === 'companyName' ? formik.values.searchKeyword : undefined,
                    userId: formik.values.searchType === 'userId' ? formik.values.searchKeyword : undefined,
                    productName: formik.values.searchType === 'productName' ? formik.values.searchKeyword : undefined,
                    eventDateFrom: formik.values.eventDateFrom ? new DateTimeString(formik.values.eventDateFrom) : undefined,
                    eventDateTo: formik.values.eventDateTo ? new DateTimeString(formik.values.eventDateTo) : undefined,
                  })}
                  target='_blank'
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
