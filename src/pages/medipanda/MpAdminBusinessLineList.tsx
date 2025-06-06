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
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { MpPagedResponse } from 'api-definitions/MpPaged';
import { MpBusinessLine, MpBusinessLineSearchRequest, mpFetchBusinessLines } from 'api-definitions/MpBusinessLine';

interface FormValues {
  pageSize: number;
  pageIndex: number;
  sorting: SortingState;
  searchType: string;
  searchKeyword: string;
  classification: string;
}

export default function MpAdminBusinessLineList() {
  const navigate = useNavigate();
  const emptyData = useMemo(() => [], []);
  const [pagedResponse, setPagedResponse] = useState<MpPagedResponse<MpBusinessLine> | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const { values, setValues, handleChange, submitForm } = useFormik<FormValues>({
    initialValues: {
      pageSize: 10,
      pageIndex: 0,
      sorting: [],
      searchType: '회원번호',
      searchKeyword: '',
      classification: ''
    },
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const searchRequest: MpBusinessLineSearchRequest = {
          page: values.pageIndex,
          size: values.pageSize,
          searchType:
            values.searchType === '회원번호'
              ? 'memberNo'
              : values.searchType === '아이디'
                ? 'userId'
                : values.searchType === '회원명'
                  ? 'memberName'
                  : values.searchType === '딜러명'
                    ? 'dealerName'
                    : values.searchType === '거래처명'
                      ? 'businessName'
                      : 'memberNo',
          searchKeyword: values.searchKeyword,
          classification: values.classification
        };
        const response = await mpFetchBusinessLines(searchRequest);
        setPagedResponse(response);
      } catch (error) {
        console.error('거래선 목록 조회 오류:', error);
        showError('거래선 목록을 조회하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }
  });

  const columns: ColumnDef<MpBusinessLine>[] = [
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
      id: 'memberNo',
      header: '회원번호',
      accessorKey: 'memberNo'
    },
    {
      id: 'userId',
      header: '아이디',
      accessorKey: 'userId'
    },
    {
      id: 'memberName',
      header: '회원명',
      accessorKey: 'memberName'
    },
    {
      id: 'classification',
      header: '유형',
      accessorKey: 'classification'
    },
    {
      id: 'dealerNo',
      header: '딜러번호',
      accessorKey: 'dealerNo'
    },
    {
      id: 'dealerName',
      header: '딜러명',
      accessorKey: 'dealerName'
    },
    {
      id: 'businessName',
      header: '거래처명',
      accessorKey: 'businessName'
    },
    {
      id: 'businessRegistrationNo',
      header: '사업자등록번호',
      accessorKey: 'businessRegistrationNo'
    },
    {
      id: 'dealerRegistrationDate',
      header: '딜러 지정일',
      accessorKey: 'dealerRegistrationDate'
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

  const handleAddNew = () => {
    navigate('/admin/business-lines/edit');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        거래선관리(필터링)
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <Select
                value={values.searchType}
                onChange={handleChange}
                name="searchType"
                sx={{
                  borderRadius: '20px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10B981'
                  }
                }}
              >
                <MenuItem value="회원번호">회원번호</MenuItem>
                <MenuItem value="아이디">아이디</MenuItem>
                <MenuItem value="회원명">회원명</MenuItem>
                <MenuItem value="딜러명">딜러명</MenuItem>
                <MenuItem value="거래처명">거래처명</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <Select
                value={values.classification}
                onChange={handleChange}
                name="classification"
                displayEmpty
                sx={{
                  borderRadius: '20px',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#10B981'
                  }
                }}
              >
                <MenuItem value="">계약유형</MenuItem>
                <MenuItem value="법인">법인</MenuItem>
                <MenuItem value="개인">개인</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              name="searchKeyword"
              value={values.searchKeyword}
              onChange={handleChange}
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
              px: 3,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            삭제
          </Button>
          <Button
            variant="contained"
            onClick={handleAddNew}
            sx={{
              bgcolor: '#10B981',
              borderRadius: '6px',
              px: 3,
              '&:hover': { bgcolor: '#059669' }
            }}
          >
            등록
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
                  onClick={() => navigate(`/admin/business-lines/edit/${row.original.id}`)}
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
