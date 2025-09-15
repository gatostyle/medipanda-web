import {
  BoardPostResponse,
  BoardType,
  BoardTypeLabel,
  ContractStatus,
  DateString,
  getBoards,
  MemberType,
  memberTypeToContractStatus,
  toggleBlindStatus_1,
} from '@/backend';
import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import { formatYyyyMmDd, formatYyyyMmDdHhMm, SafeDate } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import {
  Button,
  Card,
  Checkbox,
  Chip,
  FormControl,
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
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminCommunityPostList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    boardType: '' as BoardType | '',
    searchType: '' as 'title' | 'userId' | 'name' | 'nickname' | '',
    searchKeyword: '',
    startAt: '',
    endAt: '',
    page: '1',
  };

  const {
    boardType,
    searchType,
    searchKeyword,
    startAt: paramStartAt,
    endAt: paramEndAt,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const startAt = useMemo(() => SafeDate(paramStartAt) ?? null, [paramStartAt]);
  const endAt = useMemo(() => SafeDate(paramEndAt) ?? null, [paramEndAt]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<BoardPostResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const deleteDialog = useMpDeleteDialog();
  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      startAt: null as Date | null,
      endAt: null as Date | null,
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
          startAt: values.startAt !== null ? formatYyyyMmDd(values.startAt) : undefined,
          endAt: values.endAt !== null ? formatYyyyMmDd(values.endAt) : undefined,
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
        boardType: boardType !== '' ? boardType : undefined,
        boardTitle: searchType === 'title' && searchKeyword !== '' ? searchKeyword : undefined,
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        name: searchType === 'name' && searchKeyword !== '' ? searchKeyword : undefined,
        nickname: searchType === 'nickname' && searchKeyword !== '' ? searchKeyword : undefined,
        startAt: startAt ? new DateString(startAt) : undefined,
        endAt: endAt ? new DateString(endAt) : undefined,
        page: page - 1,
        size: pageSize,
        filterBlind: true,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch community post list:', error);
      await alertError('포스트 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    formik.setValues({
      boardType,
      searchType,
      searchKeyword,
      startAt,
      endAt,
      page: null,
    });
    fetchContents();
  }, [boardType, searchType, searchKeyword, startAt, endAt, page]);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        id: 'select',
        header: () => (
          <Checkbox
            checked={selectedIds.length === contents.length && contents.length > 0}
            onChange={e => {
              if (e.target.checked) {
                setSelectedIds(contents.map(item => item.id));
              } else {
                setSelectedIds([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selectedIds.includes(row.original.id)}
            onChange={e => {
              if (e.target.checked) {
                setSelectedIds(prev => [...prev, row.original.id]);
              } else {
                setSelectedIds(prev => prev.filter(id => id !== row.original.id));
              }
            }}
          />
        ),
        size: 50,
      },
      {
        header: 'No',
        cell: ({ row }) => row.original.sequence,
        size: 60,
      },
      {
        header: '게시판유형',
        cell: ({ row }) => {
          const boardType = row.original.boardType;
          return <Chip label={BoardTypeLabel[boardType]} color='success' variant='light' size='small' />;
        },
        size: 120,
      },
      {
        header: '아이디',
        cell: ({ row }) => row.original.userId,
        size: 100,
      },
      {
        header: '회원명',
        cell: ({ row }) => row.original.name,
        size: 100,
      },
      {
        header: '닉네임',
        cell: ({ row }) => row.original.nickname,
        size: 100,
      },
      {
        header: '파트너사 계약여부',
        cell: ({ row }) => (memberTypeToContractStatus(row.original.memberType as MemberType) === ContractStatus.CONTRACT ? 'Y' : 'N'),
        size: 120,
      },
      {
        header: '제목',
        cell: ({ row }) => (
          <Link component={RouterLink} to={`/admin/community-posts/${row.original.id}`}>
            {row.original.title}
          </Link>
        ),
      },
      {
        header: '좋아요 수',
        cell: ({ row }) => row.original.likesCount,
        size: 100,
      },
      {
        header: '댓글 수',
        cell: ({ row }) => row.original.commentCount,
        size: 100,
      },
      {
        header: '조회수',
        cell: ({ row }) => row.original.viewsCount,
        size: 100,
      },
      {
        header: '블라인드 여부',
        cell: ({ row }) => (row.original.isBlind ? 'Y' : 'N'),
        size: 120,
      },
      {
        header: '등록일',
        cell: ({ row }) => formatYyyyMmDdHhMm(row.original.createdAt),
        size: 150,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const handleBlind = async () => {
    if (selectedIds.length === 0) {
      await alert('블라인드할 포스트를 선택하세요.');
      return;
    }

    const count = selectedIds.length;
    const message =
      count === 1
        ? `포스트 ${contents.find(item => item.id === selectedIds[0])?.title}를 블라인드 처리하시겠습니까?`
        : `${count}건이 선택되었습니다. 블라인드 처리하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          for (const postId of selectedIds) {
            await toggleBlindStatus_1(postId);
          }
          enqueueSnackbar('블라인드 처리가 완료되었습니다.', { variant: 'success' });
          setSelectedIds([]);
          fetchContents();
        } catch (error) {
          console.error('Failed to blind posts:', error);
          await alertError('블라인드 처리 중 오류가 발생했습니다.');
        }
      },
    });
  };

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4' gutterBottom>
        포스트 관리
      </Typography>

      <Card sx={{ padding: 3 }}>
        <SearchFilterBar component='form' onSubmit={formik.handleSubmit}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>게시판유형</InputLabel>
              <Select name='boardType' value={formik.values.boardType} onChange={formik.handleChange}>
                {[BoardType.ANONYMOUS, BoardType.MR_CSO_MATCHING].map(boardType => (
                  <MenuItem key={boardType} value={boardType}>
                    {BoardTypeLabel[boardType]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>검색유형</InputLabel>
              <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                <MenuItem value={'title'}>제목</MenuItem>
                <MenuItem value={'userId'}>아이디</MenuItem>
                <MenuItem value={'name'}>회원명</MenuItem>
                <MenuItem value={'nickname'}>닉네임</MenuItem>
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
      </Card>

      <Card sx={{ padding: 3 }}>
        <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
          <Stack direction='row' spacing={2}>
            <Typography variant='subtitle1'>검색결과: {totalElements.toLocaleString()} 건</Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Button variant='contained' color='success' size='small' disabled={selectedIds.length === 0} onClick={handleBlind}>
              블라인드
            </Button>
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
    </Stack>
  );
}
