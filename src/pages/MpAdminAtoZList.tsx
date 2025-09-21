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
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { type BoardPostResponse, BoardType, DateString, deleteBoardPost, getBoards } from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { useMpDeleteDialog } from '@/hooks/useMpDeleteDialog';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';
import { DATEFORMAT_YYYY_MM_DD, formatYyyyMmDd, SafeDate } from '@/lib/utils/dateFormat';

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
  };

  const handleReset = () => {
    navigate('');
    form.reset();
  };

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
        filterDeleted: true,
        page: page - 1,
        size: pageSize,
        filterBlind: undefined,
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
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    form.setValue('startAt', startAt);
    form.setValue('endAt', endAt);
    form.setValue('isExposed', isExposed);
    fetchContents();
  }, [searchType, searchKeyword, startAt, endAt, isExposed, page]);

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
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>CSO A TO Z</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>상태</InputLabel>
              <Controller
                control={form.control}
                name={'isExposed'}
                render={({ field }) => (
                  <Select {...field} value={String(field.value)} onChange={e => field.onChange(e.target.value === 'true')}>
                    <MenuItem value={'true'}>노출</MenuItem>
                    <MenuItem value={'false'}>미노출</MenuItem>
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
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>검색유형</InputLabel>
              <Controller
                control={form.control}
                name='searchType'
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value={'title'}>제목</MenuItem>
                    <MenuItem value={'userId'}>아이디</MenuItem>
                    <MenuItem value={'name'}>회원명</MenuItem>
                    <MenuItem value={'nickname'}>닉네임</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
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
            <Button variant='contained' color='error' size='small' disabled={selectedIds.length === 0} onClick={handleDelete}>
              삭제
            </Button>
            <Button variant='contained' color='success' size='small' component={RouterLink} to='/admin/atoz/new'>
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
                <TableCell width={80}>No</TableCell>
                <TableCell width={150}>제목</TableCell>
                <TableCell width={100}>상태</TableCell>
                <TableCell width={100}>조회 수</TableCell>
                <TableCell width={120}>작성일</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align='center' sx={{ py: 3 }}>
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
                      <Link component={RouterLink} to={`/admin/atoz/${item.id}`}>
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.isExposed ? '노출' : '미노출'}
                        color={item.isExposed ? 'success' : 'default'}
                        variant='light'
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{item.viewsCount.toLocaleString()}</TableCell>
                    <TableCell>{formatYyyyMmDd(item.createdAt)}</TableCell>
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
