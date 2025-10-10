import {
  DateString,
  getDownloadSettlementListExcel,
  getSettlementPartnerProducts,
  getSettlementPartnerSummary,
  getSettlements,
  notifyAdminForObjections,
  notifyAdminForSettlements,
  SettlementPartnerOrder,
  SettlementPartnerOrderLabel,
  SettlementPartnerProductOrder,
  SettlementPartnerProductOrderLabel,
  type SettlementPartnerProductResponse,
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
import { DateUtils, DATEFORMAT_YYYY년_MM월, DATEFORMAT_YYYY_MM } from '@/lib/utils/dateFormat';
import { PercentUtils } from '@/utils/PercentUtils';
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
import { format } from 'date-fns';
import { Fragment, useEffect, useMemo, useState } from 'react';
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
    settlementMonth: format(new Date(), DATEFORMAT_YYYY_MM),
    page: '1',
  };

  const {
    searchType,
    searchKeyword,
    settlementMonth: paramSettlementMonth,
    page: paramPage,
  } = useSearchParamsOrDefault(initialSearchParams);
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
    if (values.searchType === 'dealerId' && values.searchKeyword !== '' && Number.isNaN(Number(values.searchKeyword))) {
      await alert('딜러번호는 숫자만 입력할 수 있습니다.');
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
            form.setValue('settlementMonth', new Date(format(prevMonth, DATEFORMAT_YYYY_MM)));
            form.handleSubmit(submitHandler)();
          }}
        >
          <KeyboardArrowLeft />
        </IconButton>
        <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
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
            <SettlementDetailForm settlement={contents.find(s => s.id === selectedId) ?? null} />
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

