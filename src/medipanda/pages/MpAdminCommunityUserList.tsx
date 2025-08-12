import {
  Box,
  Button,
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
  Typography
} from '@mui/material';
import { ColumnDef, flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { BoardMemberStatsResponse, getBoardMembers } from 'medipanda/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useState } from 'react';

interface BoardMemberStatsResponseWithMockData extends BoardMemberStatsResponse {
  nickname: string;
  email: string;
}

function withMock<T extends BoardMemberStatsResponse>(data: T): T & BoardMemberStatsResponseWithMockData {
  return {
    ...data,
    nickname: '닉네임',
    email: 'mock001@example.com'
  };
}

export default function MpAdminCommunityUserList() {
  const [data, setData] = useState<Sequenced<BoardMemberStatsResponseWithMockData>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      contractStatus: '' as 'CONTRACT' | 'NON_CONTRACT' | '',
      searchType: 'userId' as 'userId' | 'nickname',
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 20
    },
    onSubmit: async () => {
      if (formik.values.pageIndex !== 0) {
        await formik.setFieldValue('pageIndex', 0);
      } else {
        await fetchData();
      }
    }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getBoardMembers({
        userId: formik.values.searchType === 'userId' && formik.values.searchKeyword ? formik.values.searchKeyword : undefined,
        name: undefined,
        nickname: formik.values.searchType === 'nickname' && formik.values.searchKeyword ? formik.values.searchKeyword : undefined,
        phoneNumber: undefined,
        email: undefined,
        contractStatus: formik.values.contractStatus !== '' ? formik.values.contractStatus : undefined,
        startAt: undefined,
        endAt: undefined,
        filterDeleted: undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize
      });

      setData(withSequence(response).content.map(withMock));
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch board members:', error);
      errorDialog.showError('이용자 목록을 불러오는 중 오류가 발생했습니다.');
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

  const handleReset = () => {
    formik.resetForm();
  };

  const columns: ColumnDef<Sequenced<BoardMemberStatsResponseWithMockData>>[] = [
    {
      header: 'No',
      accessorKey: 'sequence',
      cell: ({ row }) => row.original.sequence,
      size: 60
    },
    {
      header: '회원번호',
      accessorKey: 'id',
      cell: ({ row }) => row.original.id,
      size: 100
    },
    {
      header: '아이디',
      accessorKey: 'userId',
      cell: ({ row }) => row.original.userId,
      size: 120
    },
    {
      header: '회원명',
      accessorKey: 'name',
      cell: ({ row }) => row.original.name,
      size: 100
    },
    {
      header: '닉네임',
      accessorKey: 'nickname',
      cell: ({ row }) => row.original.nickname,
      size: 120
    },
    {
      header: '휴대폰번호',
      accessorKey: 'phoneNumber',
      cell: ({ row }) => row.original.phoneNumber,
      size: 130
    },
    {
      header: '이메일',
      accessorKey: 'email',
      cell: ({ row }) => row.original.email,
      size: 200
    },
    {
      header: '파트너사 계약여부',
      accessorKey: 'contractStatus',
      cell: ({ row }) => (row.original.contractStatus === 'CONTRACT' ? '계약' : '미계약'),
      size: 130
    },
    {
      header: '작성글 수',
      accessorKey: 'postCount',
      cell: ({ row }) => row.original.postCount,
      size: 100
    },
    {
      header: '댓글 수',
      accessorKey: 'commentCount',
      cell: ({ row }) => row.original.commentCount,
      size: 100
    },
    {
      header: '좋아요 수',
      accessorKey: 'totalLikes',
      cell: ({ row }) => row.original.totalLikes,
      size: 100
    },
    {
      header: '블라인드 글 수',
      accessorKey: 'blindPostCount',
      cell: ({ row }) => row.original.blindPostCount,
      size: 120
    }
  ];

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

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          이용자 관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>파트너사 계약여부</InputLabel>
                    <Select
                      name="contractStatus"
                      value={formik.values.contractStatus}
                      onChange={formik.handleChange}
                      label="파트너사 계약여부"
                      size="small"
                    >
                      <MenuItem value={'CONTRACT'}>계약</MenuItem>
                      <MenuItem value={'NON_CONTRACT'}>미계약</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>검색유형</InputLabel>
                    <Select name="searchType" value={formik.values.searchType} onChange={formik.handleChange} label="검색유형" size="small">
                      <MenuItem value={'userId'}>아이디</MenuItem>
                      <MenuItem value={'nickname'}>닉네임</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    fullWidth
                    name="searchKeyword"
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                    placeholder="검색어를 입력하세요"
                    size="small"
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Button type="submit" variant="contained" size="small">
                    검색
                  </Button>
                  <Button variant="outlined" size="small" onClick={handleReset}>
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
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Stack direction="row" spacing={2}>
                <Typography variant="subtitle1">검색결과: {totalElements.toLocaleString()} 건</Typography>
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
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            데이터를 로드하는 중입니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : table.getRowModel().rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                          <Typography variant="body2" color="text.secondary">
                            검색 결과가 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
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
