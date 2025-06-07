import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import { SearchNormal1 } from 'iconsax-react';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { mpFetchPrescriptionProducts } from 'api-definitions/MpPrescriptionProduct';
import { mpFetchPrescriptionFormDetail, MpPrescriptionForm } from 'api-definitions/MpPrescriptionForm';

interface Product {
  id: number;
  brandCode: string;
  productName: string;
  standard: string;
  unit: string;
  guarantee: string;
  unitPrice: number;
  quantity: number;
  amount: number;
  note: string;
}

export default function MpAdminPrescriptionFormProducts() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const [prescriptionForm, setPrescriptionForm] = useState<MpPrescriptionForm | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(products.map((product) => product.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    if (checked) {
      setSelectedRows((prev) => [...prev, id]);
    } else {
      setSelectedRows((prev) => prev.filter((rowId) => rowId !== id));
    }
  };

  const handleProductChange = (id: number, field: keyof Product, value: string | number) => {
    setProducts((prev) => prev.map((product) => (product.id === id ? { ...product, [field]: value } : product)));
  };

  const handleAddRow = () => {
    console.log('행 추가');
  };

  const handleDeleteRows = () => {
    if (selectedRows.length > 0) {
      console.log('선택된 행 삭제:', selectedRows);
      setSelectedRows([]);
    }
  };

  const handleSave = () => {
    openNotImplementedDialog('저장');
  };

  const handleCancel = () => {
    navigate('/admin/prescription/forms');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const formId = parseInt(id);
        const [formData, productsData] = await Promise.all([mpFetchPrescriptionFormDetail(formId), mpFetchPrescriptionProducts({})]);

        setPrescriptionForm(formData);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        showError('데이터를 로드하는 도중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, showError]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!prescriptionForm) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
          거래처별 제품등록
        </Typography>
        <Typography>처방전 양식 정보를 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        거래처별 제품등록
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              딜러명: {prescriptionForm.businessName}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              처방처코드: {prescriptionForm.managerCode}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              거래처명: {prescriptionForm.dealerNumber}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              사업자등록번호: {prescriptionForm.businessNumber}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              처방일: {prescriptionForm.prescriptionDate}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              정산일: {prescriptionForm.settlementDate}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: 'bold' }}>
              처방금액: {prescriptionForm.prescriptionAmount.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
          <Button
            variant="contained"
            onClick={() => openNotImplementedDialog('내역 상세')}
            sx={{
              borderRadius: '20px',
              bgcolor: '#4caf50'
            }}
          >
            내역서체
          </Button>
          <Button
            variant="contained"
            onClick={handleAddRow}
            sx={{
              borderRadius: '20px',
              bgcolor: '#4caf50'
            }}
          >
            내역추가
          </Button>
          <Button
            variant="contained"
            onClick={handleDeleteRows}
            sx={{
              borderRadius: '20px',
              bgcolor: '#f44336'
            }}
          >
            선택삭제
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#f5f5f5' }}>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  checked={selectedRows.length === products.length && products.length > 0}
                  indeterminate={selectedRows.length > 0 && selectedRows.length < products.length}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                No
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                브랜드코드
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                제품명
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                규격
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                수량
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                보험가
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                이진함량
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                기본수수료율
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                수수료 금액
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                비고
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={product.id} hover>
                <TableCell padding="checkbox">
                  <Checkbox checked={selectedRows.includes(product.id)} onChange={(e) => handleSelectRow(product.id, e.target.checked)} />
                </TableCell>
                <TableCell align="center">{index + 1}</TableCell>
                <TableCell align="center">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TextField
                      size="small"
                      value={product.brandCode}
                      onChange={(e) => handleProductChange(product.id, 'brandCode', e.target.value)}
                      sx={{ width: '120px' }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => openNotImplementedDialog('상세보기')}
                      sx={{ minWidth: 'auto', p: 0.5 }}
                    >
                      <SearchNormal1 size={16} />
                    </Button>
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    value={product.productName}
                    onChange={(e) => handleProductChange(product.id, 'productName', e.target.value)}
                    sx={{ width: '150px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    value={product.standard}
                    onChange={(e) => handleProductChange(product.id, 'standard', e.target.value)}
                    sx={{ width: '100px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    value={product.unit}
                    onChange={(e) => handleProductChange(product.id, 'unit', e.target.value)}
                    sx={{ width: '80px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    value={product.guarantee}
                    onChange={(e) => handleProductChange(product.id, 'guarantee', e.target.value)}
                    sx={{ width: '100px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    value={product.unitPrice}
                    onChange={(e) => handleProductChange(product.id, 'unitPrice', Number(e.target.value))}
                    sx={{ width: '100px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    value={product.quantity}
                    onChange={(e) => handleProductChange(product.id, 'quantity', Number(e.target.value))}
                    sx={{ width: '80px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    value={product.amount}
                    onChange={(e) => handleProductChange(product.id, 'amount', Number(e.target.value))}
                    sx={{ width: '100px' }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    value={product.note}
                    onChange={(e) => handleProductChange(product.id, 'note', e.target.value)}
                    sx={{ width: '150px' }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 4 }}>
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{
            borderRadius: '20px',
            minWidth: '100px',
            color: '#666',
            borderColor: '#666'
          }}
        >
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          sx={{
            borderRadius: '20px',
            minWidth: '100px',
            bgcolor: '#4caf50'
          }}
        >
          저장
        </Button>
      </Box>
    </Box>
  );
}
