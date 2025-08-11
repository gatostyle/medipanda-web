import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
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
import { BlindPostResponse, DateString, getBlindPosts, unblindPost } from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from 'medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from 'medipanda/hooks/useMpDeleteDialog';
import { formatYyyyMmDdHhMm } from 'medipanda/utils/dateFormat';
import { Sequenced, withSequence } from 'medipanda/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';

enum SearchCriteriaType {
  NICKNAME = 'nickname',
  USER_ID = 'userId',
  MEMBER_NAME = 'memberName'
}

const SEARCH_CRITERIA_LABELS: Record<SearchCriteriaType, string> = {
  [SearchCriteriaType.NICKNAME]: '닉네임',
  [SearchCriteriaType.USER_ID]: '아이디',
  [SearchCriteriaType.MEMBER_NAME]: '회원명'
};

export default function MpAdminCommunityBlindList() {
  const [data, setData] = useState<Sequenced<BlindPostResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedItems, setSelectedItems] = useState<{ id: number; type: 'BOARD' | 'COMMENT' }[]>([]);
  const deleteDialog = useMpDeleteDialog();

  const formik = useFormik({
    initialValues: {
      postType: 'BOARD' as 'BOARD' | 'COMMENT',
      searchCriteria: SearchCriteriaType.NICKNAME,
      searchKeyword: '',
      startAt: null as Date | null,
      endAt: null as Date | null,
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

  const columns = useMemo<ColumnDef<Sequenced<BlindPostResponse>>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedItems.length === data.length && data.length > 0}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems(data.map((item) => ({ id: item.id, type: item.postType })));
              } else {
                setSelectedItems([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedItems.some((item) => item.id === row.original.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedItems((prev) => [...prev, { id: row.original.id, type: row.original.postType }]);
              } else {
                setSelectedItems((prev) => prev.filter((item) => item.id !== row.original.id));
              }
            }}
          />
        ),
        size: 50
      },
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
        header: '회원명',
        accessorKey: 'memberName',
        cell: ({ row }) => row.original.memberName,
        size: 100
      },
      {
        header: '닉네임',
        accessorKey: 'nickname',
        cell: ({ row }) => row.original.nickname,
        size: 100
      },
      {
        header: '글 유형',
        accessorKey: 'postType',
        cell: ({ row }) => {
          const postType = row.original.postType;
          const label = postType === 'BOARD' ? '포스트' : '댓글';
          return label;
        },
        size: 80
      },
      {
        header: '글 내용',
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
        header: '블라인드 처리일',
        accessorKey: 'blindAt',
        cell: ({ row }) => formatYyyyMmDdHhMm(row.original.blindAt),
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
      const memberName = formik.values.searchCriteria === SearchCriteriaType.MEMBER_NAME ? formik.values.searchKeyword : undefined;

      const response = await getBlindPosts({
        postType: formik.values.postType,
        memberName,
        startAt: formik.values.startAt ? new DateString(formik.values.startAt) : undefined,
        endAt: formik.values.endAt ? new DateString(formik.values.endAt) : undefined,
        page: formik.values.pageIndex,
        size: formik.values.pageSize
      });

      setData(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch blind post list:', error);
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

  const handleUnblind = () => {
    const count = selectedItems.length;
    const message =
      count === 1 ? `선택한 항목의 블라인드를 해제하시겠습니까?` : `${count}건이 선택되었습니다. 블라인드를 해제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          for (const item of selectedItems) {
            if (item.type === 'BOARD') {
              await unblindPost({ postId: item.id, commentId: null });
            } else {
              await unblindPost({ postId: null, commentId: item.id });
            }
          }
          await fetchData();
          setSelectedItems([]);
        } catch (error) {
          console.error('Failed to unblind posts:', error);
        }
      }
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h4" gutterBottom>
          블라인드 관리
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
                      name="postType"
                      label="글 유형"
                      value={formik.values.postType}
                      onChange={(e) => formik.setFieldValue('postType', e.target.value)}
                    >
                      <MenuItem value={'BOARD'}>포스트</MenuItem>
                      <MenuItem value={'COMMENT'}>댓글</MenuItem>
                    </Select>
                  </FormControl>
                </SearchFilterItem>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size="small">
                    <InputLabel>{SEARCH_CRITERIA_LABELS[formik.values.searchCriteria]}</InputLabel>
                    <Select
                      name="searchCriteria"
                      label={SEARCH_CRITERIA_LABELS[formik.values.searchCriteria]}
                      value={formik.values.searchCriteria}
                      onChange={(e) => formik.setFieldValue('searchCriteria', e.target.value)}
                    >
                      <MenuItem value={SearchCriteriaType.NICKNAME}>닉네임</MenuItem>
                      <MenuItem value={SearchCriteriaType.USER_ID}>아이디</MenuItem>
                      <MenuItem value={SearchCriteriaType.MEMBER_NAME}>회원명</MenuItem>
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
                    placeholder="검색어를 입력하세요"
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
                <Button variant="contained" color="success" size="small" disabled={selectedItems.length === 0} onClick={handleUnblind}>
                  블라인드 해제
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
