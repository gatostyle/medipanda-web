import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { Calendar1, ExportSquare } from 'iconsax-react';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { MpPagedResponse } from 'api-definitions/MpPaged';
import {
  mpFetchPharmaceuticalProducts,
  MpPharmaceuticalProduct,
  MpPharmaceuticalProductSearchRequest
} from 'api-definitions/MpPharmaceuticalProduct';

interface FormValues {
  pageSize: number;
  pageIndex: number;
  sorting: SortingState;
  searchKeyword: string;
  company: string;
  startDate: string;
  endDate: string;
}

export default function MpAdminPharmaceuticalProductList() {
  const navigate = useNavigate();
  const emptyData = useMemo(() => [], []);
  const [pagedResponse, setPagedResponse] = useState<MpPagedResponse<MpPharmaceuticalProduct> | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const { values, setValues, handleChange, submitForm } = useFormik<FormValues>({
    initialValues: {
      pageSize: 10,
      pageIndex: 0,
      sorting: [],
      searchKeyword: '',
      company: '위탁사',
      startDate: '',
      endDate: ''
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const searchRequest: MpPharmaceuticalProductSearchRequest = {
          page: values.pageIndex,
          size: values.pageSize,
          searchKeyword: values.searchKeyword,
          company: values.company,
          startDate: values.startDate,
          endDate: values.endDate
        };
        const response = await mpFetchPharmaceuticalProducts(searchRequest);
        setPagedResponse(response);
      } catch (error) {
        console.error('Failed to fetch pharmaceutical products:', error);
        showError('제품 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  const columns: ColumnDef<MpPharmaceuticalProduct>[] = [
    {
      id: 'select',
      header: () => (
        <Checkbox
          checked={selectedItems.length === pagedResponse?.content.length && pagedResponse?.content.length > 0}
          indeterminate={selectedItems.length > 0 && selectedItems.length < (pagedResponse?.content.length || 0)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedItems(pagedResponse?.content.map((item) => item.id) || []);
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
            e.stopPropagation();
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
      id: 'no',
      header: 'No',
      cell: ({ row }) => (row.original as any).sequence || row.index + 1 + values.pageIndex * values.pageSize,
      size: 60
    },
    {
      id: 'thumbnail',
      header: '썸네일',
      cell: () => (
        <Box
          sx={{
            width: 60,
            height: 40,
            bgcolor: '#F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 1,
            fontSize: '12px',
            color: '#6B7280'
          }}
        >
          썸네일
        </Box>
      ),
      size: 80
    },
    {
      id: 'company',
      header: '위탁사',
      accessorKey: 'company'
    },
    {
      id: 'productName',
      header: '상품명',
      accessorKey: 'productName',
      cell: ({ row }) => (
        <Typography
          sx={{
            color: '#3B82F6',
            textDecoration: 'underline',
            cursor: 'pointer',
            '&:hover': { color: '#1E40AF' }
          }}
        >
          {row.original.productName}
        </Typography>
      )
    },
    {
      id: 'price',
      header: '판매가',
      cell: ({ row }) => `${row.original.price.toLocaleString()}`
    },
    {
      id: 'commission',
      header: '기본수수료율',
      accessorKey: 'commission'
    },
    {
      id: 'contractDate',
      header: '계약일',
      accessorKey: 'contractDate'
    },
    {
      id: 'contractPeriod',
      header: '계약기간',
      accessorKey: 'contractPeriod'
    },
    {
      id: 'applicantCount',
      header: '신청자 수',
      cell: ({ row }) => `${row.original.applicantCount}명`
    },
    {
      id: 'salesCount',
      header: '판매수량',
      accessorKey: 'salesCount'
    }
  ];

  const table = useReactTable({
    data: pagedResponse?.content ?? emptyData,
    columns,
    state: { sorting: values.sorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  useEffect(() => {
    submitForm();
  }, []);

  const handleRowClick = (id: number) => {
    navigate(`/admin/pharmaceutical/products/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        영업대행상품
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <Select
                name="company"
                value={values.company}
                onChange={handleChange}
                displayEmpty
                sx={{
                  borderRadius: '20px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10B981'
                  }
                }}
              >
                <MenuItem value="위탁사">위탁사</MenuItem>
                <MenuItem value="진일바이오팜">진일바이오팜</MenuItem>
                <MenuItem value="진양제약(주)">진양제약(주)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              name="startDate"
              value={values.startDate}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Calendar1 size="20" color="#10B981" style={{ marginRight: 8 }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  '& fieldset': {
                    borderColor: '#10B981'
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              fullWidth
              size="small"
              type="date"
              name="endDate"
              value={values.endDate}
              onChange={handleChange}
              InputProps={{
                startAdornment: <Calendar1 size="20" color="#10B981" style={{ marginRight: 8 }} />
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  '& fieldset': {
                    borderColor: '#10B981'
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              name="searchKeyword"
              value={values.searchKeyword}
              onChange={handleChange}
              placeholder="검색어를 입력하세요"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '20px',
                  '& fieldset': {
                    borderColor: '#10B981'
                  }
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => submitForm()}
              sx={{
                bgcolor: '#6B7280',
                borderRadius: '20px',
                '&:hover': { bgcolor: '#4B5563' }
              }}
            >
              검색
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1">
            검색결과: <strong>{isLoading ? '...' : pagedResponse?.totalElements ?? 0}</strong> 건
          </Typography>
          <Button
            variant="contained"
            startIcon={<ExportSquare />}
            onClick={() => openNotImplementedDialog('Excel 다운로드')}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 3,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            Excel
          </Button>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => openNotImplementedDialog('삭제')}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 3,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            삭제
          </Button>
          <Button
            variant="contained"
            onClick={() => openNotImplementedDialog('등록하기')}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 3,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            등록하기
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell key={header.id} sx={{ fontWeight: 600, color: '#374151', fontSize: '14px', py: 1.5 }}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    데이터를 불러오는 중...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : pagedResponse === null || pagedResponse.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    데이터가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#F9FAFB' }
                  }}
                  onClick={() => handleRowClick(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      onClick={(e) => {
                        if (cell.column.id === 'select') {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Pagination
          count={Math.ceil((pagedResponse?.totalElements ?? 0) / values.pageSize)}
          page={values.pageIndex + 1}
          onChange={(_, page) => {
            setValues({ ...values, pageIndex: page - 1 });
            submitForm();
          }}
          disabled={isLoading}
          color="primary"
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: '4px'
            },
            '& .Mui-selected': {
              bgcolor: '#6366F1 !important',
              color: 'white'
            }
          }}
        />
      </Box>
    </Box>
  );
}
