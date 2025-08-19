import { Search } from '@mui/icons-material';
import { Checkbox, IconButton, InputAdornment, Stack, Typography } from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { getPerformanceStats, type PerformanceStatsResponse } from '../backend';
import { MedipandaButton } from '../custom/components/MedipandaButton.tsx';
import { MedipandaDatePicker } from '../custom/components/MedipandaDatePicker.tsx';
import { MedipandaOutlinedInput } from '../custom/components/MedipandaOutlinedInput.tsx';
import { MedipandaTable } from '../custom/components/MedipandaTable.tsx';
import { colors } from '../custom/globalStyles.ts';
import { DATEFORMAT_YYYY_MM, formatYyyyMm } from '../utils/dateFormat.ts';

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
  const [page, setPage] = useState<PerformanceStatsResponse[]>([]);

  const pageFormik = useFormik({
    initialValues: {
      startMonth: null as Date | null,
      endMonth: null as Date | null,
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 20,
      totalPages: 1,
    },
    onSubmit: async () => {
      if (pageFormik.values.pageIndex !== 0) {
        await pageFormik.setFieldValue('pageIndex', 0);
      } else {
        await fetchPage();
      }
    },
  });

  const fetchPage = async () => {
    const response = await getPerformanceStats({
      institutionName: pageFormik.values.searchKeyword !== '' ? pageFormik.values.searchKeyword : undefined,
      startMonth: pageFormik.values.startMonth !== null ? formatYyyyMm(pageFormik.values.startMonth) : undefined,
      endMonth: pageFormik.values.endMonth !== null ? formatYyyyMm(pageFormik.values.endMonth) : undefined,
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(response.content);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

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

  const [page, setPage] = useState<PerformanceStatsResponse[]>([]);

  const pageFormik = useFormik({
    initialValues: {
      startMonth: null as Date | null,
      endMonth: null as Date | null,
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 20,
      totalPages: 1,
    },
    onSubmit: async () => {
      if (pageFormik.values.pageIndex !== 0) {
        await pageFormik.setFieldValue('pageIndex', 0);
      } else {
        await fetchPage();
      }
    },
  });

  const fetchPage = async () => {
    const response = await getPerformanceStats({
      institutionName: pageFormik.values.searchKeyword !== '' ? pageFormik.values.searchKeyword : undefined,
      startMonth: pageFormik.values.startMonth !== null ? formatYyyyMm(pageFormik.values.startMonth) : undefined,
      endMonth: pageFormik.values.endMonth !== null ? formatYyyyMm(pageFormik.values.endMonth) : undefined,
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(response.content);

    setPartnerPage([]);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

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
            <Checkbox
              checked={checkedIndexes.length === data.length}
              onChange={(_, checked) => {
                if (checked) {
                  setCheckedIndexes([...data.map((_, index) => index)]);
                } else {
                  setCheckedIndexes([]);
                }
              }}
              sx={{
                '& svg': {
                  color: colors.vividViolet,
                },
              }}
            />
          );
        },
        cell: ({ row }) => (
          <Checkbox
            checked={checkedIndexes.includes(row.index)}
            onChange={(_, checked) => {
              if (checked) {
                setCheckedIndexes(prev => [...prev, row.index]);
              } else {
                setCheckedIndexes(prev => prev.filter(index => index !== row.index));
              }
            }}
            sx={{
              '& svg': {
                color: colors.vividViolet,
              },
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
          width: '100%',
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
