import { Download as ExcelIcon } from '@mui/icons-material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
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
import {
  DateString,
  deleteBoardPost,
  getDownloadSalesAgencyProductsExcel,
  getSalesAgencyProducts,
  SalesAgencyProductSummaryResponse
} from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { useMpDeleteDialog } from 'medipanda/hooks/useMpDeleteDialog';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { formatYyyyMmDd } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MpAdminSalesAgencyProductList() {
  const [data, setData] = useState<Sequenced<SalesAgencyProductSummaryResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const deleteDialog = useMpDeleteDialog();
  const errorDialog = useMpErrorDialog();
  const infoDialog = useMpInfoDialog();

  const formik = useFormik({
    initialValues: {
      searchType: 'productName' as 'productName' | 'clientName',
      searchKeyword: '',
      date: null as Date | null,
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

  const columns = useMemo<ColumnDef<Sequenced<SalesAgencyProductSummaryResponse>>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedItems.length === data.length && data.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems(data.map((item) => item.id));
              } else {
                setSelectedItems([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedItems.includes(row.original.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems((prev) => [...prev, row.original.id]);
              } else {
                setSelectedItems((prev) => prev.filter((id) => id !== row.original.id));
              }
            }}
          />
        ),
        size: 50
      },
      {
        header: 'No',
        accessorKey: 'sequence',
        cell: ({ row }) => row.original.sequence,
        size: 60
      },
      {
        header: '썸네일',
        accessorKey: 'thumbnailUrl',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <img
              src={row.original.thumbnailUrl ?? ''}
              alt="썸네일"
              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
            />
          </Box>
        ),
        size: 80
      },
      {
        header: '위탁사',
        accessorKey: 'clientName',
        cell: ({ row }) => row.original.clientName,
        size: 150
      },
      {
        header: '상품명',
        accessorKey: 'productName',
        cell: ({ row }) => (
          <Link to={`/admin/sales-agency-products/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.productName}
          </Link>
        ),
        size: 300
      },
      {
        header: '판매가',
        accessorKey: 'price',
        cell: ({ row }) => row.original.price.toLocaleString(),
        size: 100
      },
      {
        header: '계약일',
        accessorKey: 'contractDate',
        cell: ({ row }) => formatYyyyMmDd(row.original.contractDate),
        size: 120
      },
      {
        header: '노출상태',
        accessorKey: 'isExposed',
        cell: ({ row }) => {
          const isExposed = row.original.isExposed;
          return <Chip label={isExposed ? '노출' : '미노출'} size="small" color={isExposed ? 'success' : 'default'} />;
        },
        size: 100
      },
      {
        header: '게시기간',
        accessorKey: 'startAt',
        cell: ({ row }) => {
          return `${formatYyyyMmDd(row.original.startAt)} ~ ${formatYyyyMmDd(row.original.endAt)}`;
        },
        size: 200
      },
      {
        header: '신청자 수',
        accessorKey: 'appliedCount',
        cell: ({ row }) => `${row.original.appliedCount}명`,
        size: 100
      },
      {
        header: '판매수량',
        accessorKey: 'quantity',
        cell: ({ row }) => row.original.quantity.toLocaleString(),
        size: 100
      }
    ],
    [data, selectedItems]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: formik.values.pageIndex,
        pageSize: formik.values.pageSize
      }
    },
    pageCount: totalPages,
    manualPagination: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getSalesAgencyProducts({
        productName: formik.values.searchType === 'productName' ? formik.values.searchKeyword : undefined,
        clientName: formik.values.searchType === 'clientName' ? formik.values.searchKeyword : undefined,
        startAt: formik.values.date ? new DateString(formik.values.date) : undefined,
        endAt: formik.values.date ? new DateString(formik.values.date) : undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch sales agency product list:', error);
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

  const handleDelete = () => {
    const count = selectedItems.length;
    const message =
      count === 1
        ? `상품 ${data.find((item) => item.id === selectedItems[0])?.productName}를 삭제하시겠습니까?`
        : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedItems.map((id) => deleteBoardPost(id)));
          infoDialog.showInfo('삭제가 완료되었습니다.');
          setSelectedItems([]);
          fetchData();
        } catch (error) {
          console.error('Failed to delete sales agency products:', error);
          errorDialog.showError('삭제 중 오류가 발생했습니다.');
        }
      }
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          영업대행상품
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={2}>
                  <FormControl fullWidth size="small">
                    <Select
                      name="searchType"
                      value={formik.values.searchType}
                      onChange={(e) => formik.setFieldValue('searchType', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="productName">상품명</MenuItem>
                      <MenuItem value="clientName">위탁사</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    name="searchKeyword"
                    size="small"
                    placeholder="검색어를 입력해주세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <MpFormikDatePicker name="date" placeholder="등록일" formik={formik} />
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" size="small" type="submit">
                      검색
                    </Button>
                    <Button variant="outlined" size="small" onClick={handleReset}>
                      초기화
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </Box>
        </MainCard>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 2 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
              <Stack direction="row" spacing={1}>
                <IconButton
                  size="small"
                  color="success"
                  href={getDownloadSalesAgencyProductsExcel({
                    productName: formik.values.searchType === 'productName' ? formik.values.searchKeyword : undefined,
                    clientName: formik.values.searchType === 'clientName' ? formik.values.searchKeyword : undefined,
                    startAt: formik.values.date ? new DateString(formik.values.date) : undefined,
                    endAt: formik.values.date ? new DateString(formik.values.date) : undefined,
                    page: formik.values.pageIndex,
                    size: formik.values.pageSize
                  })}
                  target="_blank"
                  sx={{
                    backgroundColor: 'success.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'success.dark'
                    }
                  }}
                >
                  <ExcelIcon fontSize="small" />
                </IconButton>
                <Button variant="contained" color="error" size="small" disabled={selectedItems.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant="contained" color="success" size="small" component={Link} to="/admin/sales-agency-products/new">
                  등록
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
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                        <TableRow key={row.id}>
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
