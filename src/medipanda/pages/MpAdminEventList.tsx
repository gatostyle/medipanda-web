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
import { DateString, EventBoardSummaryResponse, EventStatus, EventStatusLabel, getEventBoards, softDeleteEventBoard } from '@/backend';
import { SearchFilterActions, SearchFilterBar, SearchFilterItem } from '@/medipanda/components/SearchFilterBar';
import { useMpDeleteDialog } from '@/medipanda/hooks/useMpDeleteDialog';
import { formatYyyyMmDd, SafeDate } from '@/medipanda/utils/dateFormat';
import { Sequenced, withSequence } from '@/medipanda/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';

export default function MpAdminEventList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchKeyword: '',
    startAt: '',
    endAt: '',
    status: '' as EventStatus | '',
    page: '1',
  };

  const {
    searchKeyword,
    startAt: paramStartAt,
    endAt: paramEndAt,
    status,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const startAt = useMemo(() => SafeDate(paramStartAt) ?? null, [paramStartAt]);
  const endAt = useMemo(() => SafeDate(paramEndAt) ?? null, [paramEndAt]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<EventBoardSummaryResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();
  const deleteDialog = useMpDeleteDialog();

  const formik = useFormik({
    initialValues: {
      ...initialSearchParams,
      startAt: null as Date | null,
      endAt: null as Date | null,
      page: null,
    },
    onSubmit: async values => {
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
      const response = await getEventBoards({
        status: status !== '' ? status : undefined,
        title: searchKeyword !== '' ? searchKeyword : undefined,
        startAt: startAt ? new DateString(startAt) : undefined,
        endAt: endAt ? new DateString(endAt) : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch event list:', error);
      await alertError('이벤트 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    formik.setValues({
      status,
      startAt,
      endAt,
      searchKeyword,
      page: null,
    });
    fetchContents();
  }, [searchKeyword, startAt, endAt, status, page]);

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
        header: '이벤트 상태',
        cell: ({ row }) => {
          const status = row.original.eventStatus;
          return (
            <Chip
              label={EventStatusLabel[status]}
              color={status === EventStatus.IN_PROGRESS ? 'success' : 'default'}
              variant='light'
              size='small'
            />
          );
        },
        size: 100,
      },
      {
        header: '썸네일',
        cell: ({ row }) => {
          const thumbnail = row.original.thumbnailUrl;
          if (thumbnail) {
            return (
              <Box sx={{ width: 80, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={thumbnail}
                  alt='썸네일'
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
              </Box>
            );
          }
          return <Box sx={{ width: 80, height: 60, bgcolor: 'grey.200', borderRadius: 1 }} />;
        },
        size: 100,
      },
      {
        header: '제목',
        cell: ({ row }) => (
          <Link component={RouterLink} to={`/admin/events/${row.original.id}`}>
            {row.original.title}
          </Link>
        ),
        size: 300,
      },
      {
        header: '조회 수',
        cell: ({ row }) => row.original.viewCount.toLocaleString(),
        size: 100,
      },
      {
        header: '작성일',
        cell: ({ row }) => {
          return formatYyyyMmDd(row.original.createdDate);
        },
        size: 120,
      },
      {
        header: '노출상태',
        cell: ({ row }) => {
          const isExposed = row.original.isExposed;
          return <Chip label={isExposed ? '노출' : '미노출'} color={isExposed ? 'success' : 'default'} variant='light' size='small' />;
        },
        size: 100,
      },
      {
        header: '이벤트 기간',
        cell: ({ row }) => {
          return `${formatYyyyMmDd(row.original.eventStartAt)} ~ ${formatYyyyMmDd(row.original.eventEndAt)}`;
        },
        size: 250,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      await alert('삭제할 이벤트를 선택하세요.');
      return;
    }

    deleteDialog.open({
      title: '이벤트 삭제',
      message: `선택한 ${selectedIds.length}개의 이벤트를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await Promise.all(selectedIds.map(id => softDeleteEventBoard(id)));
          enqueueSnackbar('이벤트가 삭제되었습니다.', { variant: 'success' });
          setSelectedIds([]);
          fetchContents();
        } catch (error) {
          console.error('Failed to delete events:', error);
          await alertError('이벤트 삭제에 실패했습니다.');
        }
      },
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant='h4' gutterBottom>
          이벤트관리
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
                    <Select name='status' value={formik.values.status} onChange={formik.handleChange}>
                      {Object.keys(EventStatus).map(eventStatus => (
                        <MenuItem key={eventStatus} value={eventStatus}>
                          {EventStatusLabel[eventStatus]}
                        </MenuItem>
                      ))}
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
              <Stack direction='row' spacing={1}>
                <Button variant='contained' size='small' color='error' disabled={selectedIds.length === 0} onClick={handleDelete}>
                  삭제
                </Button>
                <Button variant='contained' size='small' color='success' component={RouterLink} to='/admin/events/new'>
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
