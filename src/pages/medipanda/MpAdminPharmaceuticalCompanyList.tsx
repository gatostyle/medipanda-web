import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { ExportSquare } from 'iconsax-react';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { MpPagedResponse } from 'api-definitions/MpPaged';
import {
  mpFetchPharmaceuticalCompanies,
  MpPharmaceuticalCompany,
  MpPharmaceuticalCompanySearchRequest
} from 'api-definitions/MpPharmaceuticalCompany';

interface FormValues {
  pageSize: number;
  pageIndex: number;
  sorting: SortingState;
  searchKeyword: string;
}

export default function MpAdminPharmaceuticalCompanyList() {
  const navigate = useNavigate();
  const emptyData = useMemo(() => [], []);
  const [pagedResponse, setPagedResponse] = useState<MpPagedResponse<MpPharmaceuticalCompany> | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const { values, setValues, handleChange, submitForm } = useFormik<FormValues>({
    initialValues: {
      pageSize: 10,
      pageIndex: 0,
      sorting: [],
      searchKeyword: ''
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const searchRequest: MpPharmaceuticalCompanySearchRequest = {
          page: values.pageIndex,
          size: values.pageSize,
          searchKeyword: values.searchKeyword
        };
        const response = await mpFetchPharmaceuticalCompanies(searchRequest);
        setPagedResponse(response);
      } catch (error) {
        console.error('Failed to fetch pharmaceutical companies:', error);
        showError('제약사 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  const columns: ColumnDef<MpPharmaceuticalCompany>[] = [
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
      id: 'companyName',
      header: '제약사',
      accessorKey: 'companyName',
      cell: ({ row }) => (
        <Typography
          sx={{
            color: '#3B82F6',
            textDecoration: 'underline',
            cursor: 'pointer',
            '&:hover': { color: '#1E40AF' }
          }}
        >
          {row.original.companyName}
        </Typography>
      )
    },
    {
      id: 'totalQuantity',
      header: '등록제품 수',
      accessorKey: 'totalQuantity'
    },
    {
      id: 'soldQuantity',
      header: '계약희원수',
      accessorKey: 'soldQuantity'
    },
    {
      id: 'manager',
      header: '정산일',
      accessorKey: 'manager'
    },
    {
      id: 'managerName',
      header: '계약담당자',
      accessorKey: 'managerName'
    },
    {
      id: 'actions',
      header: '',
      cell: () => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            size="small"
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              openNotImplementedDialog('삭제');
            }}
            sx={{
              bgcolor: '#EF4444',
              borderRadius: '6px',
              px: 2,
              '&:hover': { bgcolor: '#DC2626' }
            }}
          >
            삭제
          </Button>
        </Box>
      ),
      size: 80
    },
    {
      id: 'contractDate',
      header: '계약일',
      accessorKey: 'contractDate'
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
    navigate(`/admin/pharmaceutical/companies/${id}`);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        제약사
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
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
          <Grid item xs={12} sm={4}>
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
        <Typography variant="body1">
          검색결과: <strong>{isLoading ? '...' : pagedResponse?.totalElements ?? 0}</strong> 건
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
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
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    데이터를 불러오는 중...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : pagedResponse === null || pagedResponse.content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
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
                        if (cell.column.id === 'select' || cell.column.id === 'actions') {
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
