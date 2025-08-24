import { getSalesAgencyProducts } from '@/backend';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { LazyImage } from '@/lib/react/LazyImage';
import { usePageFetchFormik } from '@/lib/react/usePageFetchFormik';
import { colors } from '@/themes';
import { formatYyyyMmDd, isExpired } from '@/lib/dateFormat';
import { Box, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router';

export default function SalesAgencyProductList() {
  const {
    content: page,
    pageCount: totalPages,
    formik: pageFormik,
  } = usePageFetchFormik({
    fetcher: values => {
      return getSalesAgencyProducts({
        page: values.pageIndex,
        size: values.pageSize,
      });
    },
    contentSelector: response => response.content,
    pageCountSelector: response => response.totalPages,
    initialContent: [],
  });

  return (
    <>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        영업대행상품
      </Typography>

      <Stack
        sx={{
          marginTop: '30px',
        }}
      >
        {page.map(salesAgencyProduct => (
          <Stack
            key={salesAgencyProduct.id}
            direction='row'
            component={RouterLink}
            to={`/sales-agency-products/${salesAgencyProduct.id}`}
            sx={{
              textDecoration: 'none',
            }}
          >
            <Box
              sx={{
                position: 'relative',
                marginBottom: '20px',
              }}
            >
              <LazyImage
                src={salesAgencyProduct.thumbnailUrl!}
                width='300px'
                height='150px'
                style={{
                  borderRadius: '10px',
                }}
              />
              {isExpired(salesAgencyProduct.endAt) && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.gray80,
                    opacity: 0.8,
                    borderRadius: '10px',
                  }}
                >
                  <Typography variant='heading4B' sx={{ color: colors.white }}>
                    종료
                  </Typography>
                </Box>
              )}
            </Box>
            <Stack
              sx={{
                flexGrow: 1,
                padding: '24px 20px',
                marginLeft: '30px',
                borderWidth: '1px 0',
                borderStyle: 'solid',
                borderColor: colors.gray50,
              }}
            >
              <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
                {salesAgencyProduct.clientName}
              </Typography>
              <Typography variant='largeTextM' sx={{ color: colors.gray80 }}>
                {salesAgencyProduct.productName}
              </Typography>
              <Typography variant='smallTextR' sx={{ color: colors.gray50, marginTop: 'auto' }}>
                {formatYyyyMmDd(salesAgencyProduct.startAt)} ~ {formatYyyyMmDd(salesAgencyProduct.endAt)}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>

      <MedipandaPagination
        count={totalPages}
        page={pageFormik.values.pageIndex + 1}
        showFirstButton
        showLastButton
        onChange={(_, page) => {
          pageFormik.setFieldValue('pageIndex', page - 1);
        }}
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      />
    </>
  );
}
