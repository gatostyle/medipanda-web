import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Card,
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
import { type BoardPostResponse, BoardType, DateString, getBoards } from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { DATEFORMAT_YYYY_MM_DD, formatYyyyMmDd, SafeDate } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminInquiryList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'name' | 'drugCompany' | 'userId' | '',
    searchKeyword: '',
    startAt: '',
    endAt: '',
    includeChild: '' as 'true' | 'false' | '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    startAt: paramStartAt,
    endAt: paramEndAt,
    includeChild,
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

  const { alert, alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      startAt: null as Date | null,
      endAt: null as Date | null,
    },
  });

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
        boardType: BoardType.INQUIRY,
        name: searchType === 'name' && searchKeyword !== '' ? searchKeyword : undefined,
        drugCompany: searchType === 'drugCompany' && searchKeyword !== '' ? searchKeyword : undefined,
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        startAt: startAt ? new DateString(startAt) : undefined,
        endAt: endAt ? new DateString(endAt) : undefined,
        includeChild: includeChild === '' ? undefined : includeChild === 'true',
        filterDeleted: true,
        page: page - 1,
        size: pageSize,
      });
      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch inquiry list:', error);
      await alertError('1:1 문의내역을 불러오는 중 오류가 발생했습니다.');
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
    form.setValue('includeChild', includeChild);
    fetchContents();
  }, [searchType, searchKeyword, startAt, endAt, includeChild, page]);

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>1:1 문의내역</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>처리상태</InputLabel>
              <Controller
                control={form.control}
                name='includeChild'
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value={''}>전체</MenuItem>
                    <MenuItem value={'false'}>답변대기중</MenuItem>
                    <MenuItem value={'true'}>답변완료</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>검색유형</InputLabel>
              <Controller
                control={form.control}
                name='searchType'
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value={'name'}>회원명</MenuItem>
                    <MenuItem value={'drugCompany'}>회사명</MenuItem>
                    <MenuItem value={'userId'}>아이디</MenuItem>
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
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={60}>No</TableCell>
                <TableCell width={100}>회원번호</TableCell>
                <TableCell width={120}>아이디</TableCell>
                <TableCell width={100}>회원명</TableCell>
                <TableCell width={150}>회사명</TableCell>
                <TableCell width={250}>제목</TableCell>
                <TableCell width={100}>문의일</TableCell>
                <TableCell width={100}>답변일</TableCell>
                <TableCell width={100}>처리상태</TableCell>
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
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{item.memberId}</TableCell>
                    <TableCell>{item.userId}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/admin/inquiries/${item.id}`}>
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>{formatYyyyMmDd(item.createdAt)}</TableCell>
                    <TableCell>{item.hasChildren ? formatYyyyMmDd(item.createdAt) : '-'}</TableCell>
                    <TableCell>{item.hasChildren ? '처리완료' : '처리중'}</TableCell>
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
