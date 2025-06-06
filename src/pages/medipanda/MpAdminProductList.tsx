import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
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
import { SearchNormal1 } from 'iconsax-react';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import FileUploadDialog from 'components/medipanda/FileUploadDialog';
import { mpFetchProducts, MpProduct, MpProductSearchRequest } from 'api-definitions/MpProduct';
import { MpPagedResponse } from 'api-definitions/MpPaged';

export default function MpAdminProductList() {
  const [pagedResponse, setPagedResponse] = useState<MpPagedResponse<MpProduct> | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);
  const navigate = useNavigate();
  const emptyData = useMemo(() => [], []);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const { values, setValues, submitForm, handleChange } = useFormik({
    initialValues: {
      pageSize: 10,
      pageIndex: 0,
      searchType: '제품명/성분명',
      searchKeyword: '',
      section: '구간수수료 여부',
      status: '전체',
      productCategory: '전체',
      newProduct: false,
      prescription: false,
      sectionFee: false,
      etc: false
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const request: MpProductSearchRequest = {
          page: values.pageIndex,
          size: values.pageSize,
          searchType: values.searchType,
          searchKeyword: values.searchKeyword,
          sectionFee: values.section
        };
        const response = await mpFetchProducts(request);
        setPagedResponse(response);
      } catch (error) {
        console.error('제품 목록 조회 오류:', error);
        showError('제품 목록을 조회하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  const columns = useMemo<ColumnDef<MpProduct>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            indeterminate={table.getIsSomePageRowsSelected()}
            onChange={(e) => table.toggleAllPageRowsSelected(e.target.checked)}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onChange={(e) => {
              e.stopPropagation();
              row.toggleSelected();
            }}
          />
        ),
        enableSorting: false,
        size: 50
      },
      {
        accessorKey: 'sequence',
        header: 'No',
        cell: ({ row }) => row.index + 1,
        enableSorting: false,
        size: 70
      },
      {
        accessorKey: 'manufacturer',
        header: '제약사',
        size: 120
      },
      {
        accessorKey: 'type',
        header: '구분',
        size: 100
      },
      {
        accessorKey: 'name',
        header: '제품명',
        cell: ({ getValue, row }) => (
          <Typography
            component="span"
            sx={{
              color: '#3B82F6',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/admin/products/${row.original.id}`);
            }}
          >
            {getValue() as string}
          </Typography>
        ),
        size: 200
      },
      {
        accessorKey: 'ingredient',
        header: '성분명',
        size: 200
      },
      {
        accessorKey: 'code',
        header: '제품코드',
        size: 120
      },
      {
        accessorKey: 'price',
        header: '보험가',
        size: 100
      },
      {
        accessorKey: 'baseFee',
        header: '기본수수료',
        size: 120
      },
      {
        accessorKey: 'sectionFee',
        header: '구간수수료여부',
        cell: ({ getValue }) => (getValue() ? 'Y' : 'N'),
        size: 140
      },
      {
        accessorKey: 'state',
        header: '상태',
        size: 100
      },
      {
        accessorKey: 'note',
        header: '비고',
        size: 150
      }
    ],
    [navigate]
  );

  const table = useReactTable({
    data: pagedResponse?.content ?? emptyData,
    columns,
    state: {
      sorting,
      rowSelection: selectedProducts.reduce(
        (acc, id) => {
          const index = (pagedResponse?.content ?? []).findIndex((p) => p.id === id);
          if (index !== -1) acc[index] = true;
          return acc;
        },
        {} as Record<string, boolean>
      )
    },
    onSortingChange: setSorting,
    onRowSelectionChange: (updater) => {
      const newSelection =
        typeof updater === 'function'
          ? updater(
              selectedProducts.reduce(
                (acc, id) => {
                  const index = (pagedResponse?.content ?? []).findIndex((p) => p.id === id);
                  if (index !== -1) acc[index] = true;
                  return acc;
                },
                {} as Record<string, boolean>
              )
            )
          : updater;

      const newSelectedProducts = Object.keys(newSelection)
        .filter((key) => newSelection[key])
        .map((key) => (pagedResponse?.content ?? [])[parseInt(key)]?.id)
        .filter((id) => id !== undefined);

      setSelectedProducts(newSelectedProducts);
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true,
    manualSorting: true
  });

  useEffect(() => {
    submitForm();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        제품관리
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <Select
                value={values.section}
                onChange={handleChange}
                name="section"
                sx={{
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D5DB'
                  }
                }}
              >
                <MenuItem value="구간수수료 여부">구간수수료 여부</MenuItem>
                <MenuItem value="Y">Y</MenuItem>
                <MenuItem value="N">N</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <FormControl fullWidth size="small">
              <Select
                value={values.searchType}
                onChange={handleChange}
                name="searchType"
                sx={{
                  borderRadius: '8px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#D1D5DB'
                  }
                }}
              >
                <MenuItem value="제품코드">제품코드</MenuItem>
                <MenuItem value="제약사">제약사</MenuItem>
                <MenuItem value="비고">비고</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              size="small"
              name="searchKeyword"
              value={values.searchKeyword}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  '& fieldset': {
                    borderColor: '#D1D5DB'
                  }
                }
              }}
              InputProps={{
                endAdornment: (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                      color: '#6B7280',
                      '&:hover': { color: '#374151' }
                    }}
                    onClick={submitForm}
                  >
                    <SearchNormal1 size="20" />
                  </Box>
                )
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  submitForm();
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              onClick={submitForm}
              disabled={isLoading}
              sx={{
                width: '100%',
                height: '40px',
                bgcolor: '#6366F1',
                borderRadius: '8px',
                '&:hover': { bgcolor: '#5856EB' },
                '&:disabled': { bgcolor: '#D1D5DB' }
              }}
            >
              조회
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            필터
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <Select
                  value={values.status}
                  onChange={handleChange}
                  name="status"
                  sx={{
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  <MenuItem value="전체">전체</MenuItem>
                  <MenuItem value="자사">자사</MenuItem>
                  <MenuItem value="수수료변경">수수료변경</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <Select
                  value={values.productCategory}
                  onChange={handleChange}
                  name="productCategory"
                  sx={{
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  <MenuItem value="전체">전체</MenuItem>
                  <MenuItem value="오리지널">오리지널</MenuItem>
                  <MenuItem value="제네릭">제네릭</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Checkbox checked={values.newProduct} onChange={handleChange} name="newProduct" size="small" />
                  <Typography variant="body2">신제품</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Checkbox checked={values.prescription} onChange={handleChange} name="prescription" size="small" />
                  <Typography variant="body2">처방전</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Checkbox checked={values.sectionFee} onChange={handleChange} name="sectionFee" size="small" />
                  <Typography variant="body2">구간수수료</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Checkbox checked={values.etc} onChange={handleChange} name="etc" size="small" />
                  <Typography variant="body2">품절</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body1">
          검색결과: <strong>{isLoading ? '...' : pagedResponse?.totalElements ?? 0}</strong> 건
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            onClick={() => openNotImplementedDialog('삭제')}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 2,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            삭제
          </Button>
          <Button
            variant="contained"
            onClick={() => openNotImplementedDialog('추가')}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 2,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            추가
          </Button>
          <Button
            variant="contained"
            onClick={() => setUploadDialogOpen(true)}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 2,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            파일업로드
          </Button>
          <Button
            variant="contained"
            onClick={() => openNotImplementedDialog('엑셀다운로드')}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 2,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            엑셀다운로드
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell
                    key={header.id}
                    align="center"
                    sx={{
                      fontWeight: 600,
                      cursor: header.column.getCanSort() ? 'pointer' : 'default'
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽'
                      }[header.column.getIsSorted() as string] ?? null}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    데이터를 불러오는 중...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    cursor: 'pointer',
                    '&:hover': {
                      bgcolor: '#F9FAFB'
                    }
                  }}
                  onClick={() => {
                    navigate(`/admin/products/${row.original.id}`);
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} align="center">
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

      <FileUploadDialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} />
    </Box>
  );
}
