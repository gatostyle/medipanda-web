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
  DateString,
  getDownloadPerformanceExcel,
  getPerformanceStats,
  getSettlementsTotal,
  type PerformanceStatsResponse,
  SettlementStatus,
} from '@/backend';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { DATEFORMAT_YYYY_MM, DateUtils } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function MpAdminStatisticsList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    searchType: '' as 'drugCompany' | 'companyName' | 'dealerName' | 'institutionName' | '',
    searchKeyword: '',
    settlementMonth: '',
    status: '' as keyof typeof SettlementStatus | '',
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    settlementMonth: paramSettlementMonth,
    status,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const settlementMonth = useMemo(() => DateUtils.tryParseDate(paramSettlementMonth) ?? null, [paramSettlementMonth]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<PerformanceStatsResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPrescriptionAmount, setTotalPrescriptionAmount] = useState(0);

  const { alert, alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      settlementMonth: null as Date | null,
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
        settlementMonth: values.settlementMonth !== null ? format(values.settlementMonth, DATEFORMAT_YYYY_MM) : undefined,
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
      const response = await getPerformanceStats({
        [searchType]: searchKeyword !== '' ? searchKeyword : undefined,
        startMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
        endMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
        page: page - 1,
        size: pageSize,
      });

      const totalPrescriptionAmount = await getSettlementsTotal({
        [searchType]: searchKeyword !== '' ? searchKeyword : undefined,
        startMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
        endMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
      setTotalPrescriptionAmount(totalPrescriptionAmount);
    } catch (error) {
      console.error('Failed to fetch performance statistics:', error);
      await alertError('실적통계 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
      setTotalPrescriptionAmount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    form.setValue('settlementMonth', settlementMonth);
    form.setValue('status', status);
    fetchContents();
  }, [searchType, searchKeyword, settlementMonth, status, page]);

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>실적통계</Typography>

      <Card sx={{ padding: 3 }}>
        <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
          <SearchFilterItem minWidth={140}>
            <FormControl fullWidth size='small'>
              <InputLabel>검색유형</InputLabel>
              <Controller
                control={form.control}
                name='searchType'
                render={({ field }) => (
                  <Select {...field}>
                    <MenuItem value={'drugCompany'}>제약사명</MenuItem>
                    <MenuItem value={'companyName'}>회사명</MenuItem>
                    <MenuItem value={'dealerName'}>딜러명</MenuItem>
                    <MenuItem value={'institutionName'}>거래처명</MenuItem>
                  </Select>
                )}
              />
            </FormControl>
          </SearchFilterItem>
          <SearchFilterItem minWidth={140}>
            <Controller
              control={form.control}
              name={'settlementMonth'}
              render={({ field }) => (
                <DatePicker
                  {...field}
                  format={DATEFORMAT_YYYY_MM}
                  views={['year', 'month']}
                  label='정산월'
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
            <Typography variant='subtitle1'>총 처방금액: {totalPrescriptionAmount.toLocaleString()}원</Typography>
          </Stack>
          <Stack direction='row' spacing={1}>
            <Button
              variant='contained'
              color='success'
              size='small'
              href={getDownloadPerformanceExcel({
                [searchType]: searchKeyword !== '' ? searchKeyword : undefined,
                startMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
                endMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
                size: 2 ** 31 - 1,
              })}
              target='_blank'
              startIcon={<DocumentDownload size={16} />}
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
                <TableCell width={120}>제약사명</TableCell>
                <TableCell width={120}>회사명</TableCell>
                <TableCell width={100}>딜러명</TableCell>
                <TableCell width={120}>거래처코드</TableCell>
                <TableCell width={120}>거래처명</TableCell>
                <TableCell width={100}>정산월</TableCell>
                <TableCell width={120}>처방금액</TableCell>
                <TableCell width={120}>합계금액</TableCell>
                <TableCell width={120}>수수료금액</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : contents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                contents.map(item => (
                  <TableRow key={`${item.drugCompany}-${item.institutionCode}-${item.settlementMonth}`}>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{item.drugCompany}</TableCell>
                    <TableCell>{item.companyName}</TableCell>
                    <TableCell>{item.dealerName}</TableCell>
                    <TableCell>{item.institutionCode}</TableCell>
                    <TableCell>{item.institutionName}</TableCell>
                    <TableCell>{DateUtils.parseUtcAndFormatKst(item.settlementMonth, DATEFORMAT_YYYY_MM)}</TableCell>
                    <TableCell>{item.prescriptionAmount.toLocaleString()}</TableCell>
                    <TableCell>{item.totalAmount.toLocaleString()}</TableCell>
                    <TableCell>{item.feeAmount.toLocaleString()}</TableCell>
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
