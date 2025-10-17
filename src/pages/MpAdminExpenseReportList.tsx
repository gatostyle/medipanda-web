import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { useMpModal } from '@/hooks/useMpModal';
import {
  Button,
  Card,
  FormControl,
  InputLabel,
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
import { DocumentDownload } from 'iconsax-reactjs';
import {
  DateTimeString,
  type ExpenseReportResponse,
  ExpenseReportStatus,
  ExpenseReportStatusLabel,
  ExpenseReportType,
  ExpenseReportTypeLabel,
  getDownloadExpenseReportListExcel,
  getExpenseReportList,
} from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { DATEFORMAT_YYYY_MM_DD, DateUtils } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminExpenseReportList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'companyName' | 'userId' | 'productName' | '',
    searchKeyword: '',
    eventDateFrom: '',
    eventDateTo: '',
    status: '' as keyof typeof ExpenseReportStatus | '',
    reportType: '' as typeof ExpenseReportType.SAMPLE_PROVIDE | '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    eventDateFrom: paramEventDateFrom,
    eventDateTo: paramEventDateTo,
    status,
    reportType,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const eventDateFrom = useMemo(() => DateUtils.tryParseDate(paramEventDateFrom) ?? null, [paramEventDateFrom]);
  const eventDateTo = useMemo(() => DateUtils.tryParseDate(paramEventDateTo) ?? null, [paramEventDateTo]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<ExpenseReportResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { alert, alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      eventDateFrom: null as Date | null,
      eventDateTo: null as Date | null,
    },
  });
  const formEventDateFrom = form.watch('eventDateFrom');
  const formEventDateTo = form.watch('eventDateTo');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.searchType === '' && values.searchKeyword !== '') {
      await alert('검색유형을 선택하세요.');
      return;
    }

    const url = setUrlParams(
      {
        ...values,
        eventDateFrom: values.eventDateFrom !== null ? format(values.eventDateFrom, DATEFORMAT_YYYY_MM_DD) : undefined,
        eventDateTo: values.eventDateTo !== null ? format(values.eventDateTo, DATEFORMAT_YYYY_MM_DD) : undefined,
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
      const response = await getExpenseReportList({
        companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
        userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
        productName: searchType === 'productName' && searchKeyword !== '' ? searchKeyword : undefined,
        reportType: reportType !== '' ? reportType : undefined,
        eventDateFrom: eventDateFrom ? new DateTimeString(eventDateFrom) : undefined,
        eventDateTo: eventDateTo ? new DateTimeString(eventDateTo) : undefined,
        status: status || undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch expense reports:', error);
      await alertError('지출보고 목록을 불러오는 중 오류가 발생했습니다.');
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
    form.setValue('eventDateFrom', eventDateFrom);
    form.setValue('eventDateTo', eventDateTo);
    form.setValue('status', status);
    form.setValue('reportType', reportType);
    fetchContents();
  }, [searchType, searchKeyword, eventDateFrom, eventDateTo, status, reportType, page]);

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>지출보고관리</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>신고상태</InputLabel>
              <Controller
                control={form.control}
                name={'status'}
                render={({ field }) => (
                  <Select {...field}>
                    {Object.keys(ExpenseReportStatus).map(expenseReportStatus => (
                      <MenuItem key={expenseReportStatus} value={expenseReportStatus}>
                        {ExpenseReportStatusLabel[expenseReportStatus]}
                      </MenuItem>
                    ))}
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
                    <MenuItem value={'companyName'}>회사명</MenuItem>
                    <MenuItem value={'userId'}>아이디</MenuItem>
                    <MenuItem value={'productName'}>제품명</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>유형</InputLabel>
              <Controller
                control={form.control}
                name={'reportType'}
                render={({ field }) => (
                  <Select {...field}>
                    {Object.keys(ExpenseReportType).map(expenseReportType => (
                      <MenuItem key={expenseReportType} value={expenseReportType}>
                        {ExpenseReportTypeLabel[expenseReportType]}
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
              name={'eventDateFrom'}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format={DATEFORMAT_YYYY_MM_DD}
                  views={['year', 'month', 'day']}
                  maxDate={formEventDateTo ?? undefined}
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
              name={'eventDateTo'}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format={DATEFORMAT_YYYY_MM_DD}
                  views={['year', 'month', 'day']}
                  minDate={formEventDateFrom ?? undefined}
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
            <Button type='submit' variant='contained' size='small'>
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
            <Button
              variant='contained'
              size='small'
              color='success'
              startIcon={<DocumentDownload size={16} />}
              href={getDownloadExpenseReportListExcel({
                companyName: searchType === 'companyName' && searchKeyword !== '' ? searchKeyword : undefined,
                userId: searchType === 'userId' && searchKeyword !== '' ? searchKeyword : undefined,
                productName: searchType === 'productName' && searchKeyword !== '' ? searchKeyword : undefined,
                eventDateFrom: eventDateFrom ? new DateTimeString(eventDateFrom) : undefined,
                eventDateTo: eventDateTo ? new DateTimeString(eventDateTo) : undefined,
                status: status || undefined,
                size: 2 ** 31 - 1,
              })}
              target='_blank'
            >
              Excel
            </Button>
          </Stack>
        </Stack>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={60}>No</TableCell>
                <TableCell width={100}>아이디</TableCell>
                <TableCell width={120}>회사명</TableCell>
                <TableCell width={150}>제품명</TableCell>
                <TableCell width={150}>유형</TableCell>
                <TableCell width={100}>시행일시</TableCell>
                <TableCell width={120}>지원금액</TableCell>
                <TableCell width={100}>신고상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contents.map(item => (
                  <TableRow key={item.reportId}>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{item.userId}</TableCell>
                    <TableCell>{item.companyName}</TableCell>
                    <TableCell>{item.productName}</TableCell>
                    <TableCell>{ExpenseReportTypeLabel[item.reportType]}</TableCell>
                    <TableCell>{`${item.eventStartAt !== null ? DateUtils.parseUtcAndFormatKst(item.eventStartAt, DATEFORMAT_YYYY_MM_DD) : '-'} ~ ${item.eventEndAt !== null ? DateUtils.parseUtcAndFormatKst(item.eventEndAt, DATEFORMAT_YYYY_MM_DD) : '-'}`}</TableCell>
                    <TableCell>{`${item.supportAmount.toLocaleString()}원`}</TableCell>
                    <TableCell>{ExpenseReportStatusLabel[item.status]}</TableCell>
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
