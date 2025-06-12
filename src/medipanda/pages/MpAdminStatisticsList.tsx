import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import { format } from 'date-fns';
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
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import Pagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';
import { SearchFilterBar, SearchFilterItem, SearchFilterActions } from 'medipanda/components/SearchFilterBar';
import { DocumentDownload } from 'iconsax-react';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import {
  MpPerformanceStatistics,
  mpGetPerformanceStatistics,
  mpDownloadPerformanceStatisticsExcel
} from 'medipanda/api-definitions/MpPerformanceStatistics';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { Sequenced } from 'medipanda/utils/withSequence';

export default function MpAdminStatisticsList() {
  const [data, setData] = useState<Sequenced<MpPerformanceStatistics>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPrescriptionAmount, setTotalPrescriptionAmount] = useState(0);
  const notImplementedDialog = useMpNotImplementedDialog();
  const errorDialog = useMpErrorDialog();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const formik = useFormik({
    initialValues: {
      searchType: 'companyName',
      searchText: '',
      settlementDate: null as Date | null
    },
    onSubmit: (values) => {
      setPagination({ pageIndex: 0, pageSize: 20 });
      fetchData(0, values);
    }
  });

  const fetchData = async (page: number, searchValues?: typeof formik.values) => {
    const values = searchValues || formik.values;
    setLoading(true);
    try {
      const mockData = await mpGetPerformanceStatistics();

      const filtered = mockData.filter((item) => {
        if (values.searchText) {
          switch (values.searchType) {
            case 'companyName':
              if (!item.companyName.includes(values.searchText)) return false;
              break;
            case 'drugCompany':
              if (!item.drugCompany.includes(values.searchText)) return false;
              break;
            case 'dealerName':
              if (!item.dealerName.includes(values.searchText)) return false;
              break;
            case 'institutionName':
              if (!item.institutionName.includes(values.searchText)) return false;
              break;
          }
        }
        if (values.settlementDate) {
          const searchMonth = format(values.settlementDate, 'yyyy-MM');
          if (item.settlementMonth !== searchMonth) return false;
        }
        return true;
      });

      const startIndex = page * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginatedData = filtered.slice(startIndex, endIndex);

      const dataWithSequence = paginatedData.map((item, index) => ({
        ...item,
        sequence: filtered.length - startIndex - index
      }));

      setData(dataWithSequence);
      setTotalElements(filtered.length);
      setTotalPages(Math.ceil(filtered.length / pagination.pageSize));
      setTotalPrescriptionAmount(filtered.reduce((sum, item) => sum + item.prescriptionAmount, 0));
    } catch (error) {
      console.error('Failed to fetch performance statistics:', error);
    } finally {
      setLoading(false);
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

  const handleExcelDownload = async () => {
    try {
      await mpDownloadPerformanceStatisticsExcel();
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to download Excel:', error);
        errorDialog.showError('Excel 다운로드 중 오류가 발생했습니다.');
      }
    }
  };

  const columns = useMemo<ColumnDef<Sequenced<MpPerformanceStatistics>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        size: 60
      },
      {
        header: '제약사명',
        accessorKey: 'drugCompany',
        size: 120
      },
      {
        header: '회사명',
        accessorKey: 'companyName',
        size: 120
      },
      {
        header: '딜러명',
        accessorKey: 'dealerName',
        size: 100
      },
      {
        header: '거래처코드',
        accessorKey: 'institutionCode',
        size: 120
      },
      {
        header: '거래처명',
        accessorKey: 'institutionName',
        size: 120
      },
      {
        header: '정산월',
        accessorKey: 'settlementMonth',
        size: 100
      },
      {
        header: '처방금액',
        accessorKey: 'prescriptionAmount',
        size: 120,
        cell: ({ row }) => {
          const amount = row.original.prescriptionAmount;
          return amount.toLocaleString();
        }
      },
      {
        header: '합계금액',
        accessorKey: 'totalAmount',
        size: 120,
        cell: ({ row }) => {
          const amount = row.original.totalAmount;
          return amount.toLocaleString();
        }
      },
      {
        header: '수수료금액',
        accessorKey: 'commissionAmount',
        size: 120,
        cell: ({ row }) => {
          const amount = row.original.commissionAmount;
          return amount.toLocaleString();
        }
      },
      {
        header: '기본수수료율',
        accessorKey: 'basicCommissionRate',
        size: 100,
        cell: ({ row }) => {
          const rate = row.original.basicCommissionRate;
          return `${rate}%`;
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
          실적통계
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <Select name="searchType" value={formik.values.searchType} onChange={formik.handleChange} displayEmpty>
                      <MenuItem value="companyName">회사명</MenuItem>
                      <MenuItem value="drugCompany">제약사명</MenuItem>
                      <MenuItem value="dealerName">딜러명</MenuItem>
                      <MenuItem value="institutionName">거래처명</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker
                    name="settlementDate"
                    placeholder="월 선택"
                    format="yyyy-MM"
                    views={['year', 'month']}
                    formik={formik}
                  />
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    name="searchText"
                    size="small"
                    placeholder="검색어를 입력하세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.searchText}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button variant="contained" size="small" type="submit">
                    검색
                  </Button>
                  <Button variant="outlined" size="small" onClick={() => formik.resetForm()}>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
                <Typography variant="subtitle1">총 처방금액: {totalPrescriptionAmount.toLocaleString()}원</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" onClick={handleExcelDownload}>
                  <DocumentDownload />
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
                    {table.getRowModel().rows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                          <Typography variant="body1" color="text.secondary">
                            검색한 결과가 없습니다.
                          </Typography>
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
