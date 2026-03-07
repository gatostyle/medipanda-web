import { normalizeBusinessNumber } from '@/lib/utils/form';
import { useMpModal } from '@/hooks/useMpModal';
import { type Sequenced, withSequence } from '@/lib/utils/withSequence';
import { PercentUtils } from '@/utils/PercentUtils';
import {
  Box,
  Card,
  CircularProgress,
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
} from '@mui/material';
import { ArrowLeft } from 'iconsax-reactjs';
import {
  getSettlement,
  getSettlementPartnerProducts,
  getSettlementPartner,
  type SettlementPartnerProductResponse,
  type SettlementPartnerResponse,
  type SettlementResponse,
} from '@/backend';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link as RouterLink } from 'react-router-dom';

export default function MpAdminSettlementPartnerDetail() {
  const navigate = useNavigate();
  const { settlementId: paramSettlementId, settlementPartnerId: paramSettlementPartnerId } = useParams();
  const settlementId = Number(paramSettlementId);
  const settlementPartnerId = Number(paramSettlementPartnerId);

  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<SettlementResponse | null>(null);
  const [partnerDetail, setPartnerDetail] = useState<SettlementPartnerResponse | null>(null);
  const [partnerProducts, setPartnerProducts] = useState<Sequenced<SettlementPartnerProductResponse>[]>([]);

  const { alertError } = useMpModal();

  const fetchDetail = async (settlementId: number, settlementPartnerId: number) => {
    if (Number.isNaN(settlementId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/settlements');
    }

    if (Number.isNaN(settlementPartnerId)) {
      await alertError('잘못된 접근입니다.');
      return navigate('/admin/settlements');
    }

    try {
      setLoading(true);
      const [detail, partnerDetail, partnerProducts] = await Promise.all([
        getSettlement(settlementId),
        getSettlementPartner(settlementPartnerId),
        getSettlementPartnerProducts(settlementPartnerId),
      ]);

      setDetail(detail);
      setPartnerDetail(partnerDetail);
      setPartnerProducts(withSequence(partnerProducts));
    } catch (error) {
      console.error('Failed to load data:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
      return window.history.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail(settlementId, settlementPartnerId);
  }, [settlementId, settlementPartnerId]);

  if (loading) {
    return (
        <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
          <CircularProgress />
        </Box>
    );
  }

  if (detail === null) {
    return null;
  }

  if (!partnerDetail) {
    return null;
  }

  return (
      <Stack sx={{ gap: 3 }}>
        <Stack direction='row' alignItems='center' spacing={2}>
          <IconButton component={RouterLink} to={`/admin/settlements/${settlementId}`} sx={{ width: '24px', height: '24px', padding: 0 }}>
            <ArrowLeft size={24} />
          </IconButton>
          <Typography variant='h4'>거래처별 제품상세</Typography>
        </Stack>

        <Card sx={{ padding: 3 }}>
          <Stack sx={{ gap: 3 }}>
            <Stack direction='row' sx={{ gap: 3 }}>
              <TextField
                  label='딜러명'
                  value={partnerDetail.dealerName}
                  fullWidth
                  size='small'
                  InputProps={{
                    readOnly: true,
                  }}
              />
              <TextField
                  label='거래처코드'
                  value={partnerDetail.institutionCode}
                  fullWidth
                  size='small'
                  InputProps={{
                    readOnly: true,
                  }}
              />
              <TextField
                  label='거래처명'
                  value={partnerDetail.institutionName}
                  fullWidth
                  size='small'
                  InputProps={{
                    readOnly: true,
                  }}
              />
            </Stack>
            <Stack direction='row' sx={{ gap: 3 }}>
              <TextField
                  label='사업자등록번호'
                  value={normalizeBusinessNumber(partnerDetail.businessNumber)}
                  fullWidth
                  size='small'
                  InputProps={{
                    readOnly: true,
                  }}
              />
              <TextField
                  label='정산월'
                  value={detail.settlementMonth}
                  fullWidth
                  size='small'
                  InputProps={{
                    readOnly: true,
                  }}
              />
              <TextField
                  label='처방금액'
                  value={partnerProducts
                      .reduce((sum, item) => sum + (item.prescriptionAmount ?? 0), 0)
                      .toLocaleString()}
                  fullWidth
                  size='small'
                  InputProps={{
                    readOnly: true,
                  }}
              />
            </Stack>
          </Stack>
        </Card>

        <Card sx={{ padding: 3, marginTop: 3 }}>
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell width={60}>No</TableCell>
                  <TableCell width={120}>보험코드</TableCell>
                  <TableCell width={150}>제품명</TableCell>
                  <TableCell width={140}>표준코드</TableCell>
                  <TableCell width={80}>수량</TableCell>
                  <TableCell width={100}>약가</TableCell>
                  <TableCell width={120}>처방금액</TableCell>
                  <TableCell width={120}>기본수수료율</TableCell>
                  <TableCell width={120}>거래수수료율</TableCell>
                  <TableCell width={120}>수수료 금액</TableCell>
                  <TableCell width={200}>비고</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {partnerProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align='center' sx={{ py: 3 }}>
                        <Typography variant='body2' color='text.secondary'>
                          검색 결과가 없습니다.
                        </Typography>
                      </TableCell>
                    </TableRow>
                ) : (
                    partnerProducts.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>{item.sequence}</TableCell>
                          <TableCell>{item.productCode}</TableCell>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell>{item.productCode}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{item.unitPrice?.toLocaleString() ?? '-'}</TableCell>
                          <TableCell>{item.prescriptionAmount?.toLocaleString() ?? '-'}</TableCell>
                          <TableCell>{item.feeRate !== null ? PercentUtils.formatDecimal(item.feeRate) + '%' : '-'}</TableCell>
                          <TableCell>{item.extraFeeRate !== null ? PercentUtils.formatDecimal(item.extraFeeRate) + '%' : '-'}</TableCell>
                          <TableCell>{item.feeAmount?.toLocaleString() ?? '-'}</TableCell>
                          <TableCell>{item.note ?? '-'}</TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Stack>
  );
}
