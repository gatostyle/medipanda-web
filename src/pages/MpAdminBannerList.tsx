import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Card,
  Chip,
  FormControl,
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
import {
  BannerPositionLabel,
  type BannerResponse,
  BannerScopeLabel,
  BannerStatus,
  BannerStatusLabel,
  DateTimeString,
  getBanners,
} from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { DATEFORMAT_YYYY_MM_DD, DATEFORMAT_YYYY_MM_DD_HH_MM, DateUtils } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminBannerList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchKeyword: '',
    startAt: '',
    endAt: '',
    isExposed: '' as 'true' | 'false' | '',
    page: '1',
  };

  const {
    searchKeyword,
    startAt: paramStartAt,
    endAt: paramEndAt,
    isExposed,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const startAt = useMemo(() => DateUtils.tryParseDate(paramStartAt) ?? null, [paramStartAt]);
  const endAt = useMemo(() => DateUtils.tryParseDate(paramEndAt) ?? null, [paramEndAt]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [contents, setContents] = useState<Sequenced<BannerResponse>[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const { alertError } = useMpModal();

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

  const fetchContent = async () => {
    setLoading(true);
    try {
      const response = await getBanners({
        bannerTitle: searchKeyword !== '' ? searchKeyword : undefined,
        startAt: startAt ? new DateTimeString(startAt) : undefined,
        endAt: endAt ? new DateTimeString(endAt) : undefined,
        isExposed: isExposed !== '' ? isExposed === 'true' : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch banner list:', error);
      await alertError('배너 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setValue('searchKeyword', searchKeyword);
    form.setValue('startAt', startAt);
    form.setValue('endAt', endAt);
    form.setValue('isExposed', isExposed);
    fetchContent();
  }, [searchKeyword, startAt, endAt, isExposed, page]);

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>배너관리</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <Controller
                control={form.control}
                name={'isExposed'}
                render={({ field }) => (
                  <Select {...field} value={String(field.value)} onChange={e => field.onChange(e.target.value === 'true')} displayEmpty>
                    <MenuItem value={''}>전체</MenuItem>
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
            <Button variant='contained' color='success' size='small' component={RouterLink} to='/admin/banners/new'>
              등록
            </Button>
          </Stack>
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={60}>No</TableCell>
                <TableCell width={120}>배너위치</TableCell>
                <TableCell width={200}>배너제목</TableCell>
                <TableCell width={100}>노출상태</TableCell>
                <TableCell width={100}>노출범위</TableCell>
                <TableCell width={300}>게시기간</TableCell>
                <TableCell width={150}>등록일</TableCell>
                <TableCell width={80}>노출순서</TableCell>
                <TableCell width={100}>노출수</TableCell>
                <TableCell width={100}>클릭수</TableCell>
                <TableCell width={80}>CTR</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contents.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{BannerPositionLabel[item.position] ?? item.position}</TableCell>
                    <TableCell>
                      <Link component={RouterLink} to={`/admin/banners/${item.id}/edit`}>
                        {item.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={BannerStatusLabel[item.status]}
                        color={item.status === BannerStatus.VISIBLE ? 'success' : 'default'}
                        variant='light'
                        size='small'
                      />
                    </TableCell>
                    <TableCell>{BannerScopeLabel[item.scope]}</TableCell>
                    <TableCell>{`${DateUtils.parseUtcAndFormatKst(item.startAt, DATEFORMAT_YYYY_MM_DD_HH_MM)} ~ ${DateUtils.parseUtcAndFormatKst(item.endAt, DATEFORMAT_YYYY_MM_DD_HH_MM)}`}</TableCell>
                    <TableCell>{DateUtils.parseUtcAndFormatKst(item.startAt, DATEFORMAT_YYYY_MM_DD)}</TableCell>
                    <TableCell>{item.displayOrder}</TableCell>
                    <TableCell>{item.viewCount.toLocaleString()}</TableCell>
                    <TableCell>{item.clickCount.toLocaleString()}</TableCell>
                    <TableCell>{`${item.ctr}%`}</TableCell>
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