function SettlementDetailForm({ settlement }: { settlement: SettlementResponse | null }) {
  const [contents, setContents] = useState<SettlementPartnerResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedSettlementPartnerResponse, setSelectedSettlementPartnerResponse] = useState<SettlementPartnerResponse | null>(null);

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
    if (settlement === null) {
      return;
    }

    fetchContents(settlement.id);
  }, [settlement, submitFormValues.sortOrder, submitFormValues.page]);

  const table = useReactTable({
    data: contents,
    columns: [
      {
        header: '거래처명',
        cell: ({ row }) => (
          <Button
            variant='text'
            onClick={() => setSelectedSettlementPartnerResponse(row.original)}
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

  if (settlement === null) {
    return (
      <Typography variant='largeTextM' sx={{ alignSelf: 'center', color: colors.gray80 }}>
        내역을 확인하실 딜러를 선택해주세요.
      </Typography>
    );
  }

  if (!settlement) {
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
          제약사명: {settlement.drugCompanyName}
        </Typography>
        <Typography variant='mediumTextB' sx={{ color: colors.gray80, width: '160px' }}>
          딜러명: {settlement.dealerName}
        </Typography>
        <Typography variant='mediumTextB' sx={{ color: colors.gray80, width: '160px' }}>
          처방금액 : {settlement.prescriptionAmount.toLocaleString()}
        </Typography>
      </Stack>
      <Stack
        direction='row'
        sx={{
          padding: '0 30px',
        }}
      >
        <Typography variant='mediumTextB' sx={{ color: colors.gray80, width: '160px' }}>
          공급가액 : {settlement.supplyAmount.toLocaleString()}
        </Typography>
        <Typography variant='mediumTextB' sx={{ color: colors.gray80, width: '160px' }}>
          세액 : {settlement.taxAmount.toLocaleString()}
        </Typography>
        <Typography variant='mediumTextB' sx={{ color: colors.gray80, width: '160px' }}>
          합계금액 : {settlement.totalAmount.toLocaleString()}
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
          합계금액 : {settlement.totalAmount.toLocaleString()}
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

      {selectedSettlementPartnerResponse !== null && (
        <SettlementDetailDialog
          open={true}
          onClose={() => setSelectedSettlementPartnerResponse(null)}
          settlement={settlement}
          settlementPartnerResponse={selectedSettlementPartnerResponse}
        />
      )}
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

function SettlementDetailDialog({
  open,
  onClose,
  settlement,
  settlementPartnerResponse: detail,
}: {
  open?: boolean;
  onClose?: () => void;
  settlement: SettlementResponse;
  settlementPartnerResponse: SettlementPartnerResponse;
}) {
  const [products, setProducts] = useState<SettlementPartnerProductResponse[]>([]);

  useEffect(() => {
    if (detail.settlementPartnerId === null) {
      return;
    }

    fetchProducts(detail.settlementPartnerId);
  }, [detail.settlementPartnerId]);

  const fetchProducts = async (settlementPartnerId: number) => {
    const products = await getSettlementPartnerProducts(settlementPartnerId);

    setProducts(products);
  };

  const form = useForm({
    defaultValues: {
      sortOrder: SettlementPartnerProductOrder.PRESCRIPTION_AMOUNT_ASC as keyof typeof SettlementPartnerProductOrder,
    },
  });
  const formSortOrder = form.watch('sortOrder');

  if (!open) {
    return null;
  }

  if (!detail) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <MedipandaDialog open onClose={onClose} width='1000px'>
        <MedipandaDialogTitle title='정산승인내역 상세(거래처별 제품)' onClose={onClose} />
        <Stack>
          <table style={{ margin: '40px 30px' }}>
            <tr style={{ height: '39px' }}>
              <td style={{ width: '100px' }}>제약사명:</td>
              <td style={{ width: '320px' }}>{settlement.drugCompanyName}</td>
              <td style={{ width: '100px' }}>딜러명:</td>
              <td style={{ width: '320px' }}>{settlement.dealerName}</td>
              <td style={{ width: '100px' }} />
              <td style={{ width: '320px' }} />
            </tr>
            <tr style={{ height: '39px' }}>
              <td>거래처명:</td>
              <td>{detail.institutionName}</td>
              <td>처방처코드:</td>
              <td>{detail.institutionCode}</td>
              <td>사업자등록번호</td>
              <td>{detail.businessNumber}</td>
            </tr>
            <tr style={{ height: '39px' }}>
              <td>정산월:</td>
              <td>{DateUtils.parseUtcAndFormatKst(settlement.settlementMonth, DATEFORMAT_YYYY_MM)}</td>
              <td>처방금액:</td>
              <td>{settlement.prescriptionAmount.toLocaleString()}</td>
              <td>정산(합계)금액:</td>
              <td>{settlement.totalAmount.toLocaleString()}</td>
            </tr>
          </table>
          <Stack direction='row' sx={{ alignItems: 'center' }}>
            <Typography
              variant='mediumTextR'
              sx={{
                color: colors.navy,
                marginLeft: 'auto',
              }}
            >
              정렬기준:
            </Typography>
            <FormControl
              sx={{
                marginLeft: '10px',
                marginRight: '30px',
              }}
            >
              <Controller
                control={form.control}
                name={'sortOrder'}
                render={({ field }) => (
                  <Select
                    {...field}
                    size='small'
                    sx={{
                      width: '200px',
                    }}
                  >
                    {Object.keys(SettlementPartnerProductOrderLabel).map(key => (
                      <MenuItem key={key} value={key}>
                        {SettlementPartnerProductOrderLabel[key]}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
            </FormControl>
          </Stack>
          <Table
            sx={{
              marginTop: '10px',
              marginBottom: '40px',
            }}
          >
            <TableHead>
              <MedipandaTableRow>
                <MedipandaTableCell>제품명</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '80px' }}>수량</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '80px' }}>약가</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '150px' }}>처방금액</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '90px' }}>기본수수료율</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '150px' }}>수수료금액</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '90px' }}>기타수수료율</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '150px' }}>기타수수료금액</MedipandaTableCell>
                <MedipandaTableCell sx={{ width: '150px' }}>비고</MedipandaTableCell>
              </MedipandaTableRow>
            </TableHead>
            <TableBody>
              {products
                .sort((a, b) => {
                  switch (formSortOrder) {
                    case SettlementPartnerProductOrder.PRESCRIPTION_AMOUNT_ASC:
                      return (a.prescriptionAmount ?? 0) - (b.prescriptionAmount ?? 0);
                    case SettlementPartnerProductOrder.PRESCRIPTION_AMOUNT_DESC:
                      return (b.prescriptionAmount ?? 0) - (a.prescriptionAmount ?? 0);
                    case SettlementPartnerProductOrder.FEE_AMOUNT_ASC:
                      return (a.feeAmount ?? 0) - (b.feeAmount ?? 0);
                    case SettlementPartnerProductOrder.PRODUCT_NAME_ASC:
                      return (a.productName ?? '').localeCompare(b.productName ?? '');
                  }
                })
                .map(product => (
                  <Fragment key={product.id}>
                    <MedipandaTableRow sx={{ borderBottomWidth: '0 !important' }}>
                      <MedipandaTableCell align='center'>
                        <Typography sx={{ fontWeight: 500 }}>{product.productName}</Typography>
                      </MedipandaTableCell>
                      <MedipandaTableCell align='center'>
                        <Typography sx={{ fontWeight: 500 }}>{product.quantity?.toLocaleString() ?? '-'}</Typography>
                      </MedipandaTableCell>
                      <MedipandaTableCell align='center'>
                        <Typography sx={{ fontWeight: 500 }}>{product.unitPrice?.toLocaleString() ?? '-'}</Typography>
                      </MedipandaTableCell>
                      <MedipandaTableCell align='center'>
                        <Typography sx={{ fontWeight: 500 }}>{product.prescriptionAmount?.toLocaleString() ?? '-'}</Typography>
                      </MedipandaTableCell>
                      <MedipandaTableCell align='center'>
                        <Typography sx={{ fontWeight: 500 }}>
                          {product.feeRate !== null ? `${PercentUtils.decimalToPercent(product.feeRate)}%` : '-'}
                        </Typography>
                      </MedipandaTableCell>
                      <MedipandaTableCell align='center'>
                        <Typography sx={{ fontWeight: 500 }}>{product.feeAmount?.toLocaleString() ?? '-'}</Typography>
                      </MedipandaTableCell>
                      <MedipandaTableCell align='center'>
                        <Typography sx={{ fontWeight: 500 }}>
                          {product.extraFeeRate !== null ? `${PercentUtils.decimalToPercent(product.extraFeeRate)}%` : '-'}
                        </Typography>
                      </MedipandaTableCell>
                      <MedipandaTableCell align='center'>
                        <Typography sx={{ fontWeight: 500 }}>{product.extraFeeAmount?.toLocaleString() ?? '-'}</Typography>
                      </MedipandaTableCell>
                      <MedipandaTableCell align='center'>
                        <Typography sx={{ fontWeight: 500 }}>{product.note ?? '-'}</Typography>
                      </MedipandaTableCell>
                    </MedipandaTableRow>
                  </Fragment>
                ))}
            </TableBody>
          </Table>
        </Stack>
      </MedipandaDialog>
    </>
  );
}
