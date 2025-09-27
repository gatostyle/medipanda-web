import {
  DateString,
  getPerformanceByDrugCompany,
  getPerformanceByDrugCompanyMonthly,
  getPerformanceByInstitution,
  type PerformanceStatsByDrugCompany,
  type PerformanceStatsByInstitution,
} from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { MedipandaDatePicker } from '@/custom/components/MedipandaDatePicker';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { MedipandaTable } from '@/custom/components/MedipandaTable';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { DATEFORMAT_YYYY_MM, formatYyyyMm, formatYyyyMmDd, formatYyyy년Mm월, getMonthRange, SafeDate } from '@/lib/utils/dateFormat';
import { setUrlParams } from '@/lib/utils/url';
import { colors } from '@/themes';
import { Search } from '@mui/icons-material';
import { IconButton, InputAdornment, Stack, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function SalesStatistic() {
  const { tab } = useSearchParamsOrDefault({ tab: 'ALL' as 'ALL' | 'INDIVIDUAL' });

  return (
    <>
      <Stack gap='40px'>
        <Stack direction='row' justifyContent='center'>
          <MedipandaButton
            variant={tab === 'ALL' ? 'contained' : 'outlined'}
            rounded
            component={RouterLink}
            to={''}
            sx={{
              width: '140px',
              borderTopRightRadius: '0px',
              borderBottomRightRadius: '0px',
            }}
          >
            전체매출
          </MedipandaButton>
          <MedipandaButton
            variant={tab === 'INDIVIDUAL' ? 'contained' : 'outlined'}
            rounded
            component={RouterLink}
            to={'?tab=INDIVIDUAL'}
            sx={{
              width: '140px',
              borderBottomLeftRadius: '0px',
              borderTopLeftRadius: '0px',
            }}
          >
            거래처매출
          </MedipandaButton>
        </Stack>

        {tab === 'ALL' ? <TotalSalesStatistic /> : <PartnerSalesStatistic />}
      </Stack>
    </>
  );
}

function TotalSalesStatistic() {
  const navigate = useNavigate();

  const [contents, setContents] = useState<PerformanceStatsByDrugCompany[]>([]);

  const initialSearchParams = {
    startMonth: '',
    endMonth: '',
    searchKeyword: '',
  };

  const { startMonth: paramStartMonth, endMonth: paramEndMonth, searchKeyword } = useSearchParamsOrDefault(initialSearchParams);
  const startMonth = useMemo(() => SafeDate(paramStartMonth), [paramStartMonth]);
  const endMonth = useMemo(() => SafeDate(paramEndMonth), [paramEndMonth]);

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      startMonth: null as Date | null,
      endMonth: null as Date | null,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.startMonth === null || values.endMonth === null) {
      alert('시작월과 종료월을 모두 입력해주세요.');
      return;
    }

    const url = setUrlParams(
      {
        ...values,
        startMonth: values.startMonth !== null ? formatYyyyMm(values.startMonth) : undefined,
        endMonth: values.endMonth !== null ? formatYyyyMm(values.endMonth) : undefined,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const fetchContents = async () => {
    try {
      const response = await getPerformanceByDrugCompany({
        startMonth: startMonth !== null ? new DateString(startMonth) : undefined,
        endMonth: endMonth !== null ? new DateString(endMonth) : undefined,
      });

      setContents(response.filter(item => searchKeyword === '' || item.drugCompany?.includes(searchKeyword)));
    } catch (error) {
      console.error('Failed to fetch performance', error);
      alert('전체 매출 통계 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
    }
  };

  useEffect(() => {
    form.setValue('startMonth', startMonth);
    form.setValue('endMonth', endMonth);
    form.setValue('searchKeyword', searchKeyword);
    fetchContents();
  }, [startMonth, endMonth, searchKeyword]);

  return (
    <>
      <Stack
        direction='row'
        justifyContent='center'
        alignItems='center'
        gap='10px'
        component='form'
        onSubmit={form.handleSubmit(submitHandler)}
      >
        <Controller
          control={form.control}
          name={'startMonth'}
          render={({ field }) => (
            <MedipandaDatePicker
              {...field}
              label='시작월'
              format={DATEFORMAT_YYYY_MM}
              views={['year', 'month']}
              sx={{
                width: '180px',
              }}
            />
          )}
        />
        ~
        <Controller
          control={form.control}
          name={'endMonth'}
          render={({ field }) => (
            <MedipandaDatePicker
              {...field}
              label='종료월'
              format={DATEFORMAT_YYYY_MM}
              views={['year', 'month']}
              sx={{
                width: '180px',
              }}
            />
          )}
        />
        <Controller
          control={form.control}
          name={'searchKeyword'}
          render={({ field }) => (
            <MedipandaOutlinedInput
              {...field}
              placeholder='검색'
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton edge='end' type='submit'>
                    <Search />
                  </IconButton>
                </InputAdornment>
              }
              sx={{
                width: '400px',
                height: '50px',
              }}
            />
          )}
        />
        <button type='submit' hidden />
      </Stack>

      {startMonth === null || endMonth === null ? (
        <Typography
          variant='largeTextM'
          sx={{
            alignSelf: 'center',
          }}
        >
          조회하고 싶은 기간을 입력해주세요.
        </Typography>
      ) : contents.length > 0 ? (
        <ChartView data={contents} startMonth={startMonth} endMonth={endMonth} />
      ) : (
        <Stack alignItems='center'>
          <Typography variant='largeTextM' sx={{ color: colors.gray80 }}>
            검색 결과가 없습니다.
          </Typography>
        </Stack>
      )}
    </>
  );
}

function PartnerSalesStatistic() {
  const navigate = useNavigate();

  const [contents, setContents] = useState<PerformanceStatsByInstitution[]>([]);

  const initialSearchParams = {
    startMonth: '',
    endMonth: '',
    searchKeyword: '',
  };

  const { startMonth: paramStartMonth, endMonth: paramEndMonth, searchKeyword } = useSearchParamsOrDefault(initialSearchParams);
  const startMonth = useMemo(() => SafeDate(paramStartMonth), [paramStartMonth]);
  const endMonth = useMemo(() => SafeDate(paramEndMonth), [paramEndMonth]);

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      startMonth: null as Date | null,
      endMonth: null as Date | null,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.startMonth === null || values.endMonth === null) {
      alert('시작월과 종료월을 모두 입력해주세요.');
      return;
    }

    const url = setUrlParams(
      {
        ...values,
        startMonth: values.startMonth !== null ? formatYyyyMm(values.startMonth) : undefined,
        endMonth: values.endMonth !== null ? formatYyyyMm(values.endMonth) : undefined,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const fetchContents = async () => {
    try {
      const response = await getPerformanceByInstitution({
        startMonth: startMonth !== null ? new DateString(startMonth) : undefined,
        endMonth: endMonth !== null ? new DateString(endMonth) : undefined,
      });

      setContents(response.filter(item => searchKeyword === '' || item.institutionName?.includes(searchKeyword)));
    } catch (error) {
      console.error('Failed to fetch performance by institution:', error);
      alert('거래처별 매출 통계 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
    }
  };

  useEffect(() => {
    form.setValue('startMonth', startMonth);
    form.setValue('endMonth', endMonth);
    form.setValue('searchKeyword', searchKeyword);
    fetchContents();
  }, [startMonth, endMonth, searchKeyword]);

  const [institutionCode, setInstitutionCode] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceStatsByDrugCompany[] | null>(null);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: '거래처명',
        cell: ({ row }) => row.original.institutionName,
      },
      {
        header: '처방금액',
        cell: ({ row }) => row.original.prescriptionAmount,
      },
      {
        header: '정산(합계)금액(VAT포함)',
        cell: ({ row }) => row.original.totalAmount,
      },
      {
        header: '관리',
        cell: ({ row }) => (
          <MedipandaButton
            onClick={() => fetchPerformance(row.original.institutionCode)}
            size='small'
            variant='contained'
            rounded
            color='secondary'
          >
            선택
          </MedipandaButton>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  const fetchPerformance = async (institutionCode: string | null) => {
    setInstitutionCode(institutionCode);

    const response = await getPerformanceByDrugCompany({
      institutionCode: institutionCode ?? undefined,
      startMonth: startMonth !== null ? new DateString(startMonth) : undefined,
      endMonth: endMonth !== null ? new DateString(endMonth) : undefined,
    });

    setPerformanceData(response);
  };

  return (
    <>
      <Stack
        direction='row'
        justifyContent='center'
        alignItems='center'
        gap='10px'
        component='form'
        onSubmit={form.handleSubmit(submitHandler)}
      >
        <Controller
          control={form.control}
          name={'startMonth'}
          render={({ field }) => (
            <MedipandaDatePicker
              {...field}
              label='시작월'
              format={DATEFORMAT_YYYY_MM}
              views={['year', 'month']}
              sx={{
                width: '180px',
              }}
            />
          )}
        />
        ~
        <Controller
          control={form.control}
          name={'endMonth'}
          render={({ field }) => (
            <MedipandaDatePicker
              {...field}
              label='종료월'
              format={DATEFORMAT_YYYY_MM}
              views={['year', 'month']}
              sx={{
                width: '180px',
              }}
            />
          )}
        />
        <Controller
          control={form.control}
          name={'searchKeyword'}
          render={({ field }) => (
            <MedipandaOutlinedInput
              {...field}
              placeholder='거래처명을 입력해주세요.'
              endAdornment={
                <InputAdornment position='end'>
                  <IconButton edge='end' type='submit'>
                    <Search />
                  </IconButton>
                </InputAdornment>
              }
              sx={{
                width: '400px',
                height: '50px',
              }}
            />
          )}
        />
        <button type='submit' hidden />
      </Stack>

      {startMonth === null || endMonth === null ? (
        <Typography
          variant='largeTextM'
          sx={{
            alignSelf: 'center',
          }}
        >
          조회하고 싶은 기간을 입력해주세요.
        </Typography>
      ) : contents.length > 0 ? (
        performanceData !== null ? (
          <ChartView institutionCode={institutionCode ?? undefined} data={performanceData} startMonth={startMonth} endMonth={endMonth} />
        ) : (
          <MedipandaTable table={table} />
        )
      ) : (
        <Stack alignItems='center'>
          <Typography variant='largeTextM' sx={{ color: colors.gray80 }}>
            검색 결과가 없습니다.
          </Typography>
        </Stack>
      )}
    </>
  );
}

function ChartView({
  institutionCode,
  data,
  startMonth,
  endMonth,
}: {
  institutionCode?: string;
  data: { drugCompany: string | null; prescriptionAmount: number; totalAmount: number }[];
  startMonth: Date;
  endMonth: Date;
}) {
  console.log(institutionCode);
  const dateRange = useMemo(() => getMonthRange(startMonth, endMonth), [startMonth, endMonth]);

  const [checkedIndexes, setCheckedIndexes] = useState<number[]>([]);
  const [chartSeries, setChartSeries] = useState<{ label: string; data: number[] }[]>([]);
  const filteredChartSeries = useMemo(() => {
    return chartSeries.filter((_, index) => checkedIndexes.includes(index));
  }, [chartSeries, checkedIndexes]);

  const fetchChartData = useCallback(
    async (startMonth: Date, endMonth: Date, institutionCode?: string) => {
      const data = await getPerformanceByDrugCompanyMonthly({
        institutionCode,
        startMonth: new DateString(startMonth),
        endMonth: new DateString(endMonth),
      });

      const aggregated: Record<string, Record<string, { settlementMonth: string; totalAmount: number }>> = {};

      data.forEach(item => {
        if (!aggregated[item.drugCompany]) {
          aggregated[item.drugCompany] = {};
        }

        aggregated[item.drugCompany][item.settlementMonth] = item;
      });

      Object.entries(aggregated).forEach(([, months]) => {
        dateRange.forEach(date => {
          const monthKey = formatYyyyMmDd(date);

          if (!months[monthKey]) {
            months[monthKey] = {
              settlementMonth: monthKey,
              totalAmount: 0,
            };
          }
        });
      });

      setChartSeries(
        Object.entries(aggregated).map(([drugCompany, months]) => ({
          label: drugCompany,
          data: Object.values(months)
            .sort((a, b) => a.settlementMonth.localeCompare(b.settlementMonth))
            .map(it => it.totalAmount),
        })),
      );
    },
    [dateRange],
  );

  useEffect(() => {
    fetchChartData(startMonth, endMonth, institutionCode);
  }, [fetchChartData, institutionCode, startMonth, endMonth]);

  useEffect(() => {
    setCheckedIndexes([]);
  }, [data]);

  const table = useReactTable({
    data,
    columns: [
      {
        id: 'select',
        header: () => {
          return (
            <MedipandaCheckbox
              checked={checkedIndexes.length === data.length}
              onChange={(_, checked) => {
                if (checked) {
                  setCheckedIndexes([...data.map((_, index) => index)]);
                } else {
                  setCheckedIndexes([]);
                }
              }}
            />
          );
        },
        cell: ({ row }) => (
          <MedipandaCheckbox
            checked={checkedIndexes.includes(row.index)}
            onChange={(_, checked) => {
              if (checked) {
                setCheckedIndexes(prev => [...prev, row.index]);
              } else {
                setCheckedIndexes(prev => prev.filter(index => index !== row.index));
              }
            }}
          />
        ),
      },
      {
        header: '제약사명',
        cell: ({ row }) => row.original.drugCompany,
      },
      {
        header: '처방금액',
        cell: ({ row }) => row.original.prescriptionAmount,
      },
      {
        header: '정산(합계)금액(VAT포함)',
        cell: ({ row }) => row.original.totalAmount,
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      {filteredChartSeries.length > 0 && (
        <LineChart
          xAxis={[
            {
              scaleType: 'point',
              data: getMonthRange(startMonth, endMonth).map(date => formatYyyy년Mm월(date)),
            },
          ]}
          series={filteredChartSeries}
          height={550}
          sx={{}}
        />
      )}

      <Stack gap='10px' alignItems='center'>
        <Typography variant='largeTextR' sx={{ color: colors.red }}>
          ※ 정산월 기준으로 산정된 금액이며, 만원단위 이하는 절삭한 금액으로 표시 됩니다.
        </Typography>
        <MedipandaTable
          table={table}
          sx={{
            maxWidth: '800px',
          }}
        />
      </Stack>
    </>
  );
}
