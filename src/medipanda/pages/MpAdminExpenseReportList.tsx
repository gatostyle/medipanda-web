import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
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
import { DocumentDownload } from 'iconsax-react';
import { DateTimeString, ExpenseReportResponse, getDownloadExpenseReportListExcel, getExpenseReportList } from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { EXPENSE_REPORT_CLASSIFICATION_LABELS, EXPENSE_REPORT_STATUS_LABELS } from 'medipanda/ui-labels';
import { formatYyyyMmDd } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';

export default function MpAdminExpenseReportList() {
  const [data, setData] = useState<Sequenced<ExpenseReportResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const formik = useFormik({
    initialValues: {
      reportStatus: '' as 'PENDING' | 'COMPLETED' | '',
      searchCriteria: '',
      startAt: null as Date | null,
      endAt: null as Date | null,
      searchKeyword: '',
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getExpenseReportList({
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
        ...(formik.values.reportStatus !== '' && { reportStatus: formik.values.reportStatus }),
        companyName: formik.values.searchCriteria === 'companyName' ? formik.values.searchKeyword : undefined,
        userId: formik.values.searchCriteria === 'userId' ? formik.values.searchKeyword : undefined,
        productName: formik.values.searchCriteria === 'productName' ? formik.values.searchKeyword : undefined,
        eventDateFrom: formik.values.startAt ? new DateTimeString(formik.values.startAt) : undefined,
        eventDateTo: formik.values.endAt ? new DateTimeString(formik.values.endAt) : undefined
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch expense reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [formik.values.pageIndex, formik.values.pageSize]);

  const columns = useMemo<ColumnDef<Sequenced<ExpenseReportResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        cell: ({ row }) => row.original.sequence,
        size: 60
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        cell: ({ row }) => row.original.userId,
        size: 100
      },
      {
        header: '회사명',
        accessorKey: 'companyName',
        cell: ({ row }) => row.original.companyName,
        size: 120
      },
      {
        header: '제품명',
        accessorKey: 'productName',
        cell: ({ row }) => row.original.productName,
        size: 150
      },
      {
        header: '유형',
        accessorKey: 'reportType',
        cell: ({ row }) => {
          const value = row.original.reportType;
          return EXPENSE_REPORT_CLASSIFICATION_LABELS[value];
        },
        size: 80
      },
      {
        header: '유형',
        accessorKey: 'reportType',
        cell: ({ row }) => row.original.reportType,
        size: 150
      },
      {
        header: '시행일시',
        accessorKey: 'eventStartAt',
        cell: ({ row }) => {
          return `${formatYyyyMmDd(row.original.eventStartAt!)} ~ ${formatYyyyMmDd(row.original.eventEndAt!)}`;
        },
        size: 100
      },
      {
        header: '지원금액',
        accessorKey: 'supportAmount',
        cell: ({ row }) => `${row.original.supportAmount.toLocaleString()}원`,
        size: 120
      },
      {
        header: '신고상태',
        accessorKey: 'status',
        cell: ({ row }) => EXPENSE_REPORT_STATUS_LABELS[row.original.status],
        size: 100
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      pagination: {
        pageIndex: formik.values.pageIndex,
        pageSize: formik.values.pageSize
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          지출보고관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <Select name="reportStatus" value={formik.values.reportStatus} onChange={formik.handleChange} displayEmpty>
                      <MenuItem value="all">전체</MenuItem>
                      <MenuItem value={'PENDING'}>{EXPENSE_REPORT_STATUS_LABELS['PENDING']}</MenuItem>
                      <MenuItem value={'COMPLETED'}>{EXPENSE_REPORT_STATUS_LABELS['COMPLETED']}</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <Select name="searchCriteria" value={formik.values.searchCriteria} onChange={formik.handleChange} displayEmpty>
                      <MenuItem value={'companyName'}>회사명</MenuItem>
                      <MenuItem value={'userId'}>아이디</MenuItem>
                      <MenuItem value={'productName'}>제품명</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="startAt" placeholder="시작일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="endAt" placeholder="종료일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    size="small"
                    fullWidth
                    name="searchKeyword"
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                    placeholder="검색어를 입력하세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button type="submit" variant="contained" size="small">
                    검색
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">검색결과: {totalElements} 건</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  color="success"
                  startIcon={<DocumentDownload size={16} />}
                  href={getDownloadExpenseReportListExcel({
                    page: formik.values.pageIndex,
                    size: formik.values.pageSize,
                    ...(formik.values.reportStatus !== '' && { reportStatus: formik.values.reportStatus }),
                    companyName: formik.values.searchCriteria === 'companyName' ? formik.values.searchKeyword : undefined,
                    userId: formik.values.searchCriteria === 'userId' ? formik.values.searchKeyword : undefined,
                    productName: formik.values.searchCriteria === 'productName' ? formik.values.searchKeyword : undefined,
                    eventDateFrom: formik.values.startAt ? new DateTimeString(formik.values.startAt) : undefined,
                    eventDateTo: formik.values.endAt ? new DateTimeString(formik.values.endAt) : undefined
                  })}
                  target="_blank"
                >
                  Excel
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
                            {flexRender(header.column.columnDef.header, header.getContext())}
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
                        <TableRow key={row.id} hover>
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
                onChange={(_, value) => formik.setFieldValue('pageIndex', value - 1)}
                color="primary"
                variant="outlined"
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
