import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';
import { ArrowLeft, Edit } from 'iconsax-react';
import { MpBusinessPartnerDetail, mpFetchBusinessPartnerDetail } from 'api-definitions/MpAdjustment';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';

export default function MpAdminAdjustmentBusinessPartnerDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [businessPartner, setBusinessPartner] = useState<MpBusinessPartnerDetail | null>(null);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          const response = await mpFetchBusinessPartnerDetail(parseInt(id));
          setBusinessPartner(response);
        } catch (error) {
          console.error('Failed to fetch business partner detail:', error);
          showError('사업자 파트너 상세 정보를 불러오는 중 오류가 발생했습니다.');
        }
      }
    };

    fetchData();
  }, [id]);

  if (!businessPartner) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          데이터를 불러오는 중...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, p: 1 }}>
          <ArrowLeft size="24" color="#374151" />
        </IconButton>
        <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600 }}>
          거래처별 제품상세
        </Typography>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 600, mb: 2 }}>
          거래처 정보
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                거래처명
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {businessPartner.businessPartnerName}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                사업자등록번호
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {businessPartner.businessRegistrationNumber}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                대표자명
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {businessPartner.representative}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 0.5 }}>
                연락처
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {businessPartner.contactNumber}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontSize: '18px', fontWeight: 600 }}>
            제품 정보
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => openNotImplementedDialog('취소')}
              sx={{
                borderColor: '#D1D5DB',
                color: '#6B7280',
                borderRadius: '6px',
                px: 3,
                '&:hover': {
                  borderColor: '#9CA3AF',
                  backgroundColor: '#F9FAFB'
                }
              }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              startIcon={<Edit size="16" />}
              onClick={() => openNotImplementedDialog('수정')}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '6px',
                px: 3,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              수정
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: '#F9FAFB' }}>
              <TableRow>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  No
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  제품명
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  단가
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  수량
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  총금액
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600, fontSize: '14px', color: '#374151' }}>
                  메모
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {businessPartner.products.map((product, index) => (
                <TableRow key={index} hover>
                  <TableCell align="center">{index + 1}</TableCell>
                  <TableCell align="center">
                    <TextField
                      value={product.productName}
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB',
                          '& fieldset': {
                            borderColor: '#E5E7EB'
                          },
                          '&:hover fieldset': {
                            borderColor: '#D1D5DB'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#10B981'
                          }
                        }
                      }}
                      InputProps={{
                        readOnly: true
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      value={product.unitPrice.toLocaleString()}
                      variant="outlined"
                      size="small"
                      sx={{
                        width: '120px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB',
                          '& fieldset': {
                            borderColor: '#E5E7EB'
                          },
                          '&:hover fieldset': {
                            borderColor: '#D1D5DB'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#10B981'
                          }
                        }
                      }}
                      InputProps={{
                        readOnly: true
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      value={product.quantity}
                      variant="outlined"
                      size="small"
                      sx={{
                        width: '80px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB',
                          '& fieldset': {
                            borderColor: '#E5E7EB'
                          },
                          '&:hover fieldset': {
                            borderColor: '#D1D5DB'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#10B981'
                          }
                        }
                      }}
                      InputProps={{
                        readOnly: true
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      value={product.totalAmount.toLocaleString()}
                      variant="outlined"
                      size="small"
                      sx={{
                        width: '120px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB',
                          '& fieldset': {
                            borderColor: '#E5E7EB'
                          },
                          '&:hover fieldset': {
                            borderColor: '#D1D5DB'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#10B981'
                          }
                        }
                      }}
                      InputProps={{
                        readOnly: true
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      value={product.memo || ''}
                      variant="outlined"
                      size="small"
                      sx={{
                        width: '150px',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '4px',
                          backgroundColor: '#F9FAFB',
                          '& fieldset': {
                            borderColor: '#E5E7EB'
                          },
                          '&:hover fieldset': {
                            borderColor: '#D1D5DB'
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: '#10B981'
                          }
                        }
                      }}
                      InputProps={{
                        readOnly: true
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
