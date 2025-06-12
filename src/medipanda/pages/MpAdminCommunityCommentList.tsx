import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFormik } from 'formik';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
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
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { CommentMemberResponse, DateString, getCommentMembers, toggleBlindStatus } from 'medipanda/backend';
import { useMpDeleteDialog } from 'medipanda/hooks/useMpDeleteDialog';
import { Sequenced } from 'medipanda/utils/withSequence';
import { CONTRACT_STATUS_LABELS } from 'medipanda/ui-labels';
import { withSequence } from 'medipanda/utils/withSequence';

export default function MpAdminCommunityCommentList() {
  const [data, setData] = useState<Sequenced<CommentMemberResponse>[]>([]);
  const [, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const deleteDialog = useMpDeleteDialog();

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 20
  });

  const formik = useFormik({
    initialValues: {
      commentType: 'all' as 'all' | 'COMMENT' | 'REPLY',
      searchType: 'nickname' as 'nickname' | 'userId' | 'name',
      searchKeyword: '',
      startAt: null as Date | null,
      endAt: null as Date | null
    },
    onSubmit: (values) => {
      setPagination({ ...pagination, pageIndex: 0 });
    }
  });

  const columns = useMemo<ColumnDef<Sequenced<CommentMemberResponse>>[]>(
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
        cell: ({ row }) => {
          return (
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
          );
        },
        size: 50
      },
      {
        header: 'No',
        accessorKey: 'sequence',
        size: 60
      },
      {
        header: '아이디',
        accessorKey: 'userId',
        size: 150
      },
      {
        header: '회원명',
        accessorKey: 'name',
        size: 100
      },
      {
        header: '닉네임',
        accessorKey: 'nickname',
        size: 150
      },
      {
        header: '계약유무',
        accessorKey: 'contractStatus',
        cell: ({ row }) => {
          const status = row.original.contractStatus;
          return CONTRACT_STATUS_LABELS[status];
        },
        size: 100
      },
      {
        header: '유형',
        accessorKey: 'commentType',
        cell: ({ row }) => {
          const commentType = row.original.commentType;
          return commentType === 'COMMENT' ? '댓글' : '대댓글';
        },
        size: 80
      },
      {
        header: '댓글내용',
        accessorKey: 'content',
        cell: ({ row }) => {
          const content = row.original.content;
          return (
            <Typography
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 300
              }}
            >
              {content}
            </Typography>
          );
        }
      },
      {
        header: '좋아요 수',
        accessorKey: 'likesCount',
        size: 100
      },
      {
        header: '등록일',
        accessorKey: 'createdAt',
        cell: ({ row }) => {
          const date = row.original.createdAt;
          if (!date) return '-';
          try {
            const dateObj = new Date(date);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day} ${hours}:${minutes}`;
          } catch {
            return '-';
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

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCommentMembers({
        userId: formik.values.searchType === 'userId' ? formik.values.searchKeyword : undefined,
        nickname: formik.values.searchType === 'nickname' ? formik.values.searchKeyword : undefined,
        startAt: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateString(formik.values.endAt) : undefined,
        commentType: formik.values.commentType === 'all' ? undefined : formik.values.commentType,
        filterDeleted: false,
        page: pagination.pageIndex,
        size: pagination.pageSize
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch comment list:', error);
      setData([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, formik.values]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBlind = () => {
    const count = selectedItems.length;
    const message = count === 1 ? `댓글을 블라인드 처리하시겠습니까?` : `${count}건이 선택되었습니다. 블라인드 처리하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          for (const id of selectedItems) {
            const comment = data.find((item) => item.id === id);
            if (comment) {
              await toggleBlindStatus(id);
            }
          }
          await fetchData();
          setSelectedItems([]);
        } catch (error) {
          console.error('Failed to blind comments:', error);
        }
      }
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          댓글 관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>글 유형</InputLabel>
                    <Select
                      name="commentType"
                      label="글 유형"
                      value={formik.values.commentType}
                      onChange={(e) => formik.setFieldValue('commentType', e.target.value)}
                    >
                      <MenuItem value="all">전체</MenuItem>
                      <MenuItem value={'COMMENT'}>댓글</MenuItem>
                      <MenuItem value={'REPLY'}>대댓글</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>닉네임</InputLabel>
                    <Select
                      name="searchType"
                      label="닉네임"
                      value={formik.values.searchType}
                      onChange={(e) => formik.setFieldValue('searchType', e.target.value)}
                    >
                      <MenuItem value="nickname">닉네임</MenuItem>
                      <MenuItem value="userId">아이디</MenuItem>
                      <MenuItem value="name">회원명</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <Box sx={{ width: '100%' }}>
                    <MpFormikDatePicker name="startAt" label="시작일" formik={formik} />
                  </Box>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <Box sx={{ width: '100%' }}>
                    <MpFormikDatePicker name="endAt" label="종료일" formik={formik} />
                  </Box>
                </SearchFilterItem>
                <SearchFilterItem flexGrow={1} minWidth={200}>
                  <TextField
                    name="searchKeyword"
                    size="small"
                    placeholder=""
                    onKeyPress={(e: React.KeyboardEvent) => e.key === 'Enter' && formik.handleSubmit()}
                    fullWidth
                    value={formik.values.searchKeyword}
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
              <Typography variant="subtitle1">검색결과: {totalElements} 건</Typography>
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
