import { useNavigate, useParams } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { useFormik } from 'formik';
import {
  IconButton,
  Box,
  Typography,
  Grid,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Pagination
} from '@mui/material';
import { ArrowLeft, DocumentDownload } from 'iconsax-react';
import { Link } from 'react-router-dom';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { MpSettlementDetail, mpGetSettlementDetails, mpDownloadSettlementDetailsExcel } from 'medipanda/api-definitions/MpSettlement';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import { Sequenced } from 'medipanda/utils/withSequence';

export default function MpAdminSettlementEdit() {
  const navigate = useNavigate();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id } = useParams<{ id: string }>();
  const notImplementedDialog = useMpNotImplementedDialog();
  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();
  const [totalElements] = useState(2);
  const [totalPages] = useState(1);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const formik = useFormik({
    initialValues: {
      searchType: 'institutionName',
      searchKeyword: ''
    },
    onSubmit: (values) => {
      console.log('Search:', values);
    }
  });

  const [data, setData] = useState<Sequenced<MpSettlementDetail>[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const settlementDetails = await mpGetSettlementDetails();
      setData(
        settlementDetails.map((item, index) => ({
          ...item,
          sequence: index + 1
        }))
      );
    };
    loadData();
  }, []);

  const columns = useMemo<ColumnDef<Sequenced<MpSettlementDetail>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        size: 60
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
        cell: ({ row }) => (
          <Link to={`/admin/settlements/business-partners/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.institutionName}
          </Link>
        ),
        size: 120
      },
      {
        header: '사업자등록번호',
        accessorKey: 'businessNumber',
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

  const handleExcelDownload = async () => {
    try {
      await mpDownloadSettlementDetailsExcel();
      infoDialog.showInfo('Excel 파일이 다운로드되었습니다.');
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to download Excel:', error);
        errorDialog.showError('Excel 다운로드 중 오류가 발생했습니다.');
      }
    }
  };

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
            <Button variant="contained" color="success" onClick={handleExcelDownload}>
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
