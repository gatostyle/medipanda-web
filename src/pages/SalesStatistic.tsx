import {
  DateString,
  getPerformanceByDrugCompany,
  getPerformanceByDrugCompanyMonthly,
  getPerformanceByInstitution,
  type PerformanceStatsByDrugCompany,
} from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { MedipandaDatePicker } from '@/custom/components/MedipandaDatePicker';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { MedipandaTable } from '@/custom/components/MedipandaTable';
import { DATEFORMAT_YYYY_MM, formatYyyyMmDd, formatYyyy년Mm월, getMonthRange } from '@/lib/utils/dateFormat';
import { usePageFetchFormik } from '@/lib/components/usePageFetchFormik';
import { colors } from '@/themes';
import { Search } from '@mui/icons-material';
import { IconButton, InputAdornment, Stack, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function SalesStatistic() {
  const [currentTab, setCurrentTab] = useState<'ALL' | 'INDIVIDUAL'>('ALL');

  return (
    <>
      <Stack gap='40px'>
        <Stack direction='row' justifyContent='center'>
          <MedipandaButton
            variant={currentTab === 'ALL' ? 'contained' : 'outlined'}
            rounded
            onClick={() => setCurrentTab('ALL')}
            sx={{
              width: '140px',
              borderTopRightRadius: '0px',
              borderBottomRightRadius: '0px',
            }}
          >
            전체매출
          </MedipandaButton>
          <MedipandaButton
            variant={currentTab === 'INDIVIDUAL' ? 'contained' : 'outlined'}
            rounded
            onClick={() => setCurrentTab('INDIVIDUAL')}
            sx={{
              width: '140px',
              borderBottomLeftRadius: '0px',
              borderTopLeftRadius: '0px',
            }}
          >
            거래처매출
          </MedipandaButton>
        </Stack>

        {currentTab === 'ALL' ? <TotalSalesStatistic /> : <PartnerSalesStatistic />}
      </Stack>
    </>
  );
}

function TotalSalesStatistic() {
  const {
    content: page,
    formik: pageFormik,
    refresh,
  } = usePageFetchFormik({
    initialFormValues: {
      startMonth: null as Date | null,
      endMonth: null as Date | null,
      searchKeyword: '',
    },
    fetcher: async values => {
      const response = await getPerformanceByDrugCompany({
        startMonth: values.startMonth !== null ? new DateString(values.startMonth) : undefined,
        endMonth: values.endMonth !== null ? new DateString(values.endMonth) : undefined,
      });

      return response.filter(item => values.searchKeyword === '' || item.drugCompany?.includes(values.searchKeyword));
    },
    initialContent: [],
  });

  useEffect(() => {
    if (pageFormik.values.startMonth !== null && pageFormik.values.endMonth !== null) {
      return;
    }

    refresh();
  }, [pageFormik.values.startMonth, pageFormik.values.endMonth, refresh]);

  return (
    <>
      <Stack direction='row' justifyContent='center' alignItems='center' gap='10px' component='form' onSubmit={pageFormik.handleSubmit}>
        <MedipandaDatePicker
          value={pageFormik.values.startMonth}
          onChange={date => pageFormik.setFieldValue('startMonth', date)}
          label='시작월'
          format={DATEFORMAT_YYYY_MM}
          views={['year', 'month']}
          sx={{
            width: '180px',
          }}
        />
        ~
        <MedipandaDatePicker
          value={pageFormik.values.endMonth}
          onChange={date => pageFormik.setFieldValue('endMonth', date)}
          label='종료월'
          format={DATEFORMAT_YYYY_MM}
          views={['year', 'month']}
          sx={{
            width: '180px',
          }}
        />
        <MedipandaOutlinedInput
          name='searchKeyword'
          value={pageFormik.values.searchKeyword ?? ''}
          onChange={pageFormik.handleChange}
          placeholder='검색'
          endAdornment={
            <InputAdornment position='end'>
              <IconButton edge='end' onClick={pageFormik.submitForm}>
                <Search />
              </IconButton>
            </InputAdornment>
          }
          sx={{
            width: '400px',
            height: '50px',
          }}
        />
        <button type='submit' hidden />
      </Stack>

      {pageFormik.values.startMonth === null || pageFormik.values.endMonth === null ? (
        <Typography
          variant='largeTextM'
          sx={{
            alignSelf: 'center',
          }}
        >
          조회하고 싶은 기간을 입력해주세요.
        </Typography>
      ) : page.length > 0 ? (
        <ChartView data={page} startMonth={pageFormik.values.startMonth} endMonth={pageFormik.values.endMonth} />
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
  const [institutionCode, setInstitutionCode] = useState<string | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceStatsByDrugCompany[] | null>(null);

  const {
    content: page,
    formik: pageFormik,
    refresh,
  } = usePageFetchFormik({
    initialFormValues: {
      startMonth: null as Date | null,
      endMonth: null as Date | null,
      searchKeyword: '',
    },
    fetcher: async values => {
      const response = await getPerformanceByInstitution({
        startMonth: values.startMonth !== null ? new DateString(values.startMonth) : undefined,
        endMonth: values.endMonth !== null ? new DateString(values.endMonth) : undefined,
      });
      return response.filter(item => values.searchKeyword === '' || item.institutionName?.includes(values.searchKeyword));
    },
    initialContent: [],
    onFetch: () => setPerformanceData(null),
  });

  useEffect(() => {
    if (pageFormik.values.startMonth !== null && pageFormik.values.endMonth !== null) {
      return;
    }

    refresh();
  }, [pageFormik.values.startMonth, pageFormik.values.endMonth, refresh]);

  const table = useReactTable({
    data: page,
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
      startMonth: pageFormik.values.startMonth !== null ? new DateString(pageFormik.values.startMonth) : undefined,
      endMonth: pageFormik.values.endMonth !== null ? new DateString(pageFormik.values.endMonth) : undefined,
    });

    setPerformanceData(response);
  };

  return (
    <>
      <Stack direction='row' justifyContent='center' alignItems='center' gap='10px' component='form' onSubmit={pageFormik.handleSubmit}>
        <MedipandaDatePicker
          value={pageFormik.values.startMonth}
          onChange={date => pageFormik.setFieldValue('startMonth', date)}
          label='시작월'
          format={DATEFORMAT_YYYY_MM}
          views={['year', 'month']}
          sx={{
            width: '180px',
          }}
        />
        ~
        <MedipandaDatePicker
          value={pageFormik.values.endMonth}
          onChange={date => pageFormik.setFieldValue('endMonth', date)}
          label='종료월'
          format={DATEFORMAT_YYYY_MM}
          views={['year', 'month']}
          sx={{
            width: '180px',
          }}
        />
        <MedipandaOutlinedInput
          name='searchKeyword'
          value={pageFormik.values.searchKeyword ?? ''}
          onChange={pageFormik.handleChange}
          placeholder='거래처명을 입력해주세요.'
          endAdornment={
            <InputAdornment position='end'>
              <IconButton edge='end'>
                <Search />
              </IconButton>
            </InputAdornment>
          }
          sx={{
            width: '400px',
            height: '50px',
          }}
        />
        <button type='submit' hidden />
      </Stack>

      {pageFormik.values.startMonth === null || pageFormik.values.endMonth === null ? (
        <Typography
          variant='largeTextM'
          sx={{
            alignSelf: 'center',
          }}
        >
          조회하고 싶은 기간을 입력해주세요.
        </Typography>
      ) : page.length > 0 ? (
        performanceData !== null ? (
          <ChartView
            institutionCode={institutionCode ?? undefined}
            data={performanceData}
            startMonth={pageFormik.values.startMonth}
            endMonth={pageFormik.values.endMonth}
          />
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
