import { Box, Card, CardContent, Chip, Grid, Pagination, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router';

const ProductCard = styled(Card)({
  backgroundColor: '#fff',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
});

const ProductImage = styled(Box)({
  width: '100%',
  height: '180px',
  backgroundColor: '#e0e0e0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#666',
  fontSize: '14px',
});

const StatusChip = styled(Chip)(({ status }) => ({
  position: 'absolute',
  top: '12px',
  right: '12px',
  fontSize: '12px',
  fontWeight: 500,
  ...(status === 'active' && {
    backgroundColor: '#4caf50',
    color: '#fff',
  }),
  ...(status === 'ended' && {
    backgroundColor: '#424242',
    color: '#fff',
  }),
}));

const mockProducts = [
  {
    id: 1,
    clientName: '리버스 클리닉',
    productName: '병원경영 & 마케팅',
    startDate: '2025-06-10',
    endDate: '2025-06-30',
    status: 'active',
    thumbnailUrl: null,
  },
  {
    id: 2,
    clientName: '리버스 클리닉',
    productName: '병원경영 & 마케팅',
    startDate: '2025-06-10',
    endDate: '2025-06-30',
    status: 'active',
    thumbnailUrl: null,
  },
  {
    id: 3,
    clientName: '리버스 클리닉',
    productName: '병원경영 & 마케팅',
    startDate: '2025-06-10',
    endDate: '2025-06-30',
    status: 'active',
    thumbnailUrl: null,
  },
  {
    id: 4,
    clientName: '위탁사명',
    productName: '영업대행상품 상품명 노출',
    startDate: '2025-06-10',
    endDate: '2025-06-30',
    status: 'ended',
    thumbnailUrl: null,
  },
  {
    id: 5,
    clientName: '위탁사명',
    productName: '영업대행상품 상품명 노출',
    startDate: '2025-06-10',
    endDate: '2025-06-30',
    status: 'ended',
    thumbnailUrl: null,
  },
];

export default function SalesAgencyProductList() {
  return (
    <Box>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        영업대행상품
      </Typography>

      <Grid container spacing={3}>
        {mockProducts.map(product => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <ProductCard component={RouterLink} to={`/sales-agency/products/${product.id}`} sx={{ textDecoration: 'none' }}>
              <Box sx={{ position: 'relative' }}>
                <ProductImage>
                  {product.thumbnailUrl ? (
                    <img
                      src={product.thumbnailUrl}
                      alt={product.productName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Typography variant='body2' sx={{ color: '#999' }}>
                      상품 이미지
                    </Typography>
                  )}
                </ProductImage>
                {product.status === 'ended' && <StatusChip label='종료' size='small' status='ended' />}
              </Box>
              <CardContent sx={{ p: 3 }}>
                <Typography
                  variant='h6'
                  sx={{
                    fontWeight: 'bold',
                    color: '#333',
                    mb: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {product.clientName}
                </Typography>
                <Typography
                  variant='body2'
                  sx={{
                    color: '#666',
                    mb: 2,
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {product.productName}
                </Typography>
                <Typography variant='caption' sx={{ color: '#999', fontSize: '13px' }}>
                  {product.startDate} ~ {product.endDate}
                </Typography>
              </CardContent>
            </ProductCard>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <Pagination
          count={10}
          page={1}
          showFirstButton
          showLastButton
          sx={{
            '& .MuiPaginationItem-root': {
              fontSize: '14px',
            },
            '& .Mui-selected': {
              backgroundColor: '#6B3AA0 !important',
              color: '#fff',
            },
          }}
        />
      </Box>
    </Box>
  );
}
