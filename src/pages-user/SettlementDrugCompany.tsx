// pages-user/SettlementDrugCompany.tsx
import { type SettlementMemberMonthlyResponse } from '@/backend';
import axios from '@/utils/axios';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { MedipandaTableCell, MedipandaTableRow } from '@/custom/components/MedipandaTable';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { setUrlParams } from '@/lib/utils/url';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY년_MM월, DATEFORMAT_YYYY_MM } from '@/lib/utils/dateFormat';
import { KeyboardArrowLeft, KeyboardArrowRight, Search } from '@mui/icons-material';
import {
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  PaginationItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableHead,
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

interface PageSettlementMemberMonthlyResponse {
  content: SettlementMemberMonthlyResponse[];
  totalPages: number;
  totalElements: number;
}

async function getSettlementsMemberMonthly(options?: {
  drugCompanyName?: string;
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

export default function SettlementDrugCompany() {
  const navigate = useNavigate();

  const [contents, setContents] = useState<SettlementMemberMonthlyResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const initialSearchParams = {
    searchKeyword: '',
    settlementMonth: format(new Date(), DATEFORMAT_YYYY_MM),
    page: '1',
  };

  const { searchKeyword, settlementMonth: paramSettlementMonth, page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const settlementMonth = useMemo(
    () => DateUtils.tryParseDate(paramSettlementMonth) ?? new Date(format(new Date(), DATEFORMAT_YYYY_MM)),
    [paramSettlementMonth],
  );
  const page = Number(paramPage);
  const pageSize = 10;

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      settlementMonth: null as Date | null,
    },
  });

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

  const fetchContents = async () => {
    try {
      const monthNumber = settlementMonth ? Number(format(settlementMonth, 'yyyyMM01')) : undefined;

      const response = await getSettlementsMemberMonthly({
        drugCompanyName: searchKeyword !== '' ? searchKeyword : undefined,
        startMonth: monthNumber,
        endMonth: monthNumber,
        page: page - 1,
        size: pageSize,
      });

      setContents(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch settlement list:', error);
      alert('제약사별 정산내역 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    form.setValue('searchKeyword', searchKeyword);
    form.setValue('settlementMonth', settlementMonth);
    fetchContents();
  }, [searchKeyword, settlementMonth, page]);

  return (
    <>
      <Stack
        direction='row'
        alignItems='center'
        gap='10px'
        sx={{
          alignSelf: 'center',
        }}
      >
        <IconButton
          onClick={() => {
            const prevMonth = new Date(settlementMonth);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            form.setValue('settlementMonth', new Date(format(prevMonth, DATEFORMAT_YYYY_MM)));
            form.handleSubmit(submitHandler)();
          }}
        >
          <KeyboardArrowLeft />
        </IconButton>
        <Typography variant='heading1.7B' sx={{ color: colors.gray80 }}>
          {format(settlementMonth, DATEFORMAT_YYYY년_MM월)}
        </Typography>
        <IconButton
          onClick={() => {
            const nextMonth = new Date(settlementMonth);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            form.setValue('settlementMonth', new Date(format(nextMonth, DATEFORMAT_YYYY_MM)));
            form.handleSubmit(submitHandler)();
          }}
        >
          <KeyboardArrowRight />
        </IconButton>
      </Stack>

      <Stack
        direction='row'
        alignItems='center'
        gap='10px'
        component='form'
        onSubmit={form.handleSubmit(submitHandler)}
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      >
        <FormControl sx={{ width: '320px' }}>
          <Select value='drugCompanyName' disabled>
            <MenuItem value='drugCompanyName'>제약사명</MenuItem>
          </Select>
        </FormControl>
        <Controller
          control={form.control}
          name='searchKeyword'
          render={({ field }) => (
            <TextField
              {...field}
              placeholder='제약사명을 검색하세요.'
              sx={{
                width: '478px',
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton edge='end' type='submit'>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <button type='submit' hidden />
      </Stack>

      <Stack sx={{ marginTop: '40px', width: '100%', maxWidth: '1200px', alignSelf: 'center' }}>
        <Table>
          <TableHead>
            <MedipandaTableRow>
              <MedipandaTableCell sx={{ width: '150px' }}>제약사명</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '150px' }}>처방금액</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '150px' }}>수수료금액</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '150px' }}>추가수수료금액</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '150px' }}>합계금액</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '150px' }}>공급가액</MedipandaTableCell>
              <MedipandaTableCell sx={{ width: '200px' }}>비고</MedipandaTableCell>
            </MedipandaTableRow>
          </TableHead>
          <TableBody>
            {contents.length === 0 ? (
              <MedipandaTableRow>
                <MedipandaTableCell colSpan={7} align='center'>
                  <Typography variant='mediumTextR' sx={{ color: colors.gray60 }}>
                    검색 결과가 없습니다.
                  </Typography>
                </MedipandaTableCell>
              </MedipandaTableRow>
            ) : (
              contents.map(item => {
                const totalFee = (item.baseFeeAmount ?? 0) + (item.extraFeeAmount ?? 0);
                const supplyAmount = Math.floor(totalFee / 1.1);
                return (
                  <MedipandaTableRow key={item.id}>
                    <MedipandaTableCell align='center'>{item.drugCompanyName}</MedipandaTableCell>
                    <MedipandaTableCell align='center'>{(item.prescriptionAmount ?? 0).toLocaleString()}원</MedipandaTableCell>
                    <MedipandaTableCell align='center'>{(item.baseFeeAmount ?? 0).toLocaleString()}원</MedipandaTableCell>
                    <MedipandaTableCell align='center'>{(item.extraFeeAmount ?? 0).toLocaleString()}원</MedipandaTableCell>
                    <MedipandaTableCell align='center'>{totalFee.toLocaleString()}원</MedipandaTableCell>
                    <MedipandaTableCell align='center'>{supplyAmount.toLocaleString()}원</MedipandaTableCell>
                    <MedipandaTableCell align='center'>{item.note ?? '-'}</MedipandaTableCell>
                  </MedipandaTableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <MedipandaPagination
          count={totalPages}
          page={page}
          showFirstButton
          showLastButton
          renderItem={item => (
            <PaginationItem {...item} component={RouterLink} to={setUrlParams({ page: item.page }, initialSearchParams)} />
          )}
          sx={{
            alignSelf: 'center',
            marginTop: '40px',
          }}
        />
      </Stack>
    </>
  );
}
