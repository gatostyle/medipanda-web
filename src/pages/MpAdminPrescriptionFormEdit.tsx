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
import { useFormik } from 'formik';
import { Add, Minus, SearchNormal1 } from 'iconsax-reactjs';
import {
  type AttachmentResponse,
  getAttachedEdiFiles,
  getPartnerProducts,
  getPrescriptionPartner,
  type OcrOriginalItem,
  type OcrResponse,
  type PartnerResponse,
  type ProductSummaryResponse,
  upsertPatchPartnerProducts,
} from '@/backend';
import { MpChangeHistoryModal } from '@/components/MpChangeHistoryModal';
import { MpOcrRequestModal } from '@/components/MpOcrRequestModal';
import { MpPartnerSelectModal } from '@/components/MpPartnerSelectModal';
import { type Sequenced } from '@/lib/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { DateFix, DATEFORMAT_YYYY_MM } from '@/lib/utils/dateFormat';

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

export default function MpAdminPrescriptionFormEdit() {
  const navigate = useNavigate();
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

  const [partnerProducts, setPartnerProducts] = useState<Sequenced<CustomPartnerProducts>[]>([]);
  const [deletePartnerProductIds, setDeletePartnerProductIds] = useState<number[]>([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentResponse[]>([]);

  const [sendOcrReport, setSendOcrReport] = useState(false);
  const [ocrReportContent, setOcrReportContent] = useState('');

  const formik = useFormik({
    initialValues: {
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
    onSubmit: async () => {
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
            ocrItem: product.ocrItem,
          })),
          deletedPrescriptionPartnerProductIds: deletePartnerProductIds,
        });

        enqueueSnackbar('거래처별 제품 목록이 저장되었습니다.', { variant: 'success' });
        navigate('/admin/prescription-forms');
      } catch (e) {
        console.error('Failed to submit form:', e);
        await alertError('거래처별 제품상세 저장에 실패했습니다.');
      }
    },
  });

  const handleProductChange = useCallback(
    <K extends keyof CustomPartnerProducts, T extends CustomPartnerProducts[K]>(index: number, field: K, value: T) => {
      setPartnerProducts(prev =>
        prev.map((p, i) => {
          if (index === i) {
            return { ...p, [field]: value };
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

  const handleRemoveProduct = () => {
    if (partnerProducts.length > 1) {
      const lastPartnerProduct = partnerProducts[partnerProducts.length - 1];
      setPartnerProducts(partnerProducts.slice(0, -1));
      if (lastPartnerProduct.id !== null) {
        setDeletePartnerProductIds(prev => [...prev, lastPartnerProduct.id!]);
      }
    }
  };

  const handlePartnerSearch = () => {
    setPartnerSelectModalOpen(true);
  };

  const handlePartnerSelect = (partner: PartnerResponse) => {
    formik.setFieldValue('institutionName', partner.institutionName);
    formik.setFieldValue('institutionCode', partner.institutionCode);
    formik.setFieldValue('drugCompany', partner.drugCompanyName);
    formik.setFieldValue('companyName', partner.companyName);
  };

  const handleProductSelect = (product: ProductSummaryResponse) => {
    const currentPartnerProduct = partnerProducts[currentProductItemIndex];

    setPartnerProducts([
      ...partnerProducts.slice(0, currentProductItemIndex),
      {
        ...currentPartnerProduct,
        productCode: product.productCode,
        productName: product.productName ?? '',
        unitPrice: normalizeLocaleNumber(String(product.price ?? 0)),
        baseFeeRate: PercentUtils.formatDecimal(product.feeRate ?? 0),
      },
      ...partnerProducts.slice(currentProductItemIndex + 1),
    ]);
  };

  const handleEdiFileView = async () => {
    setOcrRequestModalOpen(true);
  };

  const handleChangeHistory = () => {
    setChangeHistoryModalOpen(true);
  };

  const handleOcrSubmit = async (response: OcrResponse[]) => {
    if (response.length === 0) {
      await alert('OCR 결과가 없습니다. 거래선에 등록된 제약사가 EDI 내용에 포함되어 있는지 확인하세요.');
      return;
    }

    const maxSequence = Math.max(...partnerProducts.map(p => p.sequence), 0);

    setPartnerProducts([
      ...partnerProducts,
      ...response.map((ocrItem, index) => {
        return {
          sequence: maxSequence + index + 1,
          id: null,
          productCode: ocrItem.code,
          productName: ocrItem.name,
          unit: ocrItem.unit,
          quantity: normalizeLocaleNumber(String(ocrItem.volume)),
          unitPrice: normalizeLocaleNumber(String(ocrItem.price)),
          totalPrice: normalizeLocaleNumber(String(ocrItem.totalAmount)),
          baseFeeRate: normalizeLocaleNumber(String(ocrItem.rate * 100)),
          feeAmount: normalizeLocaleNumber(String(Math.floor(ocrItem.feeAmount))),
          note: '',
          ocrItem: {
            productCode: ocrItem.code,
            productName: ocrItem.name,
            unit: ocrItem.unit,
            quantity: ocrItem.volume,
            unitPrice: ocrItem.price,
            totalPrice: ocrItem.totalAmount,
            baseFeeRate: ocrItem.rate * 100,
            feeAmount: ocrItem.feeAmount,
            note: '',
          },
        };
      }),
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
      return navigate('/admin/prescription-forms');
    }

    try {
      setLoading(true);
      const [formDetail, products, attachedFiles] = await Promise.all([
        getPrescriptionPartner(prescriptionPartnerId),
        getPartnerProducts(prescriptionPartnerId),
        getAttachedEdiFiles(prescriptionPartnerId),
      ]);

      formik.setValues({
        drugCompany: formDetail.drugCompany,
        drugCompanyCode: formDetail.drugCompanyCode,
        companyName: formDetail.companyName,
        institutionName: formDetail.institutionName,
        institutionCode: formDetail.institutionCode,
        businessNumber: normalizeBusinessNumber(formDetail.businessNumber),
        dealerName: formDetail.dealerName,
        prescriptionMonth: DateFix(formDetail.prescriptionMonth),
        settlementMonth: DateFix(formDetail.settlementMonth),
        prescriptionAmount: formDetail.amount.toLocaleString(),
      });

      setPartnerProducts(
        products.map((product, index) => ({
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
                  <Typography variant='body1'>{formik.values.drugCompany}</Typography>
                </Stack>
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 140 }}>
                  거래처코드:
                </Typography>
                <Typography variant='body1'>{formik.values.institutionCode}</Typography>
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 80 }}>
                  처방월:
                </Typography>
                <DatePicker
                  value={formik.values.prescriptionMonth}
                  onChange={value => formik.setFieldValue('prescriptionMonth', value)}
                  format={DATEFORMAT_YYYY_MM}
                  views={['year', 'month']}
                  label='처방월'
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                />
              </Stack>
            </Stack>

            <Stack direction='row' sx={{ gap: 2 }}>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 100 }}>
                  회사명:
                </Typography>
                <Typography variant='body1'>{formik.values.companyName}</Typography>
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 140 }}>
                  사업자등록번호:
                </Typography>
                <Typography variant='body1'>{formik.values.businessNumber}</Typography>
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 80 }}>
                  정산월:
                </Typography>
                <DatePicker
                  value={formik.values.settlementMonth}
                  onChange={value => formik.setFieldValue('settlementMonth', value)}
                  format={DATEFORMAT_YYYY_MM}
                  views={['year', 'month']}
                  label='정산월'
                  slotProps={{
                    textField: {
                      size: 'small',
                    },
                  }}
                />
              </Stack>
            </Stack>

            <Stack direction='row' sx={{ gap: 2 }}>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 100 }}>
                  거래처명:
                </Typography>
                <TextField
                  size='small'
                  name='institutionName'
                  value={formik.values.institutionName}
                  onChange={formik.handleChange}
                  fullWidth
                  InputProps={{
                    readOnly: true,
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton size='small' onClick={handlePartnerSearch}>
                          <SearchNormal1 size={16} />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 140 }}>
                  딜러명:
                </Typography>
                <Typography variant='body1'>{formik.values.dealerName}</Typography>
              </Stack>
              <Stack direction='row' sx={{ flex: '1 0', alignItems: 'center' }}>
                <Typography variant='body2' color='text.secondary' sx={{ minWidth: 80 }}>
                  처방금액:
                </Typography>
                <Typography variant='body1'>{formik.values.prescriptionAmount}</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Stack direction='row' spacing={2} sx={{ mt: 3 }}>
            <Button variant='contained' color='success' size='small' onClick={handleEdiFileView}>
              EDI파일보기
            </Button>
            <Button variant='outlined' size='small' onClick={handleChangeHistory}>
              변경내역보기
            </Button>
          </Stack>
        </Box>

        <TableContainer>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell width={60}>No</TableCell>
                <TableCell width={120}>보험코드</TableCell>
                <TableCell width={200}>제품명</TableCell>
                <TableCell width={80}>단위</TableCell>
                <TableCell width={100}>수량</TableCell>
                <TableCell width={100}>약가</TableCell>
                <TableCell width={120}>총 금액</TableCell>
                <TableCell width={120}>기본수수료율</TableCell>
                <TableCell width={120}>수수료 금액</TableCell>
                <TableCell width={150}>비고</TableCell>
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
              ) : partnerProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} align='center' sx={{ py: 3 }}>
                    <Typography variant='body2' color='text.secondary'>
                      검색 결과가 없습니다.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                partnerProducts.map(item => (
                  <TableRow key={item.sequence}>
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
                                  setCurrentProductItemIndex(item.sequence - 1);
                                  setPartnerProductSelectModalOpen(true);
                                }}
                              >
                                <SearchNormal1 size={16} />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        fullWidth
                        name='quantity'
                        value={item.quantity}
                        onChange={event => {
                          const normalized = normalizeLocaleNumber(event.target.value);

                          if (normalized !== null) {
                            handleProductChange(item.sequence - 1, 'quantity', normalized);
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{item.unitPrice.toLocaleString()}</TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        fullWidth
                        name='totalPrice'
                        value={item.totalPrice}
                        onChange={event => {
                          const normalized = normalizeLocaleNumber(event.target.value);

                          if (normalized !== null) {
                            handleProductChange(item.sequence - 1, 'totalPrice', normalized);
                          }
                        }}
                        InputProps={{
                          endAdornment: <Typography variant='body2'>원</Typography>,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        fullWidth
                        name='baseFeeRate'
                        value={item.baseFeeRate}
                        onChange={event => {
                          const normalized = normalizeLocaleNumber(event.target.value, {
                            maximumFractionDigits: 1,
                            min: 0,
                            max: 100,
                          });

                          if (normalized !== null) {
                            handleProductChange(item.sequence - 1, 'baseFeeRate', normalized);
                          }
                        }}
                        InputProps={{
                          endAdornment: <Typography variant='body2'>%</Typography>,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        fullWidth
                        name='feeAmount'
                        value={item.feeAmount}
                        onChange={event => {
                          const normalized = normalizeLocaleNumber(event.target.value);

                          if (normalized !== null) {
                            handleProductChange(item.sequence - 1, 'feeAmount', normalized);
                          }
                        }}
                        InputProps={{
                          endAdornment: <Typography variant='body2'>원</Typography>,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size='small'
                        fullWidth
                        name='note'
                        value={item.note}
                        onChange={e => handleProductChange(item.sequence - 1, 'note', e.target.value)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Stack direction='row' spacing={2} sx={{ mt: 2 }}>
          <Button variant='contained' color='success' size='small' onClick={handleAddProduct} startIcon={<Add size={16} />}>
            내역추가
          </Button>
          <Button
            variant='outlined'
            color='error'
            size='small'
            onClick={handleRemoveProduct}
            disabled={partnerProducts.length <= 1}
            startIcon={<Minus size={16} />}
          >
            내역삭제
          </Button>
        </Stack>

        <Box sx={{ mt: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={sendOcrReport} onChange={e => setSendOcrReport(e.target.checked)} />}
            label='OCR리포트 보내기'
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

        <Stack direction='row' spacing={2} justifyContent='center' sx={{ mt: 4 }}>
          <Button variant='outlined' size='large' component={RouterLink} to='/admin/prescription-forms' sx={{ minWidth: 120 }}>
            취소
          </Button>
          <Button variant='contained' color='success' size='large' onClick={formik.submitForm} sx={{ minWidth: 120 }}>
            저장
          </Button>
        </Stack>
      </Card>

      <MpChangeHistoryModal
        open={changeHistoryModalOpen}
        onClose={() => setChangeHistoryModalOpen(false)}
        prescriptionFormId={paramPrescriptionPartnerId ? prescriptionPartnerId : undefined}
      />
      <MpOcrRequestModal
        drugCompanyCode={formik.values.drugCompanyCode}
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
