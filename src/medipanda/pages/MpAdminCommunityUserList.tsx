import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Button,
  Card,
  FormControl,
  Grid,
  InputLabel,
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
import { useFormik } from 'formik';
import { BoardMemberStatsResponse, ContractStatus, ContractStatusLabel, getBoardMembers } from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminCommunityUserList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'userId' | 'name' | 'nickname' | 'phoneNumber' | 'email' | '',
    searchKeyword: '',
    contractStatus: '' as ContractStatus | '',
    page: '1',
  };

  const { searchType, searchKeyword, contractStatus, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<BoardMemberStatsResponse>[]>([]);
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
        await alert('검색유형을 선택하세요.');
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
      const response = await getBoardMembers({
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        name: searchType === 'name' && searchKeyword !== '' ? searchKeyword : undefined,
        nickname: searchType === 'nickname' && searchKeyword !== '' ? searchKeyword : undefined,
        phoneNumber: searchType === 'phoneNumber' && searchKeyword !== '' ? searchKeyword : undefined,
        email: searchType === 'email' && searchKeyword !== '' ? searchKeyword : undefined,
        contractStatus: contractStatus !== '' ? contractStatus : undefined,
        startAt: undefined,
        endAt: undefined,
        filterDeleted: undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch board members:', error);
      await alertError('이용자 목록을 불러오는 중 오류가 발생했습니다.');
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
      contractStatus,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, contractStatus, page]);

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
        header: '휴대폰번호',
        cell: ({ row }) => row.original.phoneNumber,
        size: 130,
      },
      {
        header: '파트너사 계약여부',
        cell: ({ row }) => ContractStatusLabel[row.original.contractStatus],
        size: 130,
      },
      {
        header: '작성글 수',
        cell: ({ row }) => row.original.postCount,
        size: 100,
      },
      {
        header: '댓글 수',
        cell: ({ row }) => row.original.commentCount,
        size: 100,
      },
      {
        header: '좋아요 수',
        cell: ({ row }) => row.original.totalLikes,
        size: 100,
      },
      {
        header: '블라인드 글 수',
        cell: ({ row }) => row.original.blindPostCount,
        size: 120,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          이용자 관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ padding: 3 }}>
          <SearchFilterBar component='form' onSubmit={formik.handleSubmit}>
            <SearchFilterItem minWidth={140}>
              <FormControl fullWidth size='small'>
                <InputLabel>파트너사 계약여부</InputLabel>
                <Select name='contractStatus' value={formik.values.contractStatus} onChange={formik.handleChange} size='small'>
                  {Object.keys(ContractStatus).map(contractStatus => (
                    <MenuItem key={contractStatus} value={contractStatus}>
                      {ContractStatusLabel[contractStatus]}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </SearchFilterItem>
            <SearchFilterItem minWidth={140}>
              <FormControl fullWidth size='small'>
                <InputLabel>검색유형</InputLabel>
                <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                  <MenuItem value={'userId'}>아이디</MenuItem>
                  <MenuItem value={'name'}>이름</MenuItem>
                  <MenuItem value={'nickname'}>닉네임</MenuItem>
                  <MenuItem value={'phoneNumber'}>연락처</MenuItem>
                  <MenuItem value={'email'}>이메일</MenuItem>
                </Select>
              </FormControl>
            </SearchFilterItem>
            <SearchFilterItem flexGrow={1} minWidth={200}>
              <TextField
                fullWidth
                name='searchKeyword'
                value={formik.values.searchKeyword}
                onChange={formik.handleChange}
                placeholder='검색어를 입력하세요'
                size='small'
              />
            </SearchFilterItem>
            <SearchFilterActions>
              <Button type='submit' variant='contained' size='small'>
                검색
              </Button>
              <Button variant='outlined' size='small' onClick={() => formik.resetForm()}>
                초기화
              </Button>
            </SearchFilterActions>
          </SearchFilterBar>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ padding: 3 }}>
          <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
            <Stack direction='row' spacing={2}>
              <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
            </Stack>
          </Stack>

          <TableContainer sx={{ overflowX: 'auto' }}>
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
        </Card>
      </Grid>
    </Grid>
  );
}
