import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
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
import Pagination from '@mui/material/Pagination';
import { SearchFilterBar, SearchFilterItem, SearchFilterActions } from 'medipanda/components/SearchFilterBar';
import { BoardMemberStatsResponse, getBoardMembers } from 'medipanda/backend';
import { Sequenced } from 'medipanda/utils/withSequence';
import { withSequence } from 'medipanda/utils/withSequence';

export default function MpAdminCommunityUserList() {
  const [data, setData] = useState<Sequenced<BoardMemberStatsResponse>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const formik = useFormik({
    initialValues: {
      contractStatus: 'all' as 'all' | 'CONTRACT' | 'NON_CONTRACT',
      searchField: 'userId' as 'userId' | 'nickname',
      searchKeyword: ''
    },
    onSubmit: (values) => {
      setPagination({ pageIndex: 0, pageSize: 20 });
      fetchData(0, values);
    }
  });

  const fetchData = async (page: number, searchValues?: typeof formik.values) => {
    const values = searchValues || formik.values;
    setLoading(true);
    try {
      const response = await getBoardMembers({
        userId: values.searchField === 'userId' && values.searchKeyword ? values.searchKeyword : undefined,
        name: undefined,
        nickname: values.searchField === 'nickname' && values.searchKeyword ? values.searchKeyword : undefined,
        phoneNumber: undefined,
        email: undefined,
        contractStatus: values.contractStatus !== 'all' ? values.contractStatus : undefined,
        startAt: undefined,
        endAt: undefined,
        filterDeleted: undefined,
        page,
        size: pagination.pageSize
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch board members:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(0);
  }, []);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    const newPageIndex = value - 1;
    setPagination({ ...pagination, pageIndex: newPageIndex });
    fetchData(newPageIndex);
  };

  const columns = useMemo<ColumnDef<Sequenced<BoardMemberStatsResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        size: 60
      },
      {
        header: '회원번호',
        accessorKey: 'memberBaseId',
        size: 100
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        size: 120
      },
      {
        header: '회원명',
        accessorKey: 'name',
        size: 100
      },
      {
        header: '닉네임',
        accessorKey: 'nickname',
        size: 120,
        cell: ({ row }) => row.original.name
      },
      {
        header: '휴대폰번호',
        accessorKey: 'phoneNumber',
        size: 130
      },
      {
        header: '이메일',
        accessorKey: 'email',
        size: 200,
        cell: ({ row }) => {
          return `${row.original.userId}@example.com`;
        }
      },
      {
        header: '파트너사 계약여부',
        accessorKey: 'isContracted',
        size: 130,
        cell: ({ row }) => {
          const contractStatus = row.original.contractStatus;
          return contractStatus === 'CONTRACT' ? '계약' : '미계약';
        }
      },
      {
        header: '작성글 수',
        accessorKey: 'postCount',
        size: 100,
        cell: ({ row }) => {
          const value = row.original.postCount;
          return value !== undefined && value !== null ? value : 0;
        }
      },
      {
        header: '댓글 수',
        accessorKey: 'commentCount',
        size: 100,
        cell: ({ row }) => {
          const value = row.original.commentCount;
          return value !== undefined && value !== null ? value : 0;
        }
      },
      {
        header: '좋아요 수',
        accessorKey: 'likeCount',
        size: 100,
        cell: ({ row }) => {
          const value = row.original.totalLikes;
          return value !== undefined && value !== null ? value : 0;
        }
      },
      {
        header: '블라인드 글 수',
        accessorKey: 'blindPostCount',
        size: 120,
        cell: ({ row }) => {
          const value = row.original.blindPostCount;
          return value !== undefined && value !== null ? value : 0;
        }
      }
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    pageCount: totalPages,
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
                  <FormControl fullWidth>
                    <InputLabel>파트너사 계약여부</InputLabel>
                    <Select
                      name="contractStatus"
                      value={formik.values.contractStatus}
                      onChange={formik.handleChange}
                      label="파트너사 계약여부"
                      size="small"
                    >
                      <MenuItem value="all">전체</MenuItem>
                      <MenuItem value={'CONTRACT'}>계약</MenuItem>
                      <MenuItem value={'NON_CONTRACT'}>미계약</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth>
                    <InputLabel>회원번호</InputLabel>
                    <Select
                      name="searchField"
                      value={formik.values.searchField}
                      onChange={formik.handleChange}
                      label="회원번호"
                      size="small"
                    >
                      <MenuItem value="userId">아이디</MenuItem>
                      <MenuItem value="nickname">닉네임</MenuItem>
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
                  <Stack direction="row" spacing={1}>
                    <Button type="submit" variant="contained" size="small">
                      검색
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        formik.resetForm();
                        setPagination({ pageIndex: 0, pageSize: 20 });
                        fetchData(0);
                      }}
                    >
                      초기화
                    </Button>
                  </Stack>
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
                    {table.getRowModel().rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                          <Typography variant="body1" color="text.secondary">
                            검색한 결과가 없습니다.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id} hover>
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
                page={pagination.pageIndex + 1}
                onChange={handlePageChange}
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
