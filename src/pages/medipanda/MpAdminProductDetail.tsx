import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import CircularProgress from '@mui/material/CircularProgress';
import { ExportSquare } from 'iconsax-react';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';
import { useMpErrorDialog } from 'hooks/medipanda/useMpErrorDialog';
import { MpComparisonDrug, mpFetchComparisonDrugs, mpFetchProductDetail, MpProductDetail } from 'api-definitions/MpProductDetail';

export default function MpAdminProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState(0);
  const [productDetail, setProductDetail] = useState<MpProductDetail | null>(null);
  const [comparisonDrugs, setComparisonDrugs] = useState<MpComparisonDrug[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();
  const { showError } = useMpErrorDialog();

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const [productData, drugsData] = await Promise.all([mpFetchProductDetail({ productId: parseInt(id) }), mpFetchComparisonDrugs({})]);
        setProductDetail(productData);
        setComparisonDrugs(drugsData);
      } catch (error) {
        console.error('상품 상세 조회 오류:', error);
        showError('상품 상세 정보를 조회하는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, showError]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!productDetail) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
          상품 상세
        </Typography>
        <Typography variant="body2" sx={{ color: '#6B7280' }}>
          상품 정보를 찾을 수 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ fontSize: '24px', fontWeight: 600, mb: 3 }}>
        상품 상세
      </Typography>

      <Paper sx={{ p: 3, mb: 3, borderRadius: '20px', border: '2px solid #10B981' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              성분명: {productDetail.ingredient}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              제품코드: {productDetail.code}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              상태: {productDetail.state}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              보험가: {productDetail.price}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              기본수수료: {productDetail.baseFee}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              구간수수료: {productDetail.sectionFee}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              제조사: {productDetail.manufacturer}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
              비고: {productDetail.note}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="상품 기본 정보" />
          <Tab label="비교의약품" />
        </Tabs>
      </Box>

      {activeTab === 0 && (
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                약품 이름: {productDetail.name}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                성분명: {productDetail.ingredient}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                제품코드: {productDetail.code}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                상태: {productDetail.state}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                보험가: {productDetail.price}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                기본수수료: {productDetail.baseFee}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                구간수수료: {productDetail.sectionFee}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                제조사: {productDetail.manufacturer}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" sx={{ color: '#6B7280', mb: 1 }}>
                비고: {productDetail.note}
              </Typography>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">
              검색결과: <strong>1</strong> 건
            </Typography>
            <Button
              variant="contained"
              startIcon={<ExportSquare />}
              onClick={() => openNotImplementedDialog('Excel 다운로드')}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '6px',
                px: 3,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              Excel
            </Button>
          </Box>
        </Paper>
      )}

      {activeTab === 1 && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body1">
              검색결과: <strong>{comparisonDrugs.length}</strong> 건
            </Typography>
            <Button
              variant="contained"
              startIcon={<ExportSquare />}
              onClick={() => openNotImplementedDialog('Excel 다운로드')}
              sx={{
                bgcolor: '#10B981',
                borderRadius: '6px',
                px: 3,
                '&:hover': { bgcolor: '#059669' }
              }}
            >
              Excel
            </Button>
          </Box>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: '#F9FAFB' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>약품 이름</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>성분명</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>상태</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>제조사</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonDrugs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Typography variant="body2" sx={{ color: '#6B7280' }}>
                        비교의약품 데이터가 없습니다.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  comparisonDrugs.map((drug, index) => (
                    <TableRow key={drug.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{drug.name}</TableCell>
                      <TableCell>{drug.ingredient}</TableCell>
                      <TableCell>{drug.state}</TableCell>
                      <TableCell>{drug.manufacturer}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
}
