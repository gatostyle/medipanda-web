import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
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
import { getAdminMembers, MemberResponse } from 'medipanda/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { MEMBER_ACCOUNT_STATUS_LABELS, MEMBER_ROLE_LABELS } from 'medipanda/ui-labels';
import { backendNotImplemented } from 'medipanda/utils/backendNotImplemented';
import { formatYyyyMmDdHhMm } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function MpAdminAdminList() {
  const navigate = useNavigate();
  const [data, setData] = useState<Sequenced<MemberResponse>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const formik = useFormik({
    initialValues: {
      type: 'name',
      keyword: '',
      pageIndex: 0,
      pageSize: 20
    },
    onSubmit: () => {
      if (formik.values.pageIndex !== 0) {
        formik.setFieldValue('pageIndex', 0);
      } else {
        fetchData();
      }
    }
  });

  const columns = useMemo<ColumnDef<Sequenced<MemberResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        cell: ({ row }) => row.original.sequence,
        size: 60
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        cell: ({ row }) => row.original.userId,
        size: 120
      },
      {
        header: '관리자',
        accessorKey: 'name',
        cell: ({ row }) => (
          <Link to={`/admin/admins/${row.original.userId}/edit`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.name}
          </Link>
        ),
        size: 120
      },
      {
        header: '이메일',
        accessorKey: 'email',
        cell: ({ row }) => row.original.email,
        size: 200
      },
      {
        header: '연락처',
        accessorKey: 'phoneNumber',
        cell: ({ row }) => row.original.phoneNumber,
        size: 150
      },
      {
        header: '권한',
        cell: ({ row }) => {
          return MEMBER_ROLE_LABELS[row.original.role];
        },
        size: 100
      },
      {
        header: '상태',
        cell: ({ row }) => {
          return <Chip label={MEMBER_ACCOUNT_STATUS_LABELS[row.original.accountStatus]} color="success" variant="light" size="small" />;
        },
        size: 80
      },
      {
        header: '등록일',
        accessorKey: 'registrationDate',
        cell: ({ row }) => formatYyyyMmDdHhMm(row.original.registrationDate),
        size: 150
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
      if (formik.values.keyword) {
        backendNotImplemented();
      }

      const response = await getAdminMembers({ page: formik.values.pageIndex, size: formik.values.pageSize });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch admin list:', error);
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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          관리자 권한
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <Select
                      name="type"
                      value={formik.values.type}
                      onChange={(e) => formik.setFieldValue('type', e.target.value)}
                      displayEmpty
                    >
                      <MenuItem value="name">관리자명</MenuItem>
                      <MenuItem value="userId">아이디</MenuItem>
                      <MenuItem value="email">이메일</MenuItem>
                      <MenuItem value="phoneNumber">연락처</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    name="keyword"
                    size="small"
                    placeholder="검색어를 입력하세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.keyword}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button variant="contained" size="small" type="submit">
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
              <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="contained" size="small" color="success" onClick={() => navigate('/admin/admins/new')}>
                  등록하기
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
