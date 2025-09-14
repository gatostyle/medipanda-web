import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  Link,
  MenuItem,
  Pagination,
  PaginationItem,
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
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { AccountStatusLabel, getUserMembers, MemberResponse, Role, RoleLabel } from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { formatYyyyMmDdHhMm } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminAdminList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'name' | 'userId' | 'email' | 'phoneNumber' | '',
    searchKeyword: '',
    page: '1',
  };

  const { searchType, searchKeyword, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setcontents] = useState<Sequenced<MemberResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { alert, alertError } = useMpModal();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      page: null,
    },
    onSubmit: async values => {
      if (values.searchType === '' && values.searchKeyword !== '') {
        await alert('검색유형을 선택해주세요.');
        return;
      }

      const url = setUrlParams(
        {
          ...values,
          page: 1,
        },
        initialSearchParams,
      );

      navigate(url);
    },
    onReset: () => {
      navigate('');
    },
  });

  const fetchContents = async () => {
    setLoading(true);
    try {
      const response = await getUserMembers({
        roles: [Role.ADMIN, Role.SUPER_ADMIN],
        name: searchType === 'name' && searchKeyword !== '' ? searchKeyword : undefined,
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        email: searchType === 'email' && searchKeyword !== '' ? searchKeyword : undefined,
        phoneNumber: searchType === 'phoneNumber' && searchKeyword !== '' ? searchKeyword : undefined,
        page: page - 1,
        size: pageSize,
      });

      setcontents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch admin list:', error);
      await alertError('관리자 목록을 불러오는 중 오류가 발생했습니다.');
      setcontents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    formik.setValues({
      searchType,
      searchKeyword,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, page]);

  const table = useReactTable({
    data: contents,
    columns: [
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
          <Link component={RouterLink} to={`/admin/admins/${row.original.userId}/edit`}>
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
        cell: ({ row }) => RoleLabel[row.original.role],
        size: 100,
      },
      {
        header: '상태',
        cell: ({ row }) => {
          return <Chip label={AccountStatusLabel[row.original.accountStatus]} color='success' variant='light' size='small' />;
        },
        size: 80,
      },
      {
        header: '등록일',
        cell: ({ row }) => formatYyyyMmDdHhMm(row.original.registrationDate),
        size: 150,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

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
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={'name'}>관리자명</MenuItem>
                      <MenuItem value={'userId'}>아이디</MenuItem>
                      <MenuItem value={'email'}>이메일</MenuItem>
                      <MenuItem value={'phoneNumber'}>연락처</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    name='searchKeyword'
                    size='small'
                    placeholder='검색어를 입력하세요'
                    fullWidth
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button variant='contained' size='small' type='submit'>
                    검색
                  </Button>
                  <Button variant='outlined' size='small' onClick={() => formik.resetForm()}>
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
                <Button variant='contained' size='small' color='success' component={RouterLink} to='/admin/admins/new'>
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
                        <TableCell colSpan={table.getAllColumns().length} align='center' sx={{ py: 3 }}>
                          <Typography variant='body2' color='text.secondary'>
                            데이터를 로드하는 중입니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={table.getAllColumns().length} align='center' sx={{ py: 3 }}>
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
                page={page}
                renderItem={item => (
                  <PaginationItem
                    {...item}
                    color='primary'
                    variant='outlined'
                    component={RouterLink}
                    to={setUrlParams({ page: item.page }, initialSearchParams)}
                  />
                )}
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
