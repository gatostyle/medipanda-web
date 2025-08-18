import { KeyboardArrowLeft, KeyboardArrowRight, Search } from '@mui/icons-material';
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableHead,
  TextField,
  Typography,
} from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import {
  getSettlement,
  getSettlementPartnerSummary,
  getSettlements,
  type SettlementPartnerResponse,
  type SettlementResponse,
} from '../backend';
import { FixedLoader } from '../components/FixedLoader.tsx';
import { MedipandaPagination } from '../custom/components/MedipandaPagination.tsx';
import { MedipandaButton } from '../custom/components/MedipandaButton.tsx';
import { MedipandaTable, MedipandaTableCell, MedipandaTableRow } from '../custom/components/MedipandaTable.tsx';
import { colors } from '../custom/globalStyles.ts';
import { formatYyyyMm, formatYyyy년Mm월 } from '../utils/dateFormat.ts';

export default function SettlementList() {
  const [page, setPage] = useState<SettlementResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const pageFormik = useFormik({
    initialValues: {
      searchType: 'companyName' as 'companyName' | 'dealerName',
      searchKeyword: '',
      settlementMonth: new Date(formatYyyyMm(new Date())),
      pageIndex: 0,
      pageSize: 10,
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
    const response = await getSettlements({
      companyName: pageFormik.values.searchType === 'companyName' ? pageFormik.values.searchKeyword : undefined,
      dealerName: pageFormik.values.searchType === 'dealerName' ? pageFormik.values.searchKeyword : undefined,
      startMonth: formatYyyyMm(pageFormik.values.settlementMonth),
      endMonth: formatYyyyMm(pageFormik.values.settlementMonth),
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(response.content);
    setTotalPages(response.totalPages);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  return (
    <>
      <Stack
        alignItems='center'
        sx={{
          width: '100%',
        }}
      >
        <Stack direction='row' alignItems='center' gap='10px'>
          <IconButton
            onClick={async () => {
              const prevMonth = new Date(pageFormik.values.settlementMonth);
              prevMonth.setMonth(prevMonth.getMonth() - 1);
              await pageFormik.setFieldValue('settlementMonth', formatYyyyMm(prevMonth));
              pageFormik.submitForm();
            }}
          >
            <KeyboardArrowLeft />
          </IconButton>
          <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
            {formatYyyy년Mm월(pageFormik.values.settlementMonth)}
          </Typography>
          <IconButton
            onClick={async () => {
              const nextMonth = new Date(pageFormik.values.settlementMonth);
              nextMonth.setMonth(nextMonth.getMonth() + 1);
              await pageFormik.setFieldValue('settlementMonth', formatYyyyMm(nextMonth));
              pageFormik.submitForm();
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
          onSubmit={pageFormik.handleSubmit}
          sx={{
            marginTop: '40px',
          }}
        >
          <FormControl sx={{ width: '320px' }}>
            <Select value={pageFormik.values.searchType} onChange={pageFormik.handleChange}>
              <MenuItem value='companyName'>제약사명</MenuItem>
              <MenuItem value='dealerName'>딜러명</MenuItem>
            </Select>
          </FormControl>
          <TextField
            name='searchKeyword'
            value={pageFormik.values.searchKeyword}
            onChange={pageFormik.handleChange}
            placeholder='제약사명을 검색하세요.'
            sx={{
              width: '478px',
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <button type='submit' hidden />
        </Stack>
        <Stack direction='row' alignItems='flex-start' gap='24px' sx={{ width: '100%', marginTop: '10px' }}>
          <Stack alignItems='center' sx={{ width: '600px' }}>
            <Stack
              direction='row'
              alignItems='center'
              sx={{
                width: '100%',
                height: '40px',
                marginTop: '40px',
              }}
            >
              <Typography variant='mediumTextR' sx={{ color: colors.navy }}>
                합계금액 : {page.reduce((acc, v) => acc + v.totalAmount, 0).toLocaleString()}
              </Typography>
              <MedipandaButton
                variant='contained'
                size='small'
                color='secondary'
                sx={{
                  marginLeft: 'auto',
                }}
              >
                파일다운로드
              </MedipandaButton>
            </Stack>
            <Table sx={{ marginTop: '10px' }}>
              <TableHead>
                <MedipandaTableRow>
                  <MedipandaTableCell sx={{ width: '120px' }}>제약사명</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '60px' }}>딜러명</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '90px' }}>공급가액</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '80px' }}>세액</MedipandaTableCell>
                  <MedipandaTableCell sx={{ width: '90px' }}>합계금액</MedipandaTableCell>
                </MedipandaTableRow>
              </TableHead>
              <TableBody>
                {page.map(settlement => (
                  <MedipandaTableRow key={settlement.id}>
                    <MedipandaTableCell>{settlement.drugCompanyName}</MedipandaTableCell>
                    <MedipandaTableCell>
                      <Button
                        variant='text'
                        sx={{
                          textDecoration: 'underline',
                          color: colors.vividViolet,
                          '&:hover': {
                            textDecoration: 'underline',
                          },
                        }}
                      >
                        {settlement.dealerName}
                      </Button>
                    </MedipandaTableCell>
                    <MedipandaTableCell>{settlement.supplyAmount.toLocaleString()}</MedipandaTableCell>
                    <MedipandaTableCell>{settlement.taxAmount.toLocaleString()}</MedipandaTableCell>
                    <MedipandaTableCell>{settlement.totalAmount.toLocaleString()}</MedipandaTableCell>
                  </MedipandaTableRow>
                ))}
              </TableBody>
            </Table>
            <MedipandaPagination
              count={totalPages}
              page={pageFormik.values.pageIndex + 1}
              showFirstButton
              showLastButton
              onChange={(_, page) => {
                pageFormik.setFieldValue('pageIndex', page - 1);
              }}
              sx={{ marginTop: '40px' }}
            />
          </Stack>
          <Stack
            sx={{
              width: '600px',
            }}
          >
            <Stack
              direction='row'
              alignItems='center'
              gap='10px'
              sx={{
                width: '100%',
                marginTop: '40px',
              }}
            >
              <MedipandaButton
                variant='outlined'
                rounded
                sx={{
                  width: '120px',
                  marginLeft: 'auto',
                }}
              >
                정산신청
              </MedipandaButton>
              <MedipandaButton
                variant='outlined'
                rounded
                sx={{
                  width: '120px',
                  borderRadius: '30px',
                }}
              >
                이의신청
              </MedipandaButton>
            </Stack>
            <SettlementDetailForm id={1} />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}

function SettlementDetailForm({ id }: { id: number | null }) {
  const [detail, setDetail] = useState<SettlementResponse | null>(null);

  const fetchDetail = async (id: number) => {
    const response = await getSettlement(id);

    setDetail(response);
  };

  const [page, setPage] = useState<SettlementPartnerResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const pageFormik = useFormik({
    initialValues: {
      searchKeyword: '',
      pageIndex: 0,
      pageSize: 10,
      totalPages: 1,
    },
    onSubmit: async () => {
      if (pageFormik.values.pageIndex !== 0) {
        await pageFormik.setFieldValue('pageIndex', 0);
      } else if (id !== null) {
        await fetchPage(id);
      }
    },
  });

  const fetchPage = async (id: number) => {
    const response = await getSettlementPartnerSummary({
      settlementId: id,
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(response.content);
    setTotalPages(response.totalPages);
  };

  useEffect(() => {
    if (id === null) {
      return;
    }

    fetchDetail(id);
    pageFormik.submitForm();
  }, [id]);

  const table = useReactTable({
    data: page,
    columns: [
      {
        header: '거래처명',
        cell: ({ row }) => (
          <Button
            variant='text'
            sx={{
              textDecoration: 'underline',
              color: colors.vividViolet,
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {row.original.companyName}
          </Button>
        ),
      },
      {
        header: '처방수수료금액',
        cell: ({ row }) => row.original.supplyAmount.toLocaleString(),
      },
      {
        header: '기타수수료금액',
        cell: ({ row }) => row.original.taxAmount.toLocaleString(),
      },
      {
        header: '정산금액',
        cell: ({ row }) => row.original.totalAmount.toLocaleString(),
      },
    ],
    getCoreRowModel: getCoreRowModel(),
  });

  if (id === null) {
    return (
      <Stack
        alignItems='center'
        sx={{
          paddingY: '40px',
          marginTop: '10px',
          border: `1px solid ${colors.gray30}`,
          boxSizing: 'border-box',
        }}
      >
        <Typography variant='largeTextM' sx={{ color: colors.gray80 }}>
          내역을 확인하실 딜러를 선택해주세요.
        </Typography>
      </Stack>
    );
  }

  if (!detail) {
    return <FixedLoader />;
  }

  return (
    <Stack
      alignItems='center'
      sx={{
        paddingY: '40px',
        marginTop: '10px',
        border: `1px solid ${colors.gray30}`,
        boxSizing: 'border-box',
      }}
    >
      <Typography variant='heading2B' sx={{ color: colors.gray80 }}>
        정산내역 상세
      </Typography>
      <Stack
        direction='row'
        sx={{
          marginTop: '20px',
        }}
      >
        <Typography variant='mediumTextB' sx={{ color: colors.gray80, width: '160px' }}>
          제약사명: {detail.drugCompanyName}
        </Typography>
        <Typography variant='mediumTextB' sx={{ color: colors.gray80, width: '160px' }}>
          딜러명: {detail.dealerName}
        </Typography>
        <Typography variant='mediumTextB' sx={{ color: colors.gray80, width: '160px' }}>
          처방금액 : {detail.prescriptionAmount.toLocaleString()}
        </Typography>
      </Stack>
      <Stack direction='row'>
        <Typography variant='mediumTextB' sx={{ color: colors.gray80, width: '160px' }}>
          공급가액 : {detail.supplyAmount.toLocaleString()}
        </Typography>
        <Typography variant='mediumTextB' sx={{ color: colors.gray80, width: '160px' }}>
          세액 : {detail.taxAmount.toLocaleString()}
        </Typography>
        <Typography variant='mediumTextB' sx={{ color: colors.gray80, width: '160px' }}>
          합계금액 : {detail.totalAmount.toLocaleString()}
        </Typography>
      </Stack>
      <Stack
        direction='row'
        alignItems='center'
        sx={{
          width: '100%',
          padding: '16px 30px',
          marginTop: '10px',
          boxSizing: 'border-box',
        }}
      >
        <Typography variant='mediumTextR' sx={{ color: colors.navy }}>
          합계금액 : {detail.totalAmount.toLocaleString()}
        </Typography>
        <Typography variant='mediumTextR' sx={{ color: colors.navy, marginLeft: 'auto' }}>
          정렬기준:{' '}
        </Typography>
        <FormControl sx={{ marginLeft: '10px' }}>
          <Select size='small' value={'정산금액 높은순'}>
            <MenuItem value={'정산금액 높은순'}>정산금액 높은순</MenuItem>
            <MenuItem value={'정산금액 낮은순'}>정산금액 낮은순</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <MedipandaTable table={table} sx={{ marginTop: '10px' }} />

      <MedipandaPagination
        count={totalPages}
        page={pageFormik.values.pageIndex + 1}
        showFirstButton
        showLastButton
        onChange={(_, page) => {
          pageFormik.setFieldValue('pageIndex', page - 1);
        }}
        sx={{ marginTop: '40px' }}
      />
    </Stack>
  );
}
