import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
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
import { format } from 'date-fns';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { DateString, type EventBoardSummaryResponse, EventStatus, EventStatusLabel, getEventBoards, softDeleteEventBoard } from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { useMpDeleteDialog } from '@/hooks/useMpDeleteDialog';
import { DATEFORMAT_YYYY_MM_DD, DateUtils } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminEventList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchKeyword: '',
    startAt: '',
    endAt: '',
    status: '' as keyof typeof EventStatus | '',
    page: '1',
  };

  const {
    searchKeyword,
    startAt: paramStartAt,
    endAt: paramEndAt,
    status,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const startAt = useMemo(() => DateUtils.tryParseDate(paramStartAt) ?? null, [paramStartAt]);
  const endAt = useMemo(() => DateUtils.tryParseDate(paramEndAt) ?? null, [paramEndAt]);
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

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      startAt: null as Date | null,
      endAt: null as Date | null,
    },
  });
  const formStartAt = form.watch('startAt');
  const formEndAt = form.watch('endAt');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    const url = setUrlParams(
      {
        ...values,
        startAt: values.startAt !== null ? format(values.startAt, DATEFORMAT_YYYY_MM_DD) : undefined,
        endAt: values.endAt !== null ? format(values.endAt, DATEFORMAT_YYYY_MM_DD) : undefined,
        page: 1,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const handleReset = () => {
    navigate('');
    form.reset();
  };

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
    form.setValue('status', status);
    form.setValue('startAt', startAt);
    form.setValue('endAt', endAt);
    form.setValue('searchKeyword', searchKeyword);
    fetchContents();
  }, [searchKeyword, startAt, endAt, status, page]);

  const handleDelete = async () => {
    if (selectedIds.length === 0) {
      await alert('삭제할 이벤트를 선택하세요.');
      return;
    }

    deleteDialog.open({
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
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>이벤트관리</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>상태</InputLabel>
              <Controller
                control={form.control}
                name={'status'}
                render={({ field }) => (
                  <Select {...field}>
                    {Object.keys(EventStatus).map(eventStatus => (
                      <MenuItem key={eventStatus} value={eventStatus}>
                        {EventStatusLabel[eventStatus]}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <Controller
              control={form.control}
              name={'startAt'}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format={DATEFORMAT_YYYY_MM_DD}
                  views={['year', 'month', 'day']}
                  maxDate={formEndAt ?? undefined}
                  label='시작일'
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                />
              )}
            />
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <Controller
              control={form.control}
              name={'endAt'}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format={DATEFORMAT_YYYY_MM_DD}
                  views={['year', 'month', 'day']}
                  minDate={formStartAt ?? undefined}
                  label='종료일'
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                />
              )}
            />
          </SearchFilterItem>
          <SearchFilterItem flexGrow={1} minWidth={200}>
            <Controller
              control={form.control}
              name='searchKeyword'
              render={({ field }) => <TextField {...field} size='small' label='검색어' fullWidth />}
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
        </MpSearchFilterBar>
      </Card>

      <Card sx={{ padding: 3 }}>
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

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={50}>
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
                </TableCell>
                <TableCell width={60}>No</TableCell>
                <TableCell width={100}>이벤트 상태</TableCell>
                <TableCell width={100}>썸네일</TableCell>
                <TableCell width={300}>제목</TableCell>
                <TableCell width={100}>조회 수</TableCell>
                <TableCell width={120}>작성일</TableCell>
                <TableCell width={100}>노출상태</TableCell>
                <TableCell width={250}>이벤트 기간</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contents.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIds.includes(item.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedIds(prev => [...prev, item.id]);
                          } else {
                            setSelectedIds(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>
                      <Chip
                        label={EventStatusLabel[item.eventStatus]}
                        color={item.eventStatus === EventStatus.IN_PROGRESS ? 'success' : 'default'}
                        variant='light'
                        size='small'
                      />
                    </TableCell>
                    <TableCell>
                      {item.thumbnailUrl && (
                        <Stack
                          component={RouterLink}
                          to={item.thumbnailUrl}
                          target='_blank'
                          sx={{
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                        >
                          <img
                            src={item.thumbnailUrl}
                            style={{
                              width: '100px',
                              height: '100px',
                              borderRadius: 4,
                              objectFit: 'contain',
                            }}
                          />
                        </Stack>
                      )}
                    </TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/admin/events/${item.id}`}>
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>{item.viewCount.toLocaleString()}</TableCell>
                    <TableCell>{DateUtils.parseUtcAndFormatKst(item.createdDate, DATEFORMAT_YYYY_MM_DD)}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.isExposed ? '노출' : '미노출'}
                        color={item.isExposed ? 'success' : 'default'}
                        variant='light'
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{`${DateUtils.parseUtcAndFormatKst(item.eventStartAt, DATEFORMAT_YYYY_MM_DD)} ~ ${DateUtils.parseUtcAndFormatKst(item.eventEndAt, DATEFORMAT_YYYY_MM_DD)}`}</TableCell>
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
