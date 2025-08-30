import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
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
  Typography,
} from '@mui/material';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { getAdminMembers, MemberResponse } from 'medipanda/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { MEMBER_ACCOUNT_STATUS_LABELS, MEMBER_ROLE_LABELS } from 'medipanda/ui-labels';
import { backendNotImplemented } from 'medipanda/utils/backendNotImplemented';
import { formatYyyyMmDdHhMm } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function MpAdminAdminList() {
  const [data, setData] = useState<Sequenced<MemberResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      type: 'name',
      keyword: '',
      pageIndex: 0,
      pageSize: 20,
    },
    onSubmit: async () => {
      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    },
  });

  const handleReset = () => {
    formik.resetForm();
  };

  const columns: ColumnDef<Sequenced<MemberResponse>>[] = [
    {
      header: 'No',
      cell: ({ row }) => row.original.sequence,
      size: 60,
    },
    {
      header: '아이디',
      cell: ({ row }) => row.original.userId,
      size: 120,
    },
    {
      header: '관리자',
      cell: ({ row }) => (
        <Link to={`/admin/admins/${row.original.userId}/edit`} style={{ textDecoration: 'none', color: '#1976d2' }}>
          {row.original.name}
        </Link>
      ),
      size: 120,
    },
    {
      header: '이메일',
      cell: ({ row }) => row.original.email,
      size: 200,
    },
    {
      header: '연락처',
      cell: ({ row }) => row.original.phoneNumber,
      size: 150,
    },
    {
      header: '권한',
      cell: ({ row }) => {
        return MEMBER_ROLE_LABELS[row.original.role];
      },
      size: 100,
    },
    {
      header: '상태',
      cell: ({ row }) => {
        return <Chip label={MEMBER_ACCOUNT_STATUS_LABELS[row.original.accountStatus]} color='success' variant='light' size='small' />;
      },
      size: 80,
    },
    {
      header: '등록일',
      cell: ({ row }) => formatYyyyMmDdHhMm(row.original.registrationDate),
      size: 150,
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination: {
        pageIndex: formik.values.pageIndex,
        pageSize: formik.values.pageSize,
      },
    },
    pageCount: totalPages,
    manualPagination: true,
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
      errorDialog.showError('관리자 목록을 불러오는 중 오류가 발생했습니다.');
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
        <Typography variant='h4' gutterBottom>
          관리자 권한
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='type' value={formik.values.type} onChange={formik.handleChange}>
                      <MenuItem value={'name'}>관리자명</MenuItem>
                      <MenuItem value={'userId'}>아이디</MenuItem>
                      <MenuItem value={'email'}>이메일</MenuItem>
                      <MenuItem value={'phoneNumber'}>연락처</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    name='keyword'
                    size='small'
                    placeholder='검색어를 입력하세요'
                    fullWidth
                    value={formik.values.keyword}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button variant='contained' size='small' type='submit'>
                    검색
                  </Button>
                  <Button variant='outlined' size='small' onClick={handleReset}>
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
            <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
              <Stack direction='row' spacing={2}>
                <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
              </Stack>
              <Stack direction='row' spacing={1}>
                <Button variant='contained' size='small' color='success' component={Link} to='/admin/admins/new'>
                  등록
                </Button>
              </Stack>
            </Stack>

            <ScrollX>
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
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
                        <TableCell colSpan={columns.length} align='center' sx={{ py: 3 }}>
                          <Typography variant='body2' color='text.secondary'>
                            데이터를 로드하는 중입니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align='center' sx={{ py: 3 }}>
                          <Typography variant='body2' color='text.secondary'>
                            검색 결과가 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map(row => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map(cell => (
                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </ScrollX>

            <Stack direction='row' justifyContent='center' sx={{ mt: 2 }}>
              <Pagination
                count={totalPages}
                page={formik.values.pageIndex + 1}
                onChange={(_, value) => formik.setFieldValue('pageIndex', value - 1)}
                color='primary'
                variant='outlined'
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
