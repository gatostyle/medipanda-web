import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Box,
  Button,
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
import { DatePicker } from '@mui/x-date-pickers';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { BoardPostResponse, BoardType, DateString, getBoards } from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { formatYyyyMmDd } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminInquiryList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'name' | 'drugCompany' | 'userId' | '',
    searchKeyword: '',
    startAt: '',
    endAt: '',
    includeChild: '' as 'true' | 'false' | '',
    page: '1',
  };

  const { searchType, searchKeyword, startAt, endAt, includeChild, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<BoardPostResponse>[]>([]);
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
      const response = await getBoards({
        boardType: BoardType.INQUIRY,
        name: searchType === 'name' && searchKeyword !== '' ? searchKeyword : undefined,
        drugCompany: searchType === 'drugCompany' && searchKeyword !== '' ? searchKeyword : undefined,
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        startAt: startAt ? new DateString(startAt) : undefined,
        endAt: endAt ? new DateString(endAt) : undefined,
        includeChild: includeChild === '' ? undefined : includeChild === 'true',
        page: page - 1,
        size: pageSize,
      });
      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch inquiry list:', error);
      await alertError('1:1 문의내역을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
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
      startAt,
      endAt,
      includeChild,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, startAt, endAt, includeChild, page]);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '회원번호',
        cell: ({ row }) => row.original.id,
        size: 100,
      },
      {
        header: '아이디',
        cell: ({ row }) => row.original.userId,
        size: 120,
      },
      {
        header: '회원명',
        cell: ({ row }) => row.original.name,
        size: 100,
      },
      {
        header: '회사명',
        cell: ({ row }) => '-',
        size: 150,
      },
      {
        header: '제목',
        cell: ({ row }) => (
          <Link component={RouterLink} to={`/admin/inquiries/${row.original.id}`}>
            {row.original.title}
          </Link>
        ),
        size: 250,
      },
      {
        header: '문의일',
        cell: ({ row }) => formatYyyyMmDd(row.original.createdAt),
        size: 100,
      },
      {
        header: '답변일',
        cell: ({ row }) => {
          if (row.original.hasChildren) {
            return formatYyyyMmDd(row.original.createdAt);
          } else {
            return '-';
          }
        },
        size: 100,
      },
      {
        header: '처리상태',
        cell: ({ row }) => {
          if (row.original.hasChildren) {
            return '처리완료';
          } else {
            return '처리중';
          }
        },
        size: 100,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          1:1 문의내역
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>처리상태</InputLabel>
                    <Select name='includeChild' value={formik.values.includeChild} onChange={formik.handleChange}>
                      <MenuItem value={''}>전체</MenuItem>
                      <MenuItem value={'false'}>답변대기중</MenuItem>
                      <MenuItem value={'true'}>답변완료</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={'name'}>회원명</MenuItem>
                      <MenuItem value={'drugCompany'}>회사명</MenuItem>
                      <MenuItem value={'userId'}>아이디</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <DatePicker
                    value={formik.values.startAt}
                    onChange={value => formik.setFieldValue('startAt', value)}
                    format='yyyy-MM-dd'
                    views={['year', 'month', 'day']}
                    label='시작일'
                    slotProps={{
                      textField: {
                        size: 'small',
                      },
                    }}
                  />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <DatePicker
                    value={formik.values.endAt}
                    onChange={value => formik.setFieldValue('endAt', value)}
                    format='yyyy-MM-dd'
                    views={['year', 'month', 'day']}
                    label='종료일'
                    slotProps={{
                      textField: {
                        size: 'small',
                      },
                    }}
                  />
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
