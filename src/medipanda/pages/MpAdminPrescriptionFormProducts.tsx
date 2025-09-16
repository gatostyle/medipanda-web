import { useMpModal } from '@/medipanda/hooks/useMpModal';
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
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { Add, Minus, SearchNormal1 } from 'iconsax-react';
import {
  AttachmentResponse,
  getAttachedEdiFiles,
  getPartnerProducts,
  getPrescriptionPartner,
  OcrResponse,
  PartnerResponse,
  PrescriptionPartnerProductResponse,
  PrescriptionProductItem,
  ProductSummaryResponse,
  upsertPatchPartnerProducts,
} from '@/backend';
import { MpChangeHistoryModal } from '@/medipanda/components/MpChangeHistoryModal';
import { MpOcrRequestModal } from '@/medipanda/components/MpOcrRequestModal';
import { MpPartnerSelectModal } from '@/medipanda/components/MpPartnerSelectModal';
import { Sequenced } from '@/medipanda/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';
import { ArrayElement } from 'type-fest/source/internal';
import { MpPartnerProductSelectModal } from '../components/MpPartnerProductSelectModal';
import { DateFix } from '../utils/dateFormat';

export default function MpAdminPrescriptionFormProducts() {
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

  const { alertError } = useMpModal();

  const [partnerProducts, setPartnerProducts] = useState<
    Sequenced<Omit<PrescriptionPartnerProductResponse & Pick<PrescriptionProductItem, 'ocrItem'>, 'id'> & { id: number | null }>[]
  >([]);
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
          items: partnerProducts,
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

  const handleProductChange = useCallback((index: number, field: keyof PrescriptionPartnerProductResponse, value: any) => {
    setPartnerProducts(prev =>
      prev.map((p, i) => {
        if (index === i) {
          return { ...p, [field]: value };
        }
        return p;
      }),
    );
  }, []);

  const table = useReactTable({
    data: partnerProducts,
    columns: useMemo<ColumnDef<ArrayElement<typeof partnerProducts>>[]>(
      () => [
        {
          header: 'No',
          cell: ({ row }) => row.original.sequence,
          size: 60,
        },
        {
          header: '보험코드',
          cell: ({ row }) => row.original.productCode,
          size: 120,
        },
        {
          header: '제품명',
          cell: ({ row }) => (
            <TextField
              size='small'
              fullWidth
              value={row.original.productName}
              placeholder='제품명'
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position='end'>
                    <IconButton
                      size='small'
                      onClick={() => {
                        setCurrentProductItemIndex(row.index);
                        setPartnerProductSelectModalOpen(true);
                      }}
                    >
                      <SearchNormal1 size={16} />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          ),
          size: 200,
        },
        {
          header: '단위',
          cell: ({ row }) => row.original.unit,
          size: 80,
        },
        {
          header: '수량',
          cell: ({ row }) => (
            <TextField
              size='small'
              type='number'
              fullWidth
              value={row.original.quantity}
              onChange={e => handleProductChange(row.index, 'quantity', e.target.value)}
            />
          ),
          size: 100,
        },
        {
          header: '약가',
          cell: ({ row }) => row.original.unitPrice.toLocaleString(),
          size: 100,
        },
        {
          header: '총 금액',
          cell: ({ row }) => (
            <TextField
              size='small'
              type='number'
              fullWidth
              name='totalPrice'
              value={row.original.totalPrice}
              onChange={e => handleProductChange(row.index, 'totalPrice', e.target.value)}
            />
          ),
          size: 120,
        },
        {
          header: '기본수수료율',
          cell: ({ row }) => (
            <TextField
              size='small'
              type='number'
              fullWidth
              name='baseFeeRate'
              value={row.original.baseFeeRate}
              onChange={e => handleProductChange(row.index, 'baseFeeRate', e.target.value)}
            />
          ),
          size: 120,
        },
        {
          header: '수수료 금액',
          cell: ({ row }) => (
            <TextField
              size='small'
              type='number'
              fullWidth
              name='feeAmount'
              value={row.original.feeAmount}
              onChange={e => handleProductChange(row.index, 'feeAmount', e.target.value)}
            />
          ),
          size: 120,
        },
        {
          header: '비고',
          cell: ({ row }) => (
            <TextField
              size='small'
              fullWidth
              name='note'
              value={row.original.note}
              onChange={e => handleProductChange(row.index, 'note', e.target.value)}
            />
          ),
          size: 150,
        },
      ],
      [],
    ),
    getCoreRowModel: getCoreRowModel(),
  });

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
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        baseFeeRate: 0,
        feeAmount: 0,
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
        unitPrice: product.price ?? 0,
        baseFeeRate: product.feeRate ?? 0,
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

  const handleOcrSubmit = (response: OcrResponse[]) => {
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
          quantity: ocrItem.volume,
          unitPrice: ocrItem.price,
          totalPrice: ocrItem.totalAmount,
          baseFeeRate: ocrItem.rate,
          feeAmount: ocrItem.feeAmount,
          note: '',
          ocrItem: {
            productCode: ocrItem.code,
            productName: ocrItem.name,
            unit: ocrItem.unit,
            quantity: ocrItem.volume,
            unitPrice: ocrItem.price,
            totalPrice: ocrItem.totalAmount,
            baseFeeRate: ocrItem.rate,
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
        institutionName: formDetail.partnerName,
        institutionCode: formDetail.institutionCode,
        businessNumber: formDetail.businessNumber,
        dealerName: formDetail.dealerName,
        prescriptionMonth: DateFix(formDetail.prescriptionMonth),
        settlementMonth: DateFix(formDetail.settlementMonth),
        prescriptionAmount: formDetail.amount.toLocaleString(),
      });

      setPartnerProducts(
        products.map((product, index) => ({
          ...product,
          sequence: index + 1,
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

      <Card sx={{ p: 3 }} component='form' onSubmit={formik.handleSubmit}>
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
                  format='yyyy-MM'
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
                  format='yyyy-MM'
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
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableCell key={header.id} style={{ width: header.getSize() }}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))}
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
          <Button variant='contained' color='success' size='large' type='submit' sx={{ minWidth: 120 }}>
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
