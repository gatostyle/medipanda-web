import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import { format } from 'date-fns';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
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
import Pagination from '@mui/material/Pagination';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { DocumentDownload } from 'iconsax-react';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { EXPENSE_REPORT_CLASSIFICATION_LABELS, EXPENSE_REPORT_STATUS_LABELS } from 'medipanda/ui-labels';
import { DateTimeString, downloadExpenseReportListExcel, ExpenseReportResponse, getExpenseReportList } from 'medipanda/backend';

export default function MpAdminExpenseReportList() {
  const [data, setData] = useState<Sequenced<ExpenseReportResponse>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const formik = useFormik({
    initialValues: {
      reportStatus: '' as 'PENDING' | 'COMPLETED' | '',
      searchCriteria: '',
      startAt: null as Date | null,
      endAt: null as Date | null,
      searchKeyword: ''
    },
    onSubmit: (values) => {
      setPagination({ pageIndex: 0, pageSize: 20 });
      fetchData(0);
    }
  });

  const fetchData = async (page: number) => {
    setLoading(true);
    try {
      const response = await getExpenseReportList({
        page: page,
        size: pagination.pageSize,
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

  const handleExcelDownload = async () => {
    try {
      const blob = await downloadExpenseReportListExcel({
        page: pagination.pageIndex,
        size: pagination.pageSize,
        ...(formik.values.reportStatus !== '' && { reportStatus: formik.values.reportStatus }),
        companyName: formik.values.searchCriteria === 'companyName' ? formik.values.searchKeyword : undefined,
        userId: formik.values.searchCriteria === 'userId' ? formik.values.searchKeyword : undefined,
        productName: formik.values.searchCriteria === 'productName' ? formik.values.searchKeyword : undefined,
        eventDateFrom: formik.values.startAt ? new DateTimeString(formik.values.startAt) : undefined,
        eventDateTo: formik.values.endAt ? new DateTimeString(formik.values.endAt) : undefined
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `지출보고_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download Excel:', error);
    }
  };

  useEffect(() => {
    fetchData(0);
  }, []);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    const newPageIndex = value - 1;
    setPagination({ ...pagination, pageIndex: newPageIndex });
    fetchData(newPageIndex);
  };

  const columns = useMemo<ColumnDef<Sequenced<ExpenseReportResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        size: 60
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        size: 100
      },
      {
        header: '회사명',
        accessorKey: 'companyName',
        size: 120
      },
      {
        header: '제품명',
        accessorKey: 'productName',
        size: 150
      },
      {
        header: '유형',
        accessorKey: 'reportType',
        size: 80,
        cell: ({ row }) => {
          const value = row.original.reportType;
          return EXPENSE_REPORT_CLASSIFICATION_LABELS[value];
        }
      },
      {
        header: '유형',
        accessorKey: 'expenseReportType',
        size: 150
      },
      {
        header: '시행일시',
        accessorKey: 'eventStartAt',
        size: 100,
        cell: ({ row }) => {
          return `${format(new Date(row.original.eventStartAt!), 'yyyy-MM-dd')} ~ ${format(new Date(row.original.eventEndAt!), 'yyyy-MM-dd')}`;
        }
      },
      {
        header: '지원금액',
        accessorKey: 'supportAmount',
        size: 120,
        cell: ({ row }) => {
          const amount = row.original.supportAmount;
          return `${amount.toLocaleString()}원`;
        }
      },
      {
        header: '신고상태',
        accessorKey: 'status',
        size: 100,
        cell: ({ row }) => {
          const value = row.original.status;
          return EXPENSE_REPORT_STATUS_LABELS[value];
        }
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      pagination
    },
    onPaginationChange: setPagination,
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
                  onClick={handleExcelDownload}
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
                    {table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} hover>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                    {data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center">
                          데이터가 없습니다.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollX>

            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={pagination.pageIndex + 1}
                onChange={handlePageChange}
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
