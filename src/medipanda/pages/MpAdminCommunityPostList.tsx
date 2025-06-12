import { useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
import Checkbox from '@mui/material/Checkbox';
import { SearchFilterBar, SearchFilterItem, SearchFilterActions } from 'medipanda/components/SearchFilterBar';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { BoardPostResponse, DateString, getBoards, toggleBlindStatus_1 } from 'medipanda/backend';
import { useMpDeleteDialog } from 'medipanda/hooks/useMpDeleteDialog';
import { Sequenced } from 'medipanda/utils/withSequence';
import { Link } from 'react-router-dom';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from 'medipanda/hooks/useMpInfoDialog';
import { BOARD_TYPE_LABELS } from 'medipanda/ui-labels';
import { withSequence } from 'medipanda/utils/withSequence';

interface BoardPostResponseWithMockData extends BoardPostResponse {
  userId: string;
  memberName: string;
  partnerContractStatus: 'NONE' | 'CSO' | 'INDIVIDUAL' | 'ORGANIZATION';
}

function withMock<T extends BoardPostResponse>(data: T): T & BoardPostResponseWithMockData {
  return {
    ...data,
    userId: '아이디',
    memberName: '사용자명',
    partnerContractStatus: Math.random() > 0.5 ? 'CSO' : 'NONE'
  };
}

export default function MpAdminCommunityPostList() {
  const [data, setData] = useState<Sequenced<BoardPostResponseWithMockData>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const deleteDialog = useMpDeleteDialog();
  const errorDialog = useMpErrorDialog();
  const infoDialog = useMpInfoDialog();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const formik = useFormik({
    initialValues: {
      boardType: 'all' as
        | 'all'
        | 'ANONYMOUS'
        | 'MR_CSO_MATCHING'
        | 'NOTICE'
        | 'INQUIRY'
        | 'FAQ'
        | 'CSO_A_TO_Z'
        | 'EVENT'
        | 'SALES_AGENCY'
        | 'PRODUCT',
      searchType: 'title' as 'title' | 'userId' | 'memberName' | 'nickname',
      searchKeyword: '',
      startAt: null as Date | null,
      endAt: null as Date | null
    },
    onSubmit: (values) => {
      setPagination({ ...pagination, pageIndex: 0 });
    }
  });

  const columns = useMemo<ColumnDef<Sequenced<BoardPostResponseWithMockData>>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedItems.length === data.length && data.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems(data.map((item) => item.id));
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
        header: 'No',
        accessorKey: 'sequence',
        size: 60
      },
      {
        header: '게시판유형',
        accessorKey: 'boardType',
        cell: ({ row }) => {
          const boardType = row.original.boardType;
          return <Chip label={BOARD_TYPE_LABELS[boardType]} color="primary" variant="light" size="small" />;
        },
        size: 120
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        size: 100,
        cell: ({ row }) => {
          return row.original.userId;
        }
      },
      {
        header: '회원명',
        accessorKey: 'memberName',
        size: 100,
        cell: ({ row }) => {
          return row.original.memberName;
        }
      },
      {
        header: '닉네임',
        accessorKey: 'nickname',
        size: 100
      },
      {
        header: '파트너사 계약여부',
        accessorKey: 'partnerContractStatus',
        cell: ({ row }) => {
          return row.original.partnerContractStatus !== 'NONE' ? 'Y' : 'N';
        },
        size: 120
      },
      {
        header: '제목',
        accessorKey: 'title',
        cell: ({ row }) => (
          <Link to={`/admin/community-posts/${row.original.id}`} style={{ textDecoration: 'none', color: '#1976d2' }}>
            {row.original.title}
          </Link>
        )
      },
      {
        header: '좋아요 수',
        accessorKey: 'likesCount',
        size: 100
      },
      {
        header: '댓글 수',
        accessorKey: 'commentCount',
        size: 100
      },
      {
        header: '조회수',
        accessorKey: 'viewsCount',
        size: 100
      },
      {
        header: '블라인드 여부',
        accessorKey: 'isBlind',
        cell: ({ row }) => {
          const isBlind = row.original.isBlind;
          return isBlind ? 'Y' : 'N';
        },
        size: 120
      },
      {
        header: '등록일',
        accessorKey: 'createdAt',
        cell: ({ row }) => {
          const value = row.original.createdAt;
          try {
            const date = new Date(value);
            if (isNaN(date.getTime())) return value;
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}`;
          } catch {
            return value;
          }
        },
        size: 150
      }
    ],
    [data, selectedItems]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      pagination
    },
    onPaginationChange: setPagination,
    pageCount: totalPages,
    manualPagination: true
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await getBoards({
        boardType: formik.values.boardType === 'all' ? undefined : formik.values.boardType,
        userId: formik.values.searchType === 'userId' ? formik.values.searchKeyword : undefined,
        name: formik.values.searchType === 'memberName' ? formik.values.searchKeyword : undefined,
        nickname: formik.values.searchType === 'nickname' ? formik.values.searchKeyword : undefined,
        startAt: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateString(formik.values.endAt) : undefined,
        page: pagination.pageIndex,
        size: pagination.pageSize,
        filterBlind: undefined,
        boardTitle: formik.values.searchType === 'title' ? formik.values.searchKeyword : undefined
      });

      setData(withSequence(response).content.map(withMock));
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch community post list:', error);
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, formik.values]);

  const handleReset = () => {
    formik.resetForm();
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleBlind = () => {
    if (selectedItems.length === 0) {
      infoDialog.showInfo('블라인드할 포스트를 선택해주세요.');
      return;
    }

    const count = selectedItems.length;
    const message =
      count === 1
        ? `포스트 ${data.find((item) => item.id === selectedItems[0])?.title}를 블라인드 처리하시겠습니까?`
        : `${count}건이 선택되었습니다. 블라인드 처리하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          for (const postId of selectedItems) {
            await toggleBlindStatus_1(postId);
          }
          infoDialog.showInfo('블라인드 처리가 완료되었습니다.');
          setSelectedItems([]);
          fetchData();
        } catch (error) {
          console.error('Failed to blind posts:', error);
          errorDialog.showError('블라인드 처리 중 오류가 발생했습니다.');
        }
      }
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          포스트 관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>게시판유형</InputLabel>
                    <Select
                      name="boardType"
                      label="게시판유형"
                      value={formik.values.boardType}
                      onChange={(e) => formik.setFieldValue('boardType', e.target.value)}
                    >
                      <MenuItem value="all">전체</MenuItem>
                      <MenuItem value={'ANONYMOUS'}>익명게시판</MenuItem>
                      <MenuItem value={'MR_CSO_MATCHING'}>MR-CSO 매칭</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>검색 기준</InputLabel>
                    <Select
                      name="searchType"
                      label="검색 기준"
                      value={formik.values.searchType}
                      onChange={(e) => formik.setFieldValue('searchType', e.target.value)}
                    >
                      <MenuItem value="title">제목</MenuItem>
                      <MenuItem value="userId">아이디</MenuItem>
                      <MenuItem value="memberName">회원명</MenuItem>
                      <MenuItem value="nickname">닉네임</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="startAt" label="시작일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name="endAt" label="종료일" formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    name="searchKeyword"
                    size="small"
                    placeholder="검색어를 입력하세요"
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.searchKeyword}
                    onChange={formik.handleChange}
                  />
                </SearchFilterItem>
                <SearchFilterActions>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" color="primary" size="small" type="submit">
                      검색
                    </Button>
                    <Button variant="outlined" color="inherit" size="small" onClick={handleReset}>
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
              <Stack direction="row" spacing={1}>
                <Button variant="contained" color="success" size="small" disabled={selectedItems.length === 0} onClick={handleBlind}>
                  블라인드
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
                page={pagination.pageIndex + 1}
                onChange={(event, value) => {
                  setPagination({ ...pagination, pageIndex: value - 1 });
                }}
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
