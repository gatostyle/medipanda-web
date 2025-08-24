import {
  Box,
  Button,
  Card,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useFormik } from 'formik';
import { Add, Minus, SearchNormal1 } from 'iconsax-react';
import {
  AttachmentResponse,
  createPartnerProducts,
  getAttachedEdiFiles,
  getPartnerProducts,
  getPrescriptionPartner,
  OcrResponse,
  PartnerResponse,
  PrescriptionPartnerProductResponse,
  PrescriptionProductItem,
  ProductSummaryResponse
} from 'medipanda/backend';
import { MpChangeHistoryDialog } from 'medipanda/components/MpChangeHistoryDialog';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';
import { MpOcrRequestModal } from 'medipanda/components/MpOcrRequestModal';
import { MpPartnerSearchModal } from 'medipanda/components/MpPartnerSearchModal';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { Sequenced } from 'medipanda/utils/withSequence';
import { useSnackbar } from 'notistack';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MpPartnerProductSelectModal } from '../components/MpPartnerProductSelectModal';
import { DateFix } from '../utils/dateFormat';

export default function MpAdminPrescriptionFormProducts() {
  const navigate = useNavigate();
  const { id } = useParams();
  const notImplementedDialog = useMpNotImplementedDialog();
  const { enqueueSnackbar } = useSnackbar();
  const [changeHistoryOpen, setChangeHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [partnerSearchModalOpen, setPartnerSearchModalOpen] = useState(false);
  const [partnerProductSelectModalOpen, setPartnerProductSelectModalOpen] = useState(false);
  const [currentProductItemIndex, setCurrentProductItemIndex] = useState<number>(0);

  const [partnerProducts, setPartnerProducts] = useState<
    Sequenced<PrescriptionPartnerProductResponse & Pick<PrescriptionProductItem, 'ocrItem'>>[]
  >([]);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentResponse[]>([]);

  const [sendOcrReport, setSendOcrReport] = useState(false);
  const [ocrReportContent, setOcrReportContent] = useState('');

  const formik = useFormik({
    initialValues: {
      drugCompany: '',
      companyName: '',
      institutionName: '',
      institutionCode: '',
      businessNumber: '',
      dealerName: '',
      prescriptionMonth: null as Date | null,
      settlementMonth: null as Date | null,
      prescriptionAmount: ''
    },
    onSubmit: async (values) => {
      try {
        await createPartnerProducts({
          prescriptionPartnerId: parseInt(id!),
          items: partnerProducts
        });

        alert('거래처별 제품 목록이 저장되었습니다.');

        navigate('/admin/prescription-forms');
      } catch (e) {
        console.error('Failed to submit form:', e);
        enqueueSnackbar('거래처별 제품상세 저장에 실패했습니다.', { variant: 'error' });
      }
    }
  });

  const handleProductChange = useCallback((index: number, field: keyof PrescriptionPartnerProductResponse, value: any) => {
    setPartnerProducts((prev) =>
      prev.map((p, i) => {
        if (index === i) {
          return { ...p, [field]: value };
        }
        return p;
      })
    );
  }, []);

  const columns = useMemo<ColumnDef<Sequenced<PrescriptionPartnerProductResponse>>[]>(
    () => [
      {
        header: 'No',
        accessorKey: 'sequence',
        cell: ({ row }) => row.original.sequence,
        size: 60
      },
      {
        header: '보험코드',
        accessorKey: 'productCode',
        cell: ({ row }) => row.original.productCode,
        size: 120
      },
      {
        header: '제품명',
        accessorKey: 'productName',
        size: 200,
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField size="small" fullWidth value={row.original.productName} placeholder="제품명 검색" disabled />
            <IconButton
              size="small"
              onClick={() => {
                setCurrentProductItemIndex(row.index);
                setPartnerProductSelectModalOpen(true);
              }}
            >
              <SearchNormal1 size={16} />
            </IconButton>
          </Stack>
        )
      },
      {
        header: '단위',
        accessorKey: 'unit',
        cell: ({ row }) => row.original.unit,
        size: 80
      },
      {
        header: '수량',
        accessorKey: 'quantity',
        cell: ({ row }) => (
          <TextField
            size="small"
            type="number"
            fullWidth
            value={row.original.quantity}
            onChange={(e) => handleProductChange(row.index, 'quantity', e.target.value)}
          />
        ),
        size: 100
      },
      {
        header: '약가',
        accessorKey: 'unitPrice',
        cell: ({ row }) => row.original.unitPrice.toLocaleString(),
        size: 100
      },
      {
        header: '총 금액',
        accessorKey: 'totalPrice',
        cell: ({ row }) => (
          <TextField
            size="small"
            type="number"
            fullWidth
            name="totalPrice"
            value={row.original.totalPrice}
            onChange={(e) => handleProductChange(row.index, 'totalPrice', e.target.value)}
          />
        ),
        size: 120
      },
      {
        header: '기본수수료율',
        accessorKey: 'baseFeeRate',
        cell: ({ row }) => (
          <TextField
            size="small"
            type="number"
            fullWidth
            name="baseFeeRate"
            value={row.original.baseFeeRate}
            onChange={(e) => handleProductChange(row.index, 'baseFeeRate', e.target.value)}
          />
        ),
        size: 120
      },
      {
        header: '수수료 금액',
        accessorKey: 'feeAmount',
        cell: ({ row }) => (
          <TextField
            size="small"
            type="number"
            fullWidth
            name="feeAmount"
            value={row.original.feeAmount}
            onChange={(e) => handleProductChange(row.index, 'feeAmount', e.target.value)}
          />
        ),
        size: 120
      },
      {
        header: '비고',
        accessorKey: 'note',
        cell: ({ row }) => (
          <TextField
            size="small"
            fullWidth
            name="note"
            value={row.original.note}
            onChange={(e) => handleProductChange(row.index, 'note', e.target.value)}
          />
        ),
        size: 150
      }
    ],
    [handleProductChange, notImplementedDialog]
  );

  const table = useReactTable({
    data: partnerProducts,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const handleAddProduct = () => {
    const maxSequence = Math.max(...partnerProducts.map((p) => p.sequence || 0), 0);

    setPartnerProducts([
      ...partnerProducts,
      {
        sequence: maxSequence + 1,
        id: -1,
        productCode: '',
        productName: '',
        unit: '',
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        baseFeeRate: 0,
        feeAmount: 0,
        note: '',
        ocrItem: null
      }
    ]);
  };

  const handleRemoveProduct = () => {
    if (partnerProducts.length > 1) {
      setPartnerProducts(partnerProducts.slice(0, -1));
    }
  };

  const handlePartnerSearch = () => {
    setPartnerSearchModalOpen(true);
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
        baseFeeRate: product.feeRate ?? 0
      },
      ...partnerProducts.slice(currentProductItemIndex + 1)
    ]);
  };

  const handleEdiFileView = async () => {
    setOcrModalOpen(true);
  };

  const handleChangeHistory = () => {
    setChangeHistoryOpen(true);
  };

  const handleOcrSubmit = (response: OcrResponse[]) => {
    const maxSequence = Math.max(...partnerProducts.map((p) => p.sequence || 0));

    setPartnerProducts([
      ...partnerProducts,
      ...response.map((ocrItem, index) => {
        return {
          sequence: maxSequence + index + 1,
          id: -1,
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
            note: ''
          }
        };
      })
    ]);
  };

  const handleCancel = () => {
    navigate('/admin/prescription-forms');
  };

  useEffect(() => {
    const fetchPrescriptionFormData = async () => {
      if (id === undefined) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [formDetail, products, attachedFiles] = await Promise.all([
          getPrescriptionPartner(parseInt(id)),
          getPartnerProducts(parseInt(id)),
          getAttachedEdiFiles(parseInt(id))
        ]);

        formik.setValues({
          drugCompany: formDetail.drugCompany,
          companyName: formDetail.companyName,
          institutionName: formDetail.partnerName,
          institutionCode: formDetail.institutionCode,
          businessNumber: formDetail.businessNumber,
          dealerName: formDetail.dealerName,
          prescriptionMonth: DateFix(formDetail.prescriptionMonth),
          settlementMonth: DateFix(formDetail.settlementMonth),
          prescriptionAmount: formDetail.amount.toLocaleString()
        });

        setPartnerProducts(
          products.map((product, index) => ({
            ...product,
            sequence: index + 1,
            ocrItem: null
          }))
        );

        setAttachedFiles(attachedFiles);
      } catch (error) {
        console.error('Failed to fetch prescription form data:', error);
        enqueueSnackbar('처방입력 정보를 불러오는데 실패했습니다.', { variant: 'error' });
        navigate('/admin/prescription-forms');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptionFormData();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        거래처별 제품상세
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Card sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                      제약사명:
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                      <Typography variant="body1">{formik.values.drugCompany}</Typography>
                    </Stack>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                      회사명:
                    </Typography>
                    <Typography variant="body1">{formik.values.companyName}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
                      거래처명:
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                      <TextField
                        size="small"
                        name="institutionName"
                        value={formik.values.institutionName}
                        onChange={formik.handleChange}
                        fullWidth
                      />
                      <IconButton size="small" onClick={handlePartnerSearch}>
                        <SearchNormal1 size={16} />
                      </IconButton>
                    </Stack>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                      거래처코드:
                    </Typography>
                    <Typography variant="body1">{formik.values.institutionCode}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                      사업자등록번호:
                    </Typography>
                    <Typography variant="body1">{formik.values.businessNumber}</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
                      딜러명:
                    </Typography>
                    <Typography variant="body1">{formik.values.dealerName}</Typography>
                  </Stack>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      처방월:
                    </Typography>
                    <MpFormikDatePicker
                      name="prescriptionMonth"
                      placeholder="월 선택"
                      format="yyyy-MM"
                      views={['year', 'month']}
                      formik={formik}
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      정산월:
                    </Typography>
                    <MpFormikDatePicker
                      name="settlementMonth"
                      placeholder="월 선택"
                      format="yyyy-MM"
                      views={['year', 'month']}
                      formik={formik}
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center">
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      처방금액:
                    </Typography>
                    <Typography variant="body1">{formik.values.prescriptionAmount}</Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button variant="contained" color="success" size="small" onClick={handleEdiFileView}>
                EDI파일보기
              </Button>
              <Button variant="text" size="small" onClick={handleChangeHistory} sx={{ textDecoration: 'underline' }}>
                변경내역보기
              </Button>
            </Stack>
          </Box>

          <TableContainer>
            <Table size="small">
              <TableHead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableCell key={header.id} style={{ width: header.getSize() }}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableHead>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" color="success" size="small" onClick={handleAddProduct} startIcon={<Add size={16} />}>
              내역추가
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleRemoveProduct}
              disabled={partnerProducts.length <= 1}
              startIcon={<Minus size={16} />}
            >
              내역삭제
            </Button>
          </Stack>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              OCR리포트 보내기
            </Typography>
            <FormControlLabel
              control={<Checkbox checked={sendOcrReport} onChange={(e) => setSendOcrReport(e.target.checked)} />}
              label="OCR리포트 보내기"
            />
            <TextField
              fullWidth
              multiline
              rows={6}
              placeholder="OCR 리포트 내용을 입력하세요"
              value={ocrReportContent}
              onChange={(e) => setOcrReportContent(e.target.value)}
              disabled={!sendOcrReport}
              sx={{ mt: 2 }}
            />
          </Box>

          <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 4 }}>
            <Button variant="outlined" size="large" onClick={handleCancel} sx={{ minWidth: 120 }}>
              취소
            </Button>
            <Button variant="contained" color="success" size="large" type="submit" sx={{ minWidth: 120 }}>
              저장
            </Button>
          </Stack>
        </Card>
      </form>

      <MpChangeHistoryDialog
        open={changeHistoryOpen}
        onClose={() => setChangeHistoryOpen(false)}
        prescriptionFormId={id ? parseInt(id) : undefined}
      />
      <MpOcrRequestModal
        open={ocrModalOpen}
        onClose={() => setOcrModalOpen(false)}
        onSubmit={handleOcrSubmit}
        imageUrls={attachedFiles.map((it) => it.fileUrl)}
      />
      <MpPartnerSearchModal open={partnerSearchModalOpen} onClose={() => setPartnerSearchModalOpen(false)} onSelect={handlePartnerSelect} />
      <MpPartnerProductSelectModal
        open={partnerProductSelectModalOpen}
        onClose={() => setPartnerProductSelectModalOpen(false)}
        onSelect={handleProductSelect}
      />
    </Box>
  );
}
