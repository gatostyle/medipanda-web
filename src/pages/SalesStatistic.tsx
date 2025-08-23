import { DateString, getPerformanceStats, type PerformanceStatsResponse } from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaCheckbox } from '@/custom/components/MedipandaCheckbox';
import { MedipandaDatePicker } from '@/custom/components/MedipandaDatePicker';
import { MedipandaOutlinedInput } from '@/custom/components/MedipandaOutlinedInput';
import { MedipandaTable } from '@/custom/components/MedipandaTable';
import { usePageFetchFormik } from '@/lib/react/usePageFetchFormik';
import { colors } from '@/themes';
import { DATEFORMAT_YYYY_MM } from '@/lib/dateFormat';
import { Search } from '@mui/icons-material';
import { IconButton, InputAdornment, Stack, Typography } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useState } from 'react';

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
  const { content: page, formik: pageFormik } = usePageFetchFormik({
    initialFormValues: {
      startMonth: null as Date | null,
      endMonth: null as Date | null,
      searchKeyword: '',
    },
    fetcher: values => {
      return getPerformanceStats({
        institutionName: values.searchKeyword !== '' ? values.searchKeyword : undefined,
        startMonth: values.startMonth !== null ? new DateString(values.startMonth) : undefined,
        endMonth: values.endMonth !== null ? new DateString(values.endMonth) : undefined,
        page: values.pageIndex,
        size: values.pageSize,
      });
    },
    contentSelector: response => response.content,
    initialContent: [],
  });

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

      {page.length > 0 ? (
        <ChartView data={page} />
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
  const [partnerPage, setPartnerPage] = useState<PerformanceStatsResponse[]>([]);

  const { content: page, formik: pageFormik } = usePageFetchFormik({
    initialFormValues: {
      startMonth: null as Date | null,
      endMonth: null as Date | null,
      searchKeyword: '',
    },
    fetcher: async values => {
      return getPerformanceStats({
        institutionName: values.searchKeyword !== '' ? values.searchKeyword : undefined,
        startMonth: values.startMonth !== null ? new DateString(values.startMonth) : undefined,
        endMonth: values.endMonth !== null ? new DateString(values.endMonth) : undefined,
        page: 0,
        size: 1,
      });
    },
    contentSelector: response => response.content,
    initialContent: [],
    onFetch: () => setPartnerPage([]),
  });

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
          <MedipandaButton onClick={() => setPartnerPage([row.original])} size='small' variant='contained' rounded color='secondary'>
            선택
          </MedipandaButton>
        ),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

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

      {page.length > 0 ? (
        partnerPage.length > 0 ? (
          <ChartView data={partnerPage} />
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

function ChartView({ data }: { data: PerformanceStatsResponse[] }) {
  const [checkedIndexes, setCheckedIndexes] = useState<number[]>([]);

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
      <Stack
        justifyContent='center'
        alignItems='center'
        sx={{
          height: '550px',
          backgroundColor: colors.gray30,
        }}
      >
        그래프 영역
      </Stack>

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
