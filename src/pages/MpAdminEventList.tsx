import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Box,
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
import { useFormik } from 'formik';
import { DateString, type EventBoardSummaryResponse, EventStatus, EventStatusLabel, getEventBoards, softDeleteEventBoard } from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { useMpDeleteDialog } from '@/hooks/useMpDeleteDialog';
import { DATEFORMAT_YYYY_MM_DD, formatYyyyMmDd, SafeDate } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
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
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>이벤트관리</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={formik.handleSubmit}>
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
              format={DATEFORMAT_YYYY_MM_DD}
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
              format={DATEFORMAT_YYYY_MM_DD}
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
                      {item.thumbnailUrl ? (
                        <Box sx={{ width: 80, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <RouterLink to={item.thumbnailUrl} target='_blank'>
                            <img
                              src={item.thumbnailUrl}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px',
                              }}
                            />
                          </RouterLink>
                        </Box>
                      ) : (
                        <Box sx={{ width: 80, height: 60, bgcolor: 'grey.200', borderRadius: 1 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/admin/events/${item.id}`}>
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>{item.viewCount.toLocaleString()}</TableCell>
                    <TableCell>{formatYyyyMmDd(item.createdDate)}</TableCell>
                    <TableCell>
                      <Chip
                        label={item.isExposed ? '노출' : '미노출'}
                        color={item.isExposed ? 'success' : 'default'}
                        variant='light'
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{`${formatYyyyMmDd(item.eventStartAt)} ~ ${formatYyyyMmDd(item.eventEndAt)}`}</TableCell>
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
