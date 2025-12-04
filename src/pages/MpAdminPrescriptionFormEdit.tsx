import { MpPartnerProductSelectModal } from '@/components/MpPartnerProductSelectModal';
import { normalizeBusinessNumber, normalizeLocaleNumber } from '@/lib/utils/form';
import { useMpModal } from '@/hooks/useMpModal';
import { PercentUtils } from '@/utils/PercentUtils';
import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
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
import { Add, SearchNormal1 } from 'iconsax-reactjs';
import {
  type AttachmentResponse,
  getAttachedEdiFiles,
  getPartnerProducts,
  getPrescriptionPartner,
  getProductDetailsByCode,
  type OcrOriginalItem,
  type OcrResponse,
  type PartnerResponse,
  type PrescriptionPartnerResponse,
  type ProductSummaryResponse,
  upsertPatchPartnerProducts,
} from '@/backend';
import { MpChangeHistoryModal } from '@/components/MpChangeHistoryModal';
import { MpOcrRequestModal } from '@/components/MpOcrRequestModal';
import { MpPartnerSelectModal } from '@/components/MpPartnerSelectModal';
import { type Sequenced } from '@/lib/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { RequiredDeep } from 'type-fest';
import { DATEFORMAT_YYYY_MM, DateUtils } from '@/lib/utils/dateFormat';

interface CustomPartnerProducts {
  id: number | null;
  productCode: string;
  productName: string;
  unit: string;
  quantity: string;
  unitPrice: string;
  totalPrice: string;
  baseFeeRate: string;
  feeAmount: string;
  note: string | null;
  ocrItem: OcrOriginalItem | null;
}

