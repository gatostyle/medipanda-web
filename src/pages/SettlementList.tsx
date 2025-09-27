import {
  DateString,
  getDownloadSettlementListExcel,
  getSettlement,
  getSettlementPartnerSummary,
  getSettlements,
  notifyAdminForObjections,
  notifyAdminForSettlements,
  SettlementPartnerOrder,
  SettlementPartnerOrderLabel,
  type SettlementPartnerResponse,
  type SettlementResponse,
} from '@/backend';
import { MedipandaButton } from '@/custom/components/MedipandaButton';
import { MedipandaDialog, MedipandaDialogContent, MedipandaDialogTitle } from '@/custom/components/MedipandaDialog';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { MedipandaTable, MedipandaTableCell, MedipandaTableRow } from '@/custom/components/MedipandaTable';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { setUrlParams } from '@/lib/utils/url';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { colors } from '@/themes';
import { formatYyyyMm, formatYyyy년Mm월, SafeDate } from '@/lib/utils/dateFormat';
import { KeyboardArrowLeft, KeyboardArrowRight, Search } from '@mui/icons-material';
import {
  Button,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  PaginationItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useMemo, useState } from 'react';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';

export default function SettlementList() {
  const navigate = useNavigate();

  const [contents, setContents] = useState<Sequenced<SettlementResponse>[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const initialSearchParams = {
    searchType: 'companyName' as 'dealerName' | 'dealerId' | 'drugCompanyName' | 'companyName',
    searchKeyword: '',
    settlementMonth: formatYyyyMm(new Date()),
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    settlementMonth: paramSettlementMonth,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
  const settlementMonth = useMemo(() => SafeDate(paramSettlementMonth) ?? new Date(formatYyyyMm(new Date())), [paramSettlementMonth]);
  const page = Number(paramPage);
  const pageSize = 10;

  const form = useForm({
    defaultValues: {
      ...initialSearchParams,
      settlementMonth: null as Date | null,
    },
  });

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async values => {
    if (values.searchType === 'dealerId' && values.searchKeyword !== '' && Number.isNaN(Number(values.searchKeyword))) {
      await alert('딜러번호는 숫자만 입력할 수 있습니다.');
      return;
    }

    const url = setUrlParams(
      {
        ...values,
        settlementMonth: values.settlementMonth !== null ? formatYyyyMm(values.settlementMonth) : undefined,
        page: 1,
      },
      initialSearchParams,
    );

    navigate(url);
  };

  const fetchContents = async () => {
    try {
      const response = await getSettlements({
        [searchType]: searchKeyword,
        startMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
        endMonth: settlementMonth ? new DateString(settlementMonth) : undefined,
        page: page - 1,
        size: pageSize,
      });

      setContents(withSequence(response).content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch settlement list:', error);
      alert('정산내역 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    form.setValue('searchType', searchType);
    form.setValue('searchKeyword', searchKeyword);
    form.setValue('settlementMonth', settlementMonth);
    fetchContents();
  }, [searchType, searchKeyword, settlementMonth, page]);

  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [settlementRequestModalOpen, setSettlementRequestModalOpen] = useState(false);

  const handleSettlement = () => {
    if (selectedId === null) {
      alert('정산신청할 딜러를 선택해주세요.');
      return;
    }

    setSettlementRequestModalOpen(true);
  };

  const handleObjection = async () => {
    if (selectedId === null) {
      alert('이의신청할 딜러를 선택해주세요.');
      return;
    }

    try {
      await notifyAdminForObjections({
        settlementIds: [selectedId],
      });
      alert('이의신청이 접수되었습니다.');
    } catch (error) {
      console.error('Failed to submit objection:', error);
      alert('이의신청 중 오류가 발생했습니다.');
    }
  };

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
            form.setValue('settlementMonth', new Date(formatYyyyMm(prevMonth)));
            form.handleSubmit(submitHandler)();
          }}
        >
          <KeyboardArrowLeft />
        </IconButton>
        <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
          {formatYyyy년Mm월(settlementMonth)}
        </Typography>
        <IconButton
          onClick={() => {
            const nextMonth = new Date(settlementMonth);
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            form.setValue('settlementMonth', new Date(formatYyyyMm(nextMonth)));
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
          <Controller
            control={form.control}
            name='searchType'
            render={({ field }) => (
              <Select {...field}>
                <MenuItem value='companyName'>제약사명</MenuItem>
                <MenuItem value='dealerName'>딜러명</MenuItem>
              </Select>
            )}
          />
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
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />
        <button type='submit' hidden />
      </Stack>
      <Stack direction='row' alignItems='flex-start' gap='24px' sx={{ marginTop: '10px' }}>
        <Stack sx={{ width: '600px' }}>
          <Stack
            direction='row'
            alignItems='center'
            sx={{
              height: '40px',
              marginTop: '40px',
            }}
          >
            <Typography variant='mediumTextR' sx={{ color: colors.navy }}>
              합계금액 : {contents.reduce((acc, v) => acc + v.totalAmount, 0).toLocaleString()}
            </Typography>
            <MedipandaButton
              variant='contained'
              size='small'
              color='secondary'
              component={RouterLink}
              to={getDownloadSettlementListExcel({
                companyName: searchType === 'companyName' ? searchKeyword : undefined,
                dealerName: searchType === 'dealerName' ? searchKeyword : undefined,
                startMonth: new DateString(settlementMonth),
                endMonth: new DateString(settlementMonth),
                size: 2 ** 31 - 1,
              })}
              target='_blank'
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
              {contents.map(settlement => (
                <MedipandaTableRow
                  key={settlement.id}
                  onClick={() => setSelectedId(settlement.id)}
                  sx={{
                    cursor: 'pointer',
                  }}
                >
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
              onClick={handleSettlement}
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
              onClick={handleObjection}
            >
              이의신청
            </MedipandaButton>
          </Stack>
          <Stack
            sx={{
              paddingY: '40px',
              marginTop: '10px',
              border: `1px solid ${colors.gray30}`,
              boxSizing: 'border-box',
            }}
          >
            <SettlementDetailForm settlementId={selectedId} />
          </Stack>
        </Stack>
      </Stack>

      {settlementRequestModalOpen && (
        <SettlementRequestModal
          open={true}
          settlement={contents.find(s => s.id === selectedId)!}
          onClose={() => setSettlementRequestModalOpen(false)}
        />
      )}
    </>
  );
}

function SettlementDetailForm({ settlementId }: { settlementId: number | null }) {
  const [detail, setDetail] = useState<SettlementResponse | null>(null);

  const [contents, setContents] = useState<SettlementPartnerResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const [submitFormValues, setSubmitFormValues] = useState({
    sortOrder: SettlementPartnerOrder.TOTAL_AMOUNT_DESC as keyof typeof SettlementPartnerOrder,
    page: 1,
  });
  const pageSize = 10;

  const fetchContents = async (settlementId: number) => {
    try {
      const response = await getSettlementPartnerSummary({
        settlementId: settlementId,
        settlementPartnerOrder: submitFormValues.sortOrder,
        page: submitFormValues.page - 1,
        size: pageSize,
      });

      setContents(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch settlement partner summary:', error);
      alert('정산내역 상세 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    if (settlementId === null) {
      return;
    }

    fetchContents(settlementId);
  }, [submitFormValues.sortOrder, submitFormValues.page]);

  useEffect(() => {
    if (settlementId === null) {
      return;
    }

    fetchDetail(settlementId);
  }, [settlementId]);

  const fetchDetail = async (id: number) => {
    const response = await getSettlement(id);

    setDetail(response);

    if (submitFormValues.sortOrder === SettlementPartnerOrder.TOTAL_AMOUNT_DESC && submitFormValues.page === 1) {
      fetchContents(id);
    } else {
      setSubmitFormValues({
        sortOrder: SettlementPartnerOrder.TOTAL_AMOUNT_DESC,
        page: 1,
      });
    }
  };

  const table = useReactTable({
    data: contents,
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

  if (settlementId === null) {
    return (
      <Typography variant='largeTextM' sx={{ alignSelf: 'center', color: colors.gray80 }}>
        내역을 확인하실 딜러를 선택해주세요.
      </Typography>
    );
  }

  if (!detail) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <Typography variant='heading2B' sx={{ alignSelf: 'center', color: colors.gray80 }}>
        정산내역 상세
      </Typography>
      <Stack
        direction='row'
        sx={{
          padding: '0 30px',
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
      <Stack
        direction='row'
        sx={{
          padding: '0 30px',
        }}
      >
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
          padding: '16px 30px',
          marginTop: '10px',
        }}
      >
        <Typography variant='mediumTextR' sx={{ color: colors.navy }}>
          합계금액 : {detail.totalAmount.toLocaleString()}
        </Typography>
        <Typography variant='mediumTextR' sx={{ color: colors.navy, marginLeft: 'auto' }}>
          정렬기준:
        </Typography>
        <FormControl sx={{ marginLeft: '10px' }}>
          <Select
            size='small'
            value={submitFormValues.sortOrder}
            onChange={e => setSubmitFormValues(v => ({ ...v, sortOrder: e.target.value as keyof typeof SettlementPartnerOrder, page: 1 }))}
          >
            {Object.keys(SettlementPartnerOrderLabel).map(key => (
              <MenuItem key={key} value={key}>
                {SettlementPartnerOrderLabel[key]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <MedipandaTable table={table} sx={{ marginTop: '10px' }} />

      <MedipandaPagination
        count={totalPages}
        page={submitFormValues.page}
        showFirstButton
        showLastButton
        onChange={(_, page) => setSubmitFormValues(v => ({ ...v, page }))}
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      />
    </>
  );
}

function SettlementRequestModal({ open, onClose, settlement }: { open?: boolean; onClose?: () => void; settlement: SettlementResponse }) {
  const handleSettlementRequest = async () => {
    try {
      await notifyAdminForSettlements({
        settlementIds: [settlement.id],
      });
      alert('정산신청이 접수되었습니다.');
      onClose?.();
    } catch (error) {
      console.error('Failed to submit settlement:', error);
      alert('정산신청 중 오류가 발생했습니다.');
    }
  };

  if (!open) {
    return null;
  }

  return (
    <MedipandaDialog open onClose={onClose} width='400px'>
      <MedipandaDialogTitle title={'정산요청'} onClose={onClose} />
      <MedipandaDialogContent>
        <Stack>
          <Typography variant='largeTextR' sx={{ color: colors.gray80 }}>
            해당 승인금액으로 정산 하시겠습니까?
          </Typography>
          <Table sx={{ marginY: '20px' }}>
            <TableBody>
              <TableRow>
                <TableCell sx={{ width: '110px' }}>처방금액:</TableCell>
                <TableCell>{settlement.prescriptionAmount.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>공급가액:</TableCell>
                <TableCell>{settlement.supplyAmount.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>세액:</TableCell>
                <TableCell>{settlement.taxAmount.toLocaleString()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>합계금액:</TableCell>
                <TableCell>{settlement.totalAmount.toLocaleString()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <Typography variant='largeTextR' sx={{ color: colors.red }}>
            &apos;정산요청&apos; 미 선택 시 정산이 불가합니다.
          </Typography>
          <Stack direction='row' sx={{ gap: '10px', marginTop: '40px' }}>
            <MedipandaButton variant='outlined' size='large' sx={{ flex: 1 }} onClick={onClose}>
              닫기
            </MedipandaButton>
            <MedipandaButton variant='contained' size='large' sx={{ flex: 1 }} onClick={handleSettlementRequest}>
              정산요청
            </MedipandaButton>
          </Stack>
        </Stack>
      </MedipandaDialogContent>
    </MedipandaDialog>
  );
}
