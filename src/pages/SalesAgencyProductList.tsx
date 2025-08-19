import { Box, Stack, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { getSalesAgencyProducts, type SalesAgencyProductSummaryResponse } from '../backend';
import { LazyImage } from '../components/LazyImage.tsx';
import { MedipandaPagination } from '../custom/components/MedipandaPagination.tsx';
import { colors } from '../custom/globalStyles.ts';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';

export default function SalesAgencyProductList() {
  const [page, setPage] = useState<SalesAgencyProductSummaryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const pageFormik = useFormik({
    initialValues: {
      pageIndex: 0,
      pageSize: 5,
      totalPages: 1,
    },
    onSubmit: async () => {
      if (pageFormik.values.pageIndex !== 0) {
        await pageFormik.setFieldValue('pageIndex', 0);
      } else {
        await fetchPage();
      }
    },
  });

  const fetchPage = async () => {
    const response = await getSalesAgencyProducts({
      page: pageFormik.values.pageIndex,
      size: pageFormik.values.pageSize,
    });

    setPage(response.content);
    setTotalPages(response.totalPages);
  };

  useEffect(() => {
    pageFormik.submitForm();
  }, [pageFormik.values.pageIndex, pageFormik.values.pageSize]);

  return (
    <Stack>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        영업대행상품
      </Typography>

      <Stack
        sx={{
          marginTop: '30px',
          marginBottom: '40px',
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
              {new Date(salesAgencyProduct.endAt) < new Date() && (
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
                width: '100%',
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

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <MedipandaPagination
          count={totalPages}
          page={pageFormik.values.pageIndex + 1}
          showFirstButton
          showLastButton
          onChange={(_, page) => {
            pageFormik.setFieldValue('pageIndex', page - 1);
          }}
        />
      </Box>
    </Stack>
  );
}
