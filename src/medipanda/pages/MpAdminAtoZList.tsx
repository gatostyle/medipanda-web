import { setUrlParams } from '@/lib/url';
import { useSearchParamsOrDefault } from '@/lib/useSearchParamsOrDefault';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import {
  Box,
  Button,
  Checkbox,
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
import { DatePicker } from '@mui/x-date-pickers';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import MainCard from 'components/MainCard';
import ScrollX from 'components/ScrollX';
import { useFormik } from 'formik';
import { BoardPostResponse, BoardType, DateString, deleteBoardPost, getBoards } from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import { formatYyyyMmDd, SafeDate } from '@/medipanda/utils/dateFormat';

export default function MpAdminAtoZList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'title' | 'userId' | 'name' | 'nickname' | '',
    searchKeyword: '',
    startAt: '',
    endAt: '',
    isExposed: '' as 'true' | 'false' | '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    startAt: paramStartAt,
    endAt: paramEndAt,
    isExposed,
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

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      startAt: null as Date | null,
      endAt: null as Date | null,
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
        boardType: BoardType.CSO_A_TO_Z,
        boardTitle: searchType === 'title' && searchKeyword !== '' ? searchKeyword : undefined,
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        name: searchType === 'name' && searchKeyword !== '' ? searchKeyword : undefined,
        nickname: searchType === 'nickname' && searchKeyword !== '' ? searchKeyword : undefined,
        startAt: startAt ? new DateString(startAt) : undefined,
        endAt: endAt ? new DateString(endAt) : undefined,
        isExposed: isExposed !== '' ? isExposed === 'true' : undefined,
        page: page - 1,
        size: pageSize,
        filterBlind: undefined,
        filterDeleted: undefined,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch CSO A to Z list:', error);
      await alertError('CSO A TO Z 목록을 불러오는 중 오류가 발생했습니다.');
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
      isExposed,
      page: null,
    });
    fetchContents();
  }, [searchType, searchKeyword, startAt, endAt, isExposed, page]);

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
        size: 80,
      },
      {
        header: '제목',
        cell: ({ row }) => (
          <Link component={RouterLink} to={`/admin/atoz/${row.original.id}`}>
            {row.original.title}
          </Link>
        ),
      },
      {
        header: '상태',
        cell: ({ row }) => {
          const isExposed = row.original.isExposed;
          return <Chip label={isExposed ? '노출' : '미노출'} color={isExposed ? 'success' : 'default'} variant='light' size='small' />;
        },
        size: 100,
      },
      {
        header: '조회 수',
        cell: ({ row }) => row.original.viewsCount.toLocaleString(),
        size: 100,
      },
      {
        header: '작성일',
        cell: ({ row }) => formatYyyyMmDd(row.original.createdAt),
        size: 120,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDelete = () => {
    const count = selectedIds.length;
    const message =
      count === 1
        ? `CSO A TO Z ${contents.find(item => item.id === selectedIds[0])?.title}를 삭제하시겠습니까?`
        : `${count}건이 선택되었습니다. 삭제하시겠습니까?`;

    deleteDialog.open({
      message,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => deleteBoardPost(id)));
          setSelectedIds([]);
          fetchContents();
        } catch (error) {
          console.error('Failed to delete items:', error);
          await alertError('CSO A TO Z 삭제 중 오류가 발생했습니다.');
        }
      },
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          CSO A TO Z
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <MainCard content={false}>
          <Box sx={{ p: 3 }}>
            <form onSubmit={formik.handleSubmit}>
              <SearchFilterBar>
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>상태</InputLabel>
                    <Select
                      value={`${formik.values.isExposed}`}
                      onChange={e => formik.setFieldValue('isExposed', e.target.value === 'true')}
                    >
                      <MenuItem value={'true'}>노출</MenuItem>
                      <MenuItem value={'false'}>미노출</MenuItem>
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
                <SearchFilterItem minWidth={140}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>검색유형</InputLabel>
                    <Select name='searchType' value={formik.values.searchType} onChange={formik.handleChange}>
                      <MenuItem value={'title'}>제목</MenuItem>
                      <MenuItem value={'userId'}>아이디</MenuItem>
                      <MenuItem value={'name'}>이름</MenuItem>
                      <MenuItem value={'nickname'}>닉네임</MenuItem>
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
                <Button variant='contained' color='error' size='small' disabled={selectedIds.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant='contained' color='success' size='small' component={RouterLink} to='/admin/atoz/new'>
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
