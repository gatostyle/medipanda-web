import {
  type SettlementMemberMonthlyResponse,
  type SettlementMemberMonthlyUpdateRequest,
  type DrugCompanyResponse,
  type PageSettlementMemberMonthlyResponse,
  getDrugCompanies,
} from '@/backend';
import axios from '@/utils/axios';
import { setUrlParams } from '@/lib/utils/url';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { SearchFilterActions, MpSearchFilterBar, SearchFilterItem } from '@/components/MpSearchFilterBar';
import { useMpModal } from '@/hooks/useMpModal';
import { DATEFORMAT_YYYY_MM, DateUtils } from '@/lib/utils/dateFormat';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
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
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';
import debounce from 'lodash/debounce';

// API 함수 (backend에 추가되면 import로 대체)
async function getSettlementsMemberMonthly(options?: {
  drugCompanyName?: string;
  companyName?: string;
  startMonth?: number;
  endMonth?: number;
  page?: number;
  size?: number;
}): Promise<PageSettlementMemberMonthlyResponse> {
  const response = await axios.request<PageSettlementMemberMonthlyResponse>({
    method: 'GET',
    url: '/v1/settlements-member-monthly',
    params: options,
  });
  return response.data;
}

async function updateSettlementMemberMonthly(
  id: number,
  data: SettlementMemberMonthlyUpdateRequest,
): Promise<SettlementMemberMonthlyResponse> {
  const response = await axios.request<SettlementMemberMonthlyResponse>({
    method: 'PUT',
    url: `/v1/settlements-member-monthly/${id}`,
    data,
  });
  return response.data;
}

