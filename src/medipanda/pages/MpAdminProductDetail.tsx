import { Box, Button, Card, Checkbox, CircularProgress, FormControlLabel, Grid, Stack, Typography } from '@mui/material';
import { getProductDetails, ProductDetailsResponse } from '@/medipanda/backend';
import { TiptapEditor } from '@/medipanda/components/TiptapEditor';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function MpAdminProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [productDetail, setProductDetail] = useState<ProductDetailsResponse | null>(null);

  useEffect(() => {
    if (id) {
      fetchData(parseInt(id, 10));
    }
  }, [id]);

  const fetchData = async (productId: number) => {
    setLoading(true);
    try {
      const response = await getProductDetails(productId);
      setProductDetail(response);
    } catch (error) {
      console.error('Failed to fetch product detail:', error);
      enqueueSnackbar('데이터를 불러오는데 실패했습니다.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  const handleEdit = () => {
    navigate(`/admin/products/${id}/edit`);
  };

  if (loading) {
    return (
      <Box display='flex' justifyContent='center' alignItems='center' minHeight='400px'>
        <CircularProgress />
      </Box>
    );
  }

  if (!productDetail) {
    return null;
  }

  const getChangedRateDisplay = () => {
    if (productDetail.changedFeeRate && productDetail.changedMonth) {
      return `${productDetail.changedFeeRate}% / ${productDetail.changedMonth}`;
    } else if (productDetail.changedFeeRate) {
      return `${productDetail.changedFeeRate}%`;
    }
    return '-';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant='h4' gutterBottom sx={{ mb: 3 }}>
        제품정보
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom sx={{ mb: 3 }}>
              제품정보
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  제약사
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>{productDetail.manufacturer}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  제품명
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>{productDetail.productName}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  성분명
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>{productDetail.composition}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  제품코드
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>{productDetail.productCode}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  약가
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>
                  {productDetail.price !== null && productDetail.price !== undefined
                    ? `${productDetail.price.toLocaleString()}원${productDetail.productCode !== '비급여' ? ' (급여)' : ''}`
                    : '-'}
                </Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  기본수수료율
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>
                  {productDetail.feeRate !== null && productDetail.feeRate !== undefined ? `${productDetail.feeRate}%` : '-'}
                </Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  변경요율/변경월
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>{getChangedRateDisplay()}</Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  상태
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Box>
                  <FormControlLabel control={<Checkbox checked={productDetail.isAcquisition ?? undefined} disabled />} label='취급품목' />
                  <FormControlLabel control={<Checkbox checked={productDetail.isPromotion ?? undefined} disabled />} label='프로모션' />
                  <FormControlLabel control={<Checkbox checked={productDetail.isOutOfStock ?? undefined} disabled />} label='품절' />
                  <FormControlLabel control={<Checkbox checked={productDetail.isStopSelling ?? undefined} disabled />} label='판매중단' />
                </Box>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  비고
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1' style={{ whiteSpace: 'pre-wrap' }}>
                  {productDetail.note}
                </Typography>
              </Grid>

              <Grid item xs={2}>
                <Typography variant='subtitle2' color='text.secondary'>
                  대체가능의약품
                </Typography>
              </Grid>
              <Grid item xs={10}>
                <Typography variant='body1'>{productDetail.alternativeProducts.join(', ')}</Typography>
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card sx={{ p: 3 }}>
            <Typography variant='h6' gutterBottom sx={{ mb: 3 }}>
              상세 정보
            </Typography>

            <TiptapEditor content={productDetail.boardDetailsResponse.content} readOnly={true} />
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Stack direction='row' spacing={2} justifyContent='center'>
            <Button variant='outlined' size='large' onClick={handleCancel} sx={{ minWidth: 120 }}>
              취소
            </Button>
            <Button variant='contained' color='success' size='large' onClick={handleEdit} sx={{ minWidth: 120 }}>
              수정
            </Button>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
