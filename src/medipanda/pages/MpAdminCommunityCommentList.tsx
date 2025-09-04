import {
  Box,
  Button,
  Checkbox,
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
import { flexRender, getCoreRowModel, getPaginationRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { CommentMemberResponse, DateString, getCommentMembers, toggleBlindStatus } from '@/backend';
import MpFormikDatePicker from '@/medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { CONTRACT_STATUS_LABELS } from '@/medipanda/ui-labels';
import { formatYyyyMmDd } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useState } from 'react';

export default function MpAdminCommunityCommentList() {
  const [data, setData] = useState<Sequenced<CommentMemberResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const deleteDialog = useMpDeleteDialog();
  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      commentType: '' as 'COMMENT' | 'REPLY' | '',
      searchType: '' as 'nickname' | 'userId' | '',
      searchKeyword: '',
      startAt: null as Date | null,
      endAt: null as Date | null,
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

  const table = useReactTable({
    data,
    columns: [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedItems.length === data.length && data.length > 0}
            onChange={e => {
              if (e.target.checked) {
                setSelectedItems(data.map(item => item.id));
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
              onChange={e => {
                if (e.target.checked) {
                  setSelectedItems(prev => [...prev, row.original.id]);
                } else {
                  setSelectedItems(prev => prev.filter(id => id !== row.original.id));
                }
              }}
            />
          );
        },
        size: 50,
      },
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '아이디',
        cell: ({ row }) => row.original.userId,
        size: 150,
      },
      {
        header: '회원명',
        cell: ({ row }) => row.original.name,
        size: 100,
      },
      {
        header: '닉네임',
        cell: ({ row }) => row.original.nickname,
        size: 150,
      },
      {
        header: '계약유무',
        cell: ({ row }) => CONTRACT_STATUS_LABELS[row.original.contractStatus],
        size: 100,
      },
      {
        header: '유형',
        cell: ({ row }) => (row.original.commentType === 'COMMENT' ? '댓글' : '대댓글'),
        size: 80,
      },
      {
        header: '댓글내용',
        cell: ({ row }) => {
          const content = row.original.content;
          return (
            <Typography
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 300,
              }}
            >
              {content}
            </Typography>
          );
        },
      },
      {
        header: '좋아요 수',
        cell: ({ row }) => row.original.likesCount,
        size: 100,
      },
      {
        header: '등록일',
        cell: ({ row }) => formatYyyyMmDd(row.original.createdAt),
        size: 150,
      },
    ],
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
      const response = await getCommentMembers({
        userId: formik.values.searchType === 'userId' ? formik.values.searchKeyword : undefined,
        nickname: formik.values.searchType === 'nickname' ? formik.values.searchKeyword : undefined,
        startAt: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateString(formik.values.endAt) : undefined,
        commentType: formik.values.commentType !== '' ? formik.values.commentType : undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize,
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch comment list:', error);
      errorDialog.showError('댓글 목록을 불러오는 중 오류가 발생했습니다.');
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

  const handleBlind = () => {
    const count = selectedItems.length;
    const message = count === 1 ? `댓글을 블라인드 처리하시겠습니까?` : `${count}건이 선택되었습니다. 블라인드 처리하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          for (const id of selectedItems) {
            const comment = data.find(item => item.id === id);
            if (comment) {
              await toggleBlindStatus(id);
            }
          }
          await fetchData();
          setSelectedItems([]);
        } catch (error) {
          console.error('Failed to blind comments:', error);
          errorDialog.showError('댓글 블라인드 처리 중 오류가 발생했습니다.');
        }
      },
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          댓글 관리
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>글 유형</InputLabel>
                    <Select name='commentType' value={formik.values.commentType} onChange={formik.handleChange}>
                      <MenuItem value={'COMMENT'}>댓글</MenuItem>
                      <MenuItem value={'REPLY'}>대댓글</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={'nickname'}>닉네임</MenuItem>
                      <MenuItem value={'userId'}>아이디</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name='startAt' label='시작일' formik={formik} />
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <MpFormikDatePicker name='endAt' label='종료일' formik={formik} />
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
                <Button variant='contained' color='success' size='small' disabled={selectedItems.length === 0} onClick={handleBlind}>
                  블라인드
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
