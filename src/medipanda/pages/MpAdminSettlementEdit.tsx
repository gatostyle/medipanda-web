import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
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
  Typography
} from '@mui/material';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { ArrowLeft, DocumentDownload } from 'iconsax-react';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDownloadSettlementPartnerSummaryExcel, getSettlementPartnerSummary, SettlementPartnerResponse } from 'medipanda/backend';

export default function MpAdminSettlementEdit() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [totalElements] = useState(2);
  const [totalPages] = useState(1);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const formik = useFormik({
    initialValues: {
      searchType: 'institutionName' as 'institutionName' | 'businessNumber' | 'institutionCode',
      searchKeyword: ''
    },
    onSubmit: (values) => {
      console.log('Search:', values);
      if (id) {
        fetchSettlementData();
      }
    }
  });

  const [data, setData] = useState<Sequenced<SettlementPartnerResponse>[]>([]);

  useEffect(() => {
    if (id) {
      fetchSettlementData();
    }
  }, [id, pagination.pageIndex, pagination.pageSize]);

  const fetchSettlementData = async () => {
    if (id === undefined) return;

    setLoading(true);
    try {
      const response = await getSettlementPartnerSummary({
        settlementId: parseInt(id),
        institutionName: formik.values.searchType === 'institutionName' ? formik.values.searchKeyword : undefined,
        businessNumber: formik.values.searchType === 'businessNumber' ? formik.values.searchKeyword : undefined,
        institutionCode: formik.values.searchType === 'institutionCode' ? formik.values.searchKeyword : undefined,
        page: pagination.pageIndex,
        size: pagination.pageSize
      });

      setData(withSequence(response).content);
    } catch (error) {
      console.error('Failed to fetch settlement data:', error);
      enqueueSnackbar('정산 데이터를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo<ColumnDef<Sequenced<SettlementPartnerResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        cell: ({ row }) => row.original.sequence,
        size: 60
      },
      {
        header: '회사명',
        accessorKey: 'companyName',
        cell: ({ row }) => row.original.companyName,
        size: 120
      },
      {
        header: '딜러명',
        accessorKey: 'dealerName',
        cell: ({ row }) => row.original.dealerName,
        size: 100
      },
      {
        header: '거래처코드',
        accessorKey: 'institutionCode',
        cell: ({ row }) => row.original.institutionCode,
        size: 120
      },
      {
        header: '거래처명',
        accessorKey: 'institutionCode',
        cell: ({ row }) => (
          <Link
            to={`/admin/settlements/${id}/business-partners/${row.original.institutionCode}`}
            style={{ textDecoration: 'none', color: '#1976d2' }}
          >
            {row.original.institutionName}
          </Link>
        ),
        size: 120
      },
      {
        header: '사업자등록번호',
        accessorKey: 'businessNumber',
        cell: ({ row }) => row.original.businessNumber,
        size: 140
      },
      {
        header: '공급가액',
        accessorKey: 'supplyAmount',
        cell: ({ row }) => row.original.supplyAmount.toLocaleString(),
        size: 120
      },
      {
        header: '세액',
        accessorKey: 'taxAmount',
        cell: ({ row }) => row.original.taxAmount.toLocaleString(),
        size: 100
      },
      {
        header: '합계금액(수수료금액)',
        accessorKey: 'totalAmount',
        cell: ({ row }) => row.original.totalAmount.toLocaleString(),
        size: 130
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    pageCount: totalPages,
    manualPagination: true
  });

  const handleBack = () => {
    navigate('/admin/settlements');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <IconButton onClick={handleBack} sx={{ p: 0 }}>
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h4">정산상세내역</Typography>
      </Stack>

      <MainCard content={false}>
        <Box sx={{ p: 3 }}>
          <form onSubmit={formik.handleSubmit}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={2}>
                <FormControl fullWidth size="small">
                  <Select name="searchType" value={formik.values.searchType} onChange={formik.handleChange} displayEmpty>
                    <MenuItem value="institutionName">거래처명</MenuItem>
                    <MenuItem value="businessNumber">사업자등록번호</MenuItem>
                    <MenuItem value="institutionCode">거래처코드</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  name="searchKeyword"
                  size="small"
                  placeholder="검색어를 입력해주세요"
                  fullWidth
                  value={formik.values.searchKeyword}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid item>
                <Button variant="contained" size="small" type="submit">
                  검색
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>

        <Box sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
            <Button
              variant="contained"
              color="success"
              href={getDownloadSettlementPartnerSummaryExcel({
                settlementId: parseInt(id!),
                institutionName: formik.values.searchType === 'institutionName' ? formik.values.searchKeyword : undefined,
                businessNumber: formik.values.searchType === 'businessNumber' ? formik.values.searchKeyword : undefined,
                institutionCode: formik.values.searchType === 'institutionCode' ? formik.values.searchKeyword : undefined,
                page: pagination.pageIndex,
                size: pagination.pageSize
              })}
              target="_blank"
            >
              <DocumentDownload style={{ marginRight: 8 }} />
              Excel
            </Button>
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
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </ScrollX>

          <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
            <Pagination
              count={totalPages}
              page={pagination.pageIndex + 1}
              onChange={(event, value) => {
                setPagination({ ...pagination, pageIndex: value - 1 });
              }}
              color="primary"
              variant="outlined"
              showFirstButton
              showLastButton
            />
          </Stack>
        </Box>
      </MainCard>
    </Box>
  );
}