interface Disposable {
  dispose: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function listenerToDisposable(listener: any, target: EventTarget): Disposable {
  return {
    dispose: () => target.removeEventListener('message', listener),
  };
}

function intervalToDisposable(intervalId: ReturnType<typeof setInterval>): Disposable {
  return {
    dispose: () => clearInterval(intervalId),
  };
}

export default function MpAdminPrescriptionFormEdit() {
  const { prescriptionPartnerId: paramPrescriptionPartnerId } = useParams();
  const isNew = paramPrescriptionPartnerId === undefined;
  const prescriptionPartnerId = Number(paramPrescriptionPartnerId);

  const { enqueueSnackbar } = useSnackbar();
  const [changeHistoryModalOpen, setChangeHistoryModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ocrRequestModalOpen, setOcrRequestModalOpen] = useState(false);
  const [partnerSelectModalOpen, setPartnerSelectModalOpen] = useState(false);
  const [partnerProductSelectModalOpen, setPartnerProductSelectModalOpen] = useState(false);
  const [currentProductItemIndex, setCurrentProductItemIndex] = useState<number>(0);

  const { alert, alertError } = useMpModal();

  const [prescriptionPartner, setPrescriptionPartner] = useState<PrescriptionPartnerResponse | null>(null);
  const [partnerProducts, setPartnerProducts] = useState<Sequenced<CustomPartnerProducts>[]>([]);
  const [deletePartnerProductIds, setDeletePartnerProductIds] = useState<number[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentResponse[]>([]);

  const [sendOcrReport, setSendOcrReport] = useState(false);
  const [ocrReportContent, setOcrReportContent] = useState('');
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const [currentPopup, setCurrentPopup] = useState<Window | null>(null);
  const currentPopupInitialized = useRef(false);

  const form = useForm({
    defaultValues: {
      drugCompany: '',
      drugCompanyCode: '',
      companyName: '',
      institutionName: '',
      institutionCode: '',
      businessNumber: '',
      dealerName: '',
      prescriptionMonth: null as Date | null,
      settlementMonth: null as Date | null,
      prescriptionAmount: '',
    },
  });
  const formDrugCompany = form.watch('drugCompany');
  const formDrugCompanyCode = form.watch('drugCompanyCode');
  const formInstitutionCode = form.watch('institutionCode');
  const formCompanyName = form.watch('companyName');
  const formBusinessNumber = form.watch('businessNumber');
  const formDealerName = form.watch('dealerName');
  const formPrescriptionMonth = form.watch('prescriptionMonth');
  const formPrescriptionAmount = form.watch('prescriptionAmount');

  const submitHandler: SubmitHandler<RequiredDeep<(typeof form)['control']['_defaultValues']>> = async () => {
    if (partnerProducts.some(p => p.productName === '')) {
      await alert('제품명이 입력되지 않은 항목이 있습니다.');
      return;
    }

    if (partnerProducts.some(p => p.unit === '')) {
      await alert('단위가 입력되지 않은 항목이 있습니다.');
      return;
    }

    if (partnerProducts.some(p => p.quantity === '')) {
      await alert('수량이 입력되지 않은 항목이 있습니다.');
      return;
    }

    try {
      await upsertPatchPartnerProducts(prescriptionPartnerId, {
        items: partnerProducts.map(product => ({
          id: product.id,
          productCode: product.productCode,
          unit: product.unit,
          quantity: Number(product.quantity.replace(/,/g, '')),
          unitPrice: Number(product.unitPrice.replace(/,/g, '')),
          totalPrice: Number(product.totalPrice.replace(/,/g, '')),
          baseFeeRate: PercentUtils.percentStringToDecimal(product.baseFeeRate),
          feeAmount: Number(product.feeAmount.replace(/,/g, '')),
          note: product.note,
          ocrItem: product.ocrItem ?? null,
        })),
        deletedPrescriptionPartnerProductIds: deletePartnerProductIds,
      });

      await alert('거래처별 제품 목록이 저장되었습니다.');
      window.history.back();
    } catch (e) {
      console.error('Failed to submit form:', e);
      await alertError('거래처별 제품상세 저장에 실패했습니다.');
    }
  };

  const handleProductChange = useCallback(
    <K extends keyof CustomPartnerProducts, T extends CustomPartnerProducts[K]>(index: number, field: K, value: T) => {
      setPartnerProducts(prev =>
        prev.map((p, i) => {
          if (index === i) {
            const updated = { ...p, [field]: value };

            if (field === 'quantity') {
              const quantity = Number(String(value).replace(/,/g, '')) || 0;
              const unitPrice = Number(p.unitPrice.replace(/,/g, '')) || 0;
              const baseFeeRate = PercentUtils.percentStringToDecimal(p.baseFeeRate) || 0;

              const totalPrice = quantity * unitPrice;
              const feeAmount = Math.floor(totalPrice * baseFeeRate);

              updated.totalPrice = normalizeLocaleNumber(String(totalPrice));
              updated.feeAmount = normalizeLocaleNumber(String(feeAmount));
            }

            return updated;
          }
          return p;
        }),
      );
    },
    [],
  );

  const handleAddProduct = () => {
    const maxSequence = Math.max(...partnerProducts.map(p => p.sequence || 0), 0);

    setPartnerProducts([
      ...partnerProducts,
      {
        sequence: maxSequence + 1,
        id: null,
        productCode: '',
        productName: '',
        unit: '',
        quantity: '0',
        unitPrice: '0',
        totalPrice: '0',
        baseFeeRate: '0',
        feeAmount: '0',
        note: '',
        ocrItem: null,
      },
    ]);
  };

  const handleDelete = () => {
    if (selectedIndexes.length === 0) {
      return;
    }

    const filteredProducts = partnerProducts.filter((_, index) => !selectedIndexes.includes(index));
    setPartnerProducts(
      filteredProducts.map((product, index) => ({
        ...product,
        sequence: index + 1,
      })),
    );

    const productsToDelete = partnerProducts.filter((product, index) => selectedIndexes.includes(index) && product.id !== null);
    setDeletePartnerProductIds(prev => [...prev, ...productsToDelete.map(p => p.id!)]);

    setSelectedIndexes([]);
  };

  const handlePartnerSearch = () => {
    setPartnerSelectModalOpen(true);
  };

  const handlePartnerSelect = (partner: PartnerResponse) => {
    form.setValue('institutionName', partner.institutionName);
    form.setValue('institutionCode', partner.institutionCode);
    form.setValue('drugCompany', partner.drugCompanyName);
    form.setValue('companyName', partner.companyName);
  };

  const handleProductSelect = async (product: ProductSummaryResponse) => {
    const currentPartnerProduct = partnerProducts[currentProductItemIndex];

    const productDetail = await getProductDetailsByCode(product.productCode, {
      month: formPrescriptionMonth ? format(formPrescriptionMonth, DATEFORMAT_YYYY_MM) : undefined,
    });

    const quantity = Number(currentPartnerProduct.quantity.replace(/,/g, '')) || 0;
    const unitPrice = productDetail.price ?? 0;
    const totalPrice = quantity * unitPrice;
    const baseFeeRate = productDetail.feeRate ?? 0;
    const feeAmount = Math.floor(totalPrice * baseFeeRate);

    setPartnerProducts([
      ...partnerProducts.slice(0, currentProductItemIndex),
      {
        ...currentPartnerProduct,
        productCode: product.productCode,
        productName: productDetail.productName ?? '',
        unit: productDetail.unit ?? '',
        unitPrice: normalizeLocaleNumber(String(unitPrice)),
        totalPrice: normalizeLocaleNumber(String(totalPrice)),
        baseFeeRate: PercentUtils.formatDecimal(baseFeeRate),
        feeAmount: normalizeLocaleNumber(String(feeAmount)),
      },
      ...partnerProducts.slice(currentProductItemIndex + 1),
    ]);
  };

  const handleEdiFileView = async () => {
    const id = (Math.random() * 1000000).toFixed();

    currentPopupInitialized.current = false;
    const popup = window.open(new URL(`/edi-scanner.html?id=${id}`, window.location.href).href, '_blank');

    if (popup === null) {
      await alertError('팝업이 차단되었습니다. 팝업 차단을 해제한 후 다시 시도해주세요.');
      return;
    }

    setCurrentPopup(popup);
  };

  const handleOcrSubmit = async (response: OcrResponse[]) => {
    if (response.length === 0) {
      await alert('OCR 결과가 없습니다. 거래선에 등록된 제약사가 EDI 내용에 포함되어 있는지 확인하세요.');
      return;
    }

    const maxSequence = Math.max(...partnerProducts.map(p => p.sequence), 0);

    setPartnerProducts([
      ...partnerProducts,
      ...(await Promise.all(
        response.map(async (ocrItem, index) => {
          const productDetail = await getProductDetailsByCode(ocrItem.code, {
            month: format(formPrescriptionMonth!, DATEFORMAT_YYYY_MM)
          });

          const productCode = ocrItem.code;
          const productName = productDetail.productName ?? '';
          const unit = productDetail.unit ?? '';
          const quantity = ocrItem.volume;
          const unitPrice = productDetail.price ?? 0;
          const totalPrice = quantity * unitPrice;
          const baseFeeRate = productDetail.feeRate ?? 0;
          const feeAmount = Math.floor(totalPrice * baseFeeRate);

          return {
            sequence: maxSequence + index + 1,
            id: null,
            productCode,
            productName,
            unit,
            quantity: normalizeLocaleNumber(String(quantity)),
            unitPrice: normalizeLocaleNumber(String(unitPrice)),
            totalPrice: normalizeLocaleNumber(String(totalPrice)),
            baseFeeRate: PercentUtils.formatDecimal(baseFeeRate),
            feeAmount: normalizeLocaleNumber(String(feeAmount)),
            note: '',
            ocrItem: {
              productCode,
              productName,
              unit,
              quantity,
              unitPrice,
              totalPrice,
              baseFeeRate,
              feeAmount,
              note: '',
            },
          };
        }),
      )),
    ]);
  };

  useEffect(() => {
    if (!isNew) {
      fetchPrescriptionFormData(prescriptionPartnerId);
    }
  }, [isNew, prescriptionPartnerId]);

  const fetchPrescriptionFormData = async (prescriptionPartnerId: number) => {
    if (Number.isNaN(prescriptionPartnerId)) {
      await alertError('잘못된 접근입니다.');
      return window.history.back();
    }

    try {
      setLoading(true);
      const [formDetail, products, attachedFiles] = await Promise.all([
        getPrescriptionPartner(prescriptionPartnerId),
        getPartnerProducts(prescriptionPartnerId),
        getAttachedEdiFiles(prescriptionPartnerId),
      ]);

      setPrescriptionPartner(formDetail);

      form.reset({
        drugCompany: formDetail.drugCompany,
        drugCompanyCode: formDetail.drugCompanyCode,
        companyName: formDetail.companyName,
        institutionName: formDetail.institutionName,
        institutionCode: formDetail.institutionCode,
        businessNumber: normalizeBusinessNumber(formDetail.businessNumber),
        dealerName: formDetail.dealerName,
        prescriptionMonth: DateUtils.utcToKst(new Date(formDetail.prescriptionMonth)),
        settlementMonth: DateUtils.utcToKst(new Date(formDetail.settlementMonth)),
        prescriptionAmount: formDetail.amount.toLocaleString(),
      });

      setPartnerProducts(
        products
          .sort((a, b) => a.id - b.id)
          .map((product, index) => ({
            sequence: index + 1,
            id: product.id,
            productCode: product.productCode,
            productName: product.productName,
            unit: product.unit,
            quantity: normalizeLocaleNumber(String(product.quantity)),
            unitPrice: normalizeLocaleNumber(String(product.unitPrice)),
            totalPrice: normalizeLocaleNumber(String(product.totalPrice)),
            baseFeeRate: PercentUtils.formatDecimal(product.baseFeeRate),
            feeAmount: normalizeLocaleNumber(String(product.feeAmount)),
            note: product.note,
            ocrItem: null,
          })),
      );
      setDeletePartnerProductIds([]);

      setAttachedFiles(attachedFiles);
    } catch (error) {
      console.error('Failed to fetch prescription form data:', error);
      enqueueSnackbar('처방입력 정보를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPopup === null) {
      return;
    }

    const disposables = new Set<Disposable>();

    const globalMessageListener = (event: MessageEvent) => {
      const currentPopupId = new URLSearchParams(currentPopup.location.search).get('id');

      if (currentPopupId === null || currentPopupId === '') {
        return;
      }

      if (event.origin !== window.origin || event.data?.id !== currentPopupId) {
        return;
      }

      switch (event.data?.type) {
        case 'EDI_SCANNER_PONG': {
          if (!currentPopupInitialized.current) {
            currentPopupInitialized.current = true;
            currentPopup.postMessage(
              {
                type: 'EDI_SCANNER_FILES',
                drugCompanyCode: prescriptionPartner!.drugCompanyCode,
                originalFiles: attachedFiles,
              },
              window.origin,
            );
          }
          break;
        }
        case 'EDI_SCANNER_OCR_RESULT': {
          handleOcrSubmit(event.data!.ocrResult);
          break;
        }
      }
    };

    window.addEventListener('message', globalMessageListener);
    disposables.add(listenerToDisposable(globalMessageListener, window));

    const heartbeatInterval = setInterval(() => {
      currentPopup.postMessage({ type: 'EDI_SCANNER_PING' });
    }, 1000);
    disposables.add(intervalToDisposable(heartbeatInterval));

    return () => disposables.forEach(d => d.dispose());
  }, [prescriptionPartner, attachedFiles, currentPopup, handleOcrSubmit]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack sx={{ gap: 3 }}>
      <Typography variant='h4'>거래처별 제품상세</Typography>

      <Card sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Stack sx={{ gap: 2 }}>
            <Stack direction='row' sx={{ gap: 2 }}>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 100 }}>
                  제약사명:
                </Typography>
                <Stack direction='row' spacing={1} alignItems='center' flex={1}>
                  <Typography variant='body1'>{formDrugCompany}</Typography>
                </Stack>
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 140 }}>
                  거래처코드:
                </Typography>
                <Typography variant='body1'>{formInstitutionCode}</Typography>
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 80 }}>
                  처방월:
                </Typography>
                <Controller
                  control={form.control}
                  name={'prescriptionMonth'}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      format={DATEFORMAT_YYYY_MM}
                      views={['year', 'month']}
                      label='처방월'
                      readOnly={prescriptionPartner!.status === 'COMPLETED'}
                      slotProps={{
                        textField: {
                          size: 'small',
                        },
                      }}
                    />
                  )}
                />
              </Stack>
            </Stack>

            <Stack direction='row' sx={{ gap: 2 }}>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 100 }}>
                  회사명:
                </Typography>
                <Typography variant='body1'>{formCompanyName}</Typography>
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 140 }}>
                  사업자등록번호:
                </Typography>
                <Typography variant='body1'>{formBusinessNumber}</Typography>
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 80 }}>
                  정산월:
                </Typography>
                <Controller
                  control={form.control}
                  name={'settlementMonth'}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      format={DATEFORMAT_YYYY_MM}
                      views={['year', 'month']}
                      label='정산월'
                      readOnly={prescriptionPartner!.status === 'COMPLETED'}
                      slotProps={{
                        textField: {
                          size: 'small',
                        },
                      }}
                    />
                  )}
                />
              </Stack>
            </Stack>

            <Stack direction='row' sx={{ gap: 2 }}>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 100 }}>
                  거래처명:
                </Typography>
                <Controller
                  control={form.control}
                  name={'institutionName'}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size='small'
                      fullWidth
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <InputAdornment position='end'>
                            <IconButton size='small' onClick={handlePartnerSearch} disabled={prescriptionPartner!.status === 'COMPLETED'}>
                              <SearchNormal1 size={16} />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 140 }}>
                  딜러명:
                </Typography>
                <Typography variant='body1'>{formDealerName}</Typography>
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 80 }}>
                  처방금액:
                </Typography>
                <Typography variant='body1'>{formPrescriptionAmount}</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction='row' spacing={2} sx={{ mt: 3 }}>
            <Button variant='contained' color='success' size='small' onClick={handleEdiFileView}>
              EDI파일보기
            </Button>
          </Stack>
        </Box>

        <Stack direction='row' justifyContent='space-between' alignItems='center' mb={2}>
          <Stack direction='row' spacing={2}></Stack>
          <Stack direction='row' spacing={1}>
            <Button
              variant='contained'
              color='error'
              size='small'
              disabled={prescriptionPartner!.status === 'COMPLETED' || selectedIndexes.length === 0}
              onClick={handleDelete}
            >
              삭제
            </Button>
            <Button
              variant='contained'
              color='success'
              size='small'
              onClick={handleAddProduct}
              startIcon={<Add size={16} />}
              disabled={prescriptionPartner!.status === 'COMPLETED'}
            >
              내역추가
            </Button>
          </Stack>
        </Stack>

        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={50}>
                  <Checkbox
                    checked={selectedIndexes.length === partnerProducts.length && partnerProducts.length > 0}
                    onChange={e => {
                      if (e.target.checked) {
                        setSelectedIndexes(partnerProducts.map((_, index) => index));
                      } else {
                        setSelectedIndexes([]);
                      }
                    }}
                    disabled={prescriptionPartner!.status === 'COMPLETED'}
                  />
                </TableCell>
                <TableCell width={60}>No</TableCell>
                <TableCell width={120}>보험코드</TableCell>
                <TableCell width={200}>제품명</TableCell>
                <TableCell width={80}>단위</TableCell>
                <TableCell width={100}>수량</TableCell>
                <TableCell width={100}>약가</TableCell>
                <TableCell width={120}>총 금액</TableCell>
                <TableCell width={100}>기본수수료율</TableCell>
                <TableCell width={120}>수수료 금액</TableCell>
                <TableCell width={150}>비고</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={11} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      데이터를 로드하는 중입니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : partnerProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                partnerProducts.map((item, index) => (
                  <TableRow key={index + item.productCode}>
                    <TableCell>
                      <Checkbox
                        checked={selectedIndexes.includes(index)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedIndexes(prev => [...prev, index]);
                          } else {
                            setSelectedIndexes(prev => prev.filter(id => id !== index));
                          }
                        }}
                        disabled={prescriptionPartner!.status === 'COMPLETED'}
                      />
                    </TableCell>
                    <TableCell>{item.sequence}</TableCell>
                    <TableCell>{item.productCode}</TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        fullWidth
                        value={item.productName}
                        placeholder='제품명'
                        InputProps={{
                          readOnly: true,
                          endAdornment: (
                            <InputAdornment position='end'>
                              <IconButton
                                size='small'
                                onClick={() => {
                                  setCurrentProductItemIndex(index);
                                  setPartnerProductSelectModalOpen(true);
                                }}
                                disabled={prescriptionPartner!.status === 'COMPLETED'}
                              >
                                <SearchNormal1 size={16} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{item.unit}</Typography>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        fullWidth
                        value={item.quantity}
                        onChange={event => {
                          const normalized = normalizeLocaleNumber(event.target.value);
                          if (normalized !== null) {
                            handleProductChange(index, 'quantity', normalized);
                          }
                        }}
                        slotProps={{
                          input: {
                            readOnly: prescriptionPartner!.status === 'COMPLETED',
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{item.unitPrice}원</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{item.totalPrice}원</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{item.baseFeeRate}%</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{item.feeAmount}원</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2'>{item.note ?? ''}</Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={sendOcrReport} onChange={e => setSendOcrReport(e.target.checked)} />}
            label='OCR리포트 보내기'
            disabled={prescriptionPartner!.status === 'COMPLETED'}
          />
          <TextField
            fullWidth
            multiline
            rows={6}
            placeholder='OCR 리포트 내용을 입력하세요'
            value={ocrReportContent}
            onChange={e => setOcrReportContent(e.target.value)}
            disabled={!sendOcrReport}
            sx={{ mt: 2 }}
          />
        </Box>

        {prescriptionPartner!.status !== 'COMPLETED' ? (
          <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 4 }}>
            <Button variant='outlined' size='large' onClick={() => window.history.back()} sx={{ minWidth: 120 }}>
              취소
            </Button>
            <Button variant='contained' color='success' size='large' onClick={form.handleSubmit(submitHandler)} sx={{ minWidth: 120 }}>
              저장
            </Button>
          </Stack>
        ) : (
          <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 4 }}>
            <Button variant='outlined' size='large' onClick={() => window.history.back()} sx={{ minWidth: 120 }}>
              뒤로
            </Button>
          </Stack>
        )}
      </Card>

      <MpChangeHistoryModal
        open={changeHistoryModalOpen}
        onClose={() => setChangeHistoryModalOpen(false)}
        prescriptionFormId={paramPrescriptionPartnerId ? prescriptionPartnerId : undefined}
      />
      <MpOcrRequestModal
        drugCompanyCode={formDrugCompanyCode}
        open={ocrRequestModalOpen}
        onClose={() => setOcrRequestModalOpen(false)}
        onSubmit={handleOcrSubmit}
        imageUrls={attachedFiles.map(it => it.fileUrl)}
      />
      <MpPartnerSelectModal open={partnerSelectModalOpen} onClose={() => setPartnerSelectModalOpen(false)} onSelect={handlePartnerSelect} />
      <MpPartnerProductSelectModal
        open={partnerProductSelectModalOpen}
        onClose={() => setPartnerProductSelectModalOpen(false)}
        onSelect={handleProductSelect}
      />
    </Stack>
  );
}
