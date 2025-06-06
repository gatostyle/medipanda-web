import Grid from '@mui/material/Grid';
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, SortingState, useReactTable } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '@mui/material/Button';
import { useFormik } from 'formik';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import { Pagination } from '@mui/material';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import { HeaderSort } from 'components/third-party/react-table';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { Add } from 'iconsax-react';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { MpPagedResponse } from 'api-definitions/MpPaged';
import { MpAdmin, mpFetchAdmins } from 'api-definitions/MpAdmin';

export default function MpAdminPermissionAdminList() {
  const emptyData = useMemo(() => [], []);
  const { showError } = useMpErrorDialog();

  const [pagedResponse, setPagedResponse] = useState<MpPagedResponse<MpAdmin> | null>(null);

  const { values, setValues, submitForm, handleChange } = useFormik({
    initialValues: {
      pageSize: 10,
      pageIndex: 0,
      sorting: [{ id: 'id', desc: true }] as SortingState,
      searchType: 'userId',
      searchKeyword: ''
    },
    onSubmit: async (values) => {
      try {
        setPagedResponse(null);

        const response = await mpFetchAdmins({
          page: values.pageIndex,
          size: values.pageSize,
          sortProperty: values.sorting[0].id as keyof MpAdmin,
          descending: values.sorting[0].desc,
          [values.searchType]: values.searchKeyword
        });
        setPagedResponse(response);
      } catch (e: any) {
        console.error('Failed to fetch admins', e);
        showError('관리자 목록을 불러오는 중 오류가 발생했습니다.');
      }
    }
  });

  const columns: ColumnDef<MpAdmin>[] = [
    {
      header: 'No',
      cell: ({ row }) => row.index + 1,
      size: 70
    },
    {
      id: 'userId',
      header: '아이디',
      cell: ({ row }) => row.original.userId
    },
    {
      id: 'name',
      header: '관리자',
      cell: ({ row }) => row.original.name
    },
    {
      id: 'email',
      header: '이메일',
      cell: ({ row }) => row.original.email
    },
    {
      id: 'phone',
      header: '연락처',
      cell: ({ row }) => row.original.phone
    },
    {
      id: 'role',
      header: '권한',
      cell: ({ row }) => row.original.role
    },
    {
      id: 'state',
      header: '상태',
      cell: ({ row }) => (
        <Box
          sx={{
            display: 'inline-block',
            px: 1.5,
            py: 0.5,
            borderRadius: '4px',
            backgroundColor: row.original.state ? '#E5E7EB' : '#FEE2E2',
            color: row.original.state ? '#374151' : '#991B1B',
            fontSize: '14px'
          }}
        >
          {row.original.state ? '활성' : '비활성'}
        </Box>
      )
    },
    {
      id: 'createdAt',
      header: '등록일',
      cell: ({ row }) => row.original.createdAt
    },
    {
      id: 'manage',
      header: '관리',
      cell: ({ row }) => (
        <Button
          component={Link}
          to={`edit?id=${row.original.id}`}
          variant="contained"
          size="small"
          sx={{
            backgroundColor: '#10B981',
            '&:hover': {
              backgroundColor: '#059669'
            }
          }}
        >
          수정
        </Button>
      )
    }
  ];

  const table = useReactTable({
    data: pagedResponse?.content ?? emptyData,
    columns,
    state: { sorting: values.sorting },
    onSortingChange: async (updaterOrValue) => {
      await setValues({
        ...values,
        sorting: typeof updaterOrValue === 'function' ? updaterOrValue(values.sorting) : updaterOrValue
      });
      await submitForm();
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel()
  });

  useEffect(() => {
    submitForm();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontSize: '24px', fontWeight: 600 }}>
            관리자 권한
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <Select name="searchType" value={values.searchType} onChange={handleChange}>
                    <MenuItem value="userId">아이디</MenuItem>
                    <MenuItem value="email">이메일</MenuItem>
                    <MenuItem value="phone">연락처</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={7}>
                <TextField
                  fullWidth
                  size="small"
                  name="searchKeyword"
                  value={values.searchKeyword}
                  onChange={handleChange}
                  placeholder="검색어를 입력하세요"
                />
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => submitForm()}
                  sx={{
                    bgcolor: '#6B7280',
                    '&:hover': {
                      bgcolor: '#4B5563'
                    }
                  }}
                >
                  검색
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography>
            검색결과: <strong>{pagedResponse?.totalElements ?? 0}</strong> 건
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            to="edit"
            sx={{
              bgcolor: '#10B981',
              '&:hover': {
                bgcolor: '#059669'
              }
            }}
          >
            등록하기
          </Button>
        </Grid>

        <Grid item xs={12}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F3F4F6' }}>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell
                        key={header.id}
                        align="center"
                        sx={{
                          fontWeight: 600,
                          color: '#374151',
                          cursor: header.column.getCanSort() ? 'pointer' : 'default'
                        }}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                          <Box>{flexRender(header.column.columnDef.header, header.getContext())}</Box>
                          {header.column.getCanSort() && <HeaderSort column={header.column} />}
                        </Stack>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {pagedResponse === null ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                      데이터를 불러오는 중입니다.
                    </TableCell>
                  </TableRow>
                ) : pagedResponse?.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 8 }}>
                      데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:hover': {
                          bgcolor: '#F9FAFB'
                        }
                      }}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          align="center"
                          sx={{
                            color: '#111827',
                            fontSize: '14px'
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
              count={pagedResponse?.totalPages ?? 1}
              page={(pagedResponse?.pageable.pageNumber ?? 0) + 1}
              onChange={async (event, page) => {
                await setValues({
                  ...values,
                  pageIndex: page - 1
                });
                await submitForm();
              }}
              color="primary"
              shape="rounded"
              sx={{
                '& .MuiPaginationItem-root': {
                  margin: '0 4px'
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
