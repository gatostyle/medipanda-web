import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  IconButton,
  Paper,
  Grid
} from '@mui/material';
import { ArrowLeft } from 'iconsax-react';
import { MpSettlementBusinessPartnerDetail, mpFetchSettlementBusinessPartnerDetail } from 'api-definitions/MpSettlement';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

export default function MpAdminSettlementBusinessPartnerDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [businessPartner, setBusinessPartner] = useState<MpSettlementBusinessPartnerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showError } = useMpErrorDialog();

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await mpFetchSettlementBusinessPartnerDetail(parseInt(id));
        setBusinessPartner(response);
      } catch (error) {
        console.error('Failed to fetch business partner detail:', error);
        showError('사업자 파트너 상세 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          데이터를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  if (!businessPartner) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          데이터를 찾을 수 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            mr: 2,
            bgcolor: '#F3F4F6',
            '&:hover': { bgcolor: '#E5E7EB' }
          }}
        >
          <ArrowLeft size="20" />
        </IconButton>
        <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600 }}>
          거래처별 제품상세
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              딜러명: {businessPartner.agentName}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              처방코드: {businessPartner.prescriptionCode}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              거래처명: {businessPartner.businessPartnerName}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              사업자등록번호: {businessPartner.businessRegistrationNumber}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              처방월: {businessPartner.prescriptionMonth}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              정산월: {businessPartner.settlementMonth}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              처방금액: {businessPartner.prescriptionAmount.toLocaleString()}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#F9FAFB' }}>
            <TableRow>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                No
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                보험코드
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                제품명
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                규격
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                수량
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                보험가
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                이전단위
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                기본수수료율
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                수수료금액
              </TableCell>
              <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                비고
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {businessPartner.products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#6B7280' }}>
                    제품 데이터가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              businessPartner.products.map((product, index) => (
                <TableRow key={product.id} hover>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      value={product.insuranceCode}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      value={product.productName}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      value={product.specification}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      value={product.quantity}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      value={product.insurancePrice}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      value={product.previousUnit}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      value={product.basicCommissionRate}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      value={product.commissionAmount.toLocaleString()}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB'
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      size="small"
                      value={product.remarks}
                      InputProps={{ readOnly: true }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB'
                        }
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{
            minWidth: '100px',
            height: '40px',
            borderRadius: '8px',
            borderColor: '#9CA3AF',
            color: '#374151',
            fontSize: '14px',
            fontWeight: 500,
            '&:hover': {
              borderColor: '#6B7280',
              backgroundColor: '#F9FAFB'
            }
          }}
        >
          취소
        </Button>
      </Box>
    </Box>
  );
}
