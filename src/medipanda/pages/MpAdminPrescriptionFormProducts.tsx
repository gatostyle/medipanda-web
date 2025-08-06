import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFormik } from 'formik';
import {
  Box,
  Button,
  Card,
  Checkbox,
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
  Typography,
  CircularProgress
} from '@mui/material';
import { SearchNormal1, Add, Minus } from 'iconsax-react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { useMpNotImplementedDialog } from 'medipanda/hooks/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'medipanda/hooks/useMpErrorDialog';
import { MpChangeHistoryDialog } from 'medipanda/components/MpChangeHistoryDialog';
import { MpPartnerSearchModal } from 'medipanda/components/MpPartnerSearchModal';
import { useSnackbar } from 'notistack';
import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import { Sequenced } from 'medipanda/utils/withSequence';
import { MpOcrRequestModal } from 'medipanda/components/MpOcrRequestModal';
import { OcrResponse } from 'medipanda/api-definitions/MpOcr';
import {
  getPartnerProducts,
  getPrescriptionPartner,
  getProductSummaries,
  PartnerResponse,
  PrescriptionPartnerProductResponse
} from 'medipanda/backend';
import MpFormikDatePicker from 'medipanda/components/MpFormikDatePicker';

export default function MpAdminPrescriptionFormProducts() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const notImplementedDialog = useMpNotImplementedDialog();
  const errorDialog = useMpErrorDialog();
  const { enqueueSnackbar } = useSnackbar();
  const [changeHistoryOpen, setChangeHistoryOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ocrModalOpen, setOcrModalOpen] = useState(false);
  const [partnerSearchModalOpen, setPartnerSearchModalOpen] = useState(false);

  const [products, setProducts] = useState<Sequenced<PrescriptionPartnerProductResponse>[]>([]);

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
      prescriptionMonth: '',
      settlementMonth: '',
      prescriptionAmount: ''
    },
    onSubmit: async (values) => {
      console.log('Form submitted:', values, products);
      navigate('/admin/prescription-forms');
    }
  });

  const handleProductChange = useCallback((id: number, field: keyof PrescriptionPartnerProductResponse, value: any) => {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updatedProduct = { ...p, [field]: value };
          if (field === 'quantity') {
            updatedProduct.totalPrice = Number(value) * updatedProduct.unitPrice;
            updatedProduct.feeAmount = updatedProduct.totalPrice * updatedProduct.baseFeeRate;
          }
          return updatedProduct;
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
        size: 60
      },
      {
        header: '보험코드',
        accessorKey: 'insuranceCode',
        size: 120
      },
      {
        header: '제품명',
        accessorKey: 'productName',
        size: 200,
        cell: ({ row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              fullWidth
              value={row.original.productName}
              onChange={(e) => handleProductChange(row.original.id, 'productName', e.target.value)}
              placeholder="제품명 검색"
            />
            <IconButton size="small" onClick={() => handleProductSearch(row.original.id)}>
              <SearchNormal1 size={16} />
            </IconButton>
          </Stack>
        )
      },
      {
        header: '단위',
        accessorKey: 'unit',
        size: 80
      },
      {
        header: '수량',
        accessorKey: 'quantity',
        cell: ({ row }) => (
          <TextField
            size="small"
            type="number"
            value={row.original.quantity}
            onChange={(e) => handleProductChange(row.original.id, 'quantity', e.target.value)}
            sx={{ width: 80 }}
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
        cell: ({ row }) => row.original.totalPrice.toLocaleString(),
        size: 120
      },
      {
        header: '기본수수료율',
        accessorKey: 'baseFeeRate',
        cell: ({ row }) => `${row.original.baseFeeRate}%`,
        size: 120
      },
      {
        header: '수수료 금액',
        accessorKey: 'feeAmount',
        cell: ({ row }) => row.original.feeAmount.toLocaleString(),
        size: 120
      },
      {
        header: '비고',
        accessorKey: 'note',
        cell: ({ row }) => (
          <TextField
            size="small"
            fullWidth
            value={row.original.note}
            onChange={(e) => handleProductChange(row.original.id, 'note', e.target.value)}
          />
        ),
        size: 150
      }
    ],
    [handleProductChange, notImplementedDialog]
  );

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const handleAddProduct = () => {
    const maxSequence = Math.max(...products.map((p) => p.sequence || 0));
    const newId = Math.max(...products.map((p) => p.id)) + 1;
    setProducts([
      ...products,
      {
        sequence: maxSequence + 1,
        id: newId,
        productCode: '',
        productName: '',
        unit: '',
        quantity: 0,
        unitPrice: 0,
        totalPrice: 0,
        baseFeeRate: 0.1,
        feeAmount: 0,
        note: ''
      }
    ]);
  };

  const handleRemoveProduct = () => {
    if (products.length > 1) {
      setProducts(products.slice(0, -1));
    }
  };

  const handlePartnerSearch = () => {
    setPartnerSearchModalOpen(true);
  };

  const handlePartnerSelect = (partner: PartnerResponse) => {
    formik.setFieldValue('institutionName', partner.institutionName);
    formik.setFieldValue('institutionCode', partner.institutionCode);
    formik.setFieldValue('drugCompany', partner.drugCompany);
    formik.setFieldValue('companyName', partner.companyName);
  };

  const handleEdiFileView = async () => {
    setOcrModalOpen(true);
  };

  const handleChangeHistory = () => {
    setChangeHistoryOpen(true);
  };

  const handleOcrSubmit = (response: OcrResponse) => {
    const updatedProducts = products.map((product, index) => {
      if (index < response.length) {
        const data = response[index];
        return {
          ...product,
          insuranceCode: data.code,
          productName: data.name,
          unit: '',
          quantity: data.volume,
          unitPrice: data.price,
          totalPrice: data.totalAmount,
          commissionRate: data.rate,
          feeAmount: data.feeAmount
        };
      }
      return product;
    });

    setProducts(updatedProducts);
  };

  const handleProductSearch = async (productId: number) => {
    try {
      const productName = products.find((p) => p.id === productId)?.productName ?? '';
      await getProductSummaries({ productName });
    } catch (error) {
      if (error instanceof NotImplementedError) {
        notImplementedDialog.open(error.message);
      } else {
        console.error('Failed to search products:', error);
        errorDialog.showError('제품 검색 중 오류가 발생했습니다.');
      }
    }
  };

  const handleCancel = () => {
    navigate('/admin/prescription-forms');
  };

  useEffect(() => {
    const fetchPrescriptionFormData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [formDetail, products] = await Promise.all([await getPrescriptionPartner(parseInt(id)), getPartnerProducts(parseInt(id))]);

        formik.setValues({
          drugCompany: formDetail.drugCompany,
          companyName: formDetail.companyName,
          institutionName: formDetail.partnerName,
          institutionCode: formDetail.institutionCode,
          businessNumber: formDetail.businessNumber,
          dealerName: formDetail.dealerName,
          prescriptionMonth: formDetail.prescriptionMonth,
          settlementMonth: formDetail.settlementMonth,
          prescriptionAmount: formDetail.amount.toLocaleString()
        });

        setProducts(
          products.map((product, index) => ({
            ...product,
            sequence: index + 1
          }))
        );
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
              disabled={products.length <= 1}
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
        imageUrl="/edi-example.jpeg"
      />
      <MpPartnerSearchModal open={partnerSearchModalOpen} onClose={() => setPartnerSearchModalOpen(false)} onSelect={handlePartnerSelect} />
    </Box>
  );
}