export default function MpAdminSettlementMemberMonthlyList() {
  const navigate = useNavigate();

  const initialSearchParams = {
    drugCompanyName: '',
    companyName: '',
    settlementMonth: '',
    page: '1',
  };

  const {
    drugCompanyName,
    companyName,
    settlementMonth: paramSettlementMonth,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const settlementMonth = useMemo(() => DateUtils.tryParseDate(paramSettlementMonth) ?? null, [paramSettlementMonth]);
  const page = Number(paramPage);
  const pageSize = 20;

  const [loading, setLoading] = useState(false);
  const [contents, setContents] = useState<Sequenced<SettlementMemberMonthlyResponse>[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [drugCompanies, setDrugCompanies] = useState<DrugCompanyResponse[]>([]);

  const { alertError } = useMpModal();

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      settlementMonth: null as Date | null,
    },
  });

  const totalExtraFeeAmount = useMemo(() => {
    return contents.reduce((sum, item) => sum + (item.extraFeeAmount ?? 0), 0);
  }, [contents]);

  const totalAmount = useMemo(() => {
    return contents.reduce((sum, item) => sum + (item.baseFeeAmount ?? 0) + (item.extraFeeAmount ?? 0), 0);
  }, [contents]);

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
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

  const fetchDrugCompanies = async () => {
    try {
      const response = await getDrugCompanies();
      setDrugCompanies(response);
    } catch (error) {
      console.error('Failed to fetch drug companies:', error);
    }
  };

  const fetchContents = async () => {
    setLoading(true);
    try {
      const monthNumber = settlementMonth ? Number(format(settlementMonth, 'yyyyMM')) : undefined;

      const response = await getSettlementsMemberMonthly({
        drugCompanyName: drugCompanyName !== '' ? drugCompanyName : undefined,
        companyName: companyName !== '' ? companyName : undefined,
        startMonth: monthNumber,
        endMonth: monthNumber,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch settlement member monthly list:', error);
      await alertError('회원별 정산 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalElements(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrugCompanies();
  }, []);

  useEffect(() => {
    form.setValue('drugCompanyName', drugCompanyName);
    form.setValue('companyName', companyName);
    form.setValue('settlementMonth', settlementMonth);
    fetchContents();
  }, [drugCompanyName, companyName, settlementMonth, page]);

  const handleUpdateField = useCallback(
    debounce(async (id: number, extraFeeAmount: number | null, note: string | null) => {
      try {
        await updateSettlementMemberMonthly(id, {
          extraFeeAmount,
          note,
        });
      } catch (error) {
        console.error('Failed to update settlement member monthly:', error);
        await alertError('저장 중 오류가 발생했습니다.');
      }
    }, 500),
    [],
  );

  const handleExtraFeeAmountChange = (id: number, value: string, currentNote: string | null) => {
    const numValue = value === '' ? null : Number(value.replace(/,/g, ''));
    setContents(prev => prev.map(item => (item.id === id ? { ...item, extraFeeAmount: numValue } : item)));
    handleUpdateField(id, numValue, currentNote);
  };

  const handleNoteChange = (id: number, value: string, currentExtraFeeAmount: number | null) => {
    const noteValue = value === '' ? null : value;
    setContents(prev => prev.map(item => (item.id === id ? { ...item, note: noteValue } : item)));
    handleUpdateField(id, currentExtraFeeAmount, noteValue);
  };

  const formatSettlementMonth = (month: number): string => {
    const str = String(month);
    return `${str.slice(0, 4)}-${str.slice(4, 6)}`;
  };

  return (
    <>
      <Stack sx={{ gap: 3 }}>
        <Typography variant='h4'>회원별 정산</Typography>

        <Card sx={{ padding: 3 }}>
          <MpSearchFilterBar component='form' onSubmit={form.handleSubmit(submitHandler)}>
            <SearchFilterItem minWidth={140}>
              <FormControl fullWidth size='small'>
                <InputLabel shrink>제약사명</InputLabel>
                <Controller
                  control={form.control}
                  name='drugCompanyName'
                  render={({ field }) => (
                    <Select {...field} label='제약사명' displayEmpty notched renderValue={value => (value === '' ? '전체' : value)}>
                      <MenuItem value=''>전체</MenuItem>
                      {drugCompanies.map(dc => (
                        <MenuItem key={dc.id} value={dc.name ?? ''}>
                          {dc.name}
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
                <Select value='companyName' disabled label='검색유형'>
                  <MenuItem value='companyName'>회사명</MenuItem>
                </Select>
              </FormControl>
            </SearchFilterItem>
            <SearchFilterItem minWidth={140}>
              <Controller
                control={form.control}
                name='settlementMonth'
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
                name='companyName'
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
              <Typography variant='subtitle1'>총 추가수수료금액: {totalExtraFeeAmount.toLocaleString()}원</Typography>
              <Typography variant='subtitle1'>총 합계금액: {totalAmount.toLocaleString()}원</Typography>
            </Stack>
            <Stack direction='row' spacing={1}>
              <Button
                variant='contained'
                color='success'
                size='small'
                component='a'
                href={`/v1/settlements-member-monthly/excel-download?${new URLSearchParams(
                  Object.entries({
                    drugCompanyName: drugCompanyName !== '' ? drugCompanyName : undefined,
                    companyName: companyName !== '' ? companyName : undefined,
                    startMonth: settlementMonth ? format(settlementMonth, 'yyyyMM') : undefined,
                    endMonth: settlementMonth ? format(settlementMonth, 'yyyyMM') : undefined,
                  }).filter(([_, v]) => v !== undefined) as [string, string][],
                ).toString()}`}
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
                  <TableCell width={150}>회사명</TableCell>
                  <TableCell width={100}>정산월</TableCell>
                  <TableCell width={120}>처방금액</TableCell>
                  <TableCell width={120}>수수료금액</TableCell>
                  <TableCell width={140}>추가수수료금액</TableCell>
                  <TableCell width={120}>합계금액</TableCell>
                  <TableCell width={120}>공급가액</TableCell>
                  <TableCell width={200}>비고</TableCell>
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
                  contents.map(item => {
                    const totalFee = (item.baseFeeAmount ?? 0) + (item.extraFeeAmount ?? 0);
                    const supplyAmount = Math.floor(totalFee / 1.1);
                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.sequence}</TableCell>
                        <TableCell>{item.drugCompanyName}</TableCell>
                        <TableCell>{item.companyName}</TableCell>
                        <TableCell>{formatSettlementMonth(item.settlementMonth)}</TableCell>
                        <TableCell>{(item.prescriptionAmount ?? 0).toLocaleString()}</TableCell>
                        <TableCell>{(item.baseFeeAmount ?? 0).toLocaleString()}</TableCell>
                        <TableCell>
                          <TextField
                            size='small'
                            type='number'
                            value={item.extraFeeAmount ?? ''}
                            onChange={e => handleExtraFeeAmountChange(item.id, e.target.value, item.note)}
                            sx={{ width: 120 }}
                          />
                        </TableCell>
                        <TableCell>{totalFee.toLocaleString()}</TableCell>
                        <TableCell>{supplyAmount.toLocaleString()}</TableCell>
                        <TableCell>
                          <TextField
                            size='small'
                            value={item.note ?? ''}
                            onChange={e => handleNoteChange(item.id, e.target.value, item.extraFeeAmount)}
                            sx={{ width: 180 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
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
    </>
  );
}
