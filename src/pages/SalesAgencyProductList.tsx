import { getSalesAgencyProducts, type SalesAgencyProductSummaryResponse } from '@/backend';
import { MedipandaPagination } from '@/custom/components/MedipandaPagination';
import { LazyImage } from '@/lib/components/LazyImage';
import { useSearchParamsOrDefault } from '@/lib/hooks/useSearchParamsOrDefault';
import { setUrlParams } from '@/lib/utils/url';
import { colors } from '@/themes';
import { DateUtils, DATEFORMAT_YYYY_MM_DD } from '@/lib/utils/dateFormat';
import { Box, PaginationItem, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export default function SalesAgencyProductList() {
  const [contents, setContents] = useState<SalesAgencyProductSummaryResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const initialSearchParams = {
    page: '1',
  };

  const { page: paramPage } = useSearchParamsOrDefault(initialSearchParams);
  const page = Number(paramPage);
  const pageSize = 10;

  const fetchContents = async () => {
    try {
      const response = await getSalesAgencyProducts({
        page: page - 1,
        size: pageSize,
      });

      setContents(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch sales agency product list:', error);
      alert('영업대행상품 목록을 불러오는 중 오류가 발생했습니다.');
      setContents([]);
      setTotalPages(0);
    }
  };

  useEffect(() => {
    fetchContents();
  }, [page]);

  return (
    <>
      <Typography variant='headingPc3M' sx={{ color: colors.gray80 }}>
        영업대행상품
      </Typography>

      <Stack
        sx={{
          marginTop: '30px',
        }}
      >
        {contents.map(salesAgencyProduct => (
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
              {DateUtils.isExpired(DateUtils.utcToKst(new Date(salesAgencyProduct.endAt))) && (
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
                {DateUtils.parseUtcAndFormatKst(salesAgencyProduct.startAt, DATEFORMAT_YYYY_MM_DD)} ~{' '}
                {DateUtils.parseUtcAndFormatKst(salesAgencyProduct.endAt, DATEFORMAT_YYYY_MM_DD)}
              </Typography>
            </Stack>
          </Stack>
        ))}
      </Stack>

      <MedipandaPagination
        count={totalPages}
        page={page}
        showFirstButton
        showLastButton
        renderItem={item => <PaginationItem {...item} component={RouterLink} to={setUrlParams({ page: item.page }, initialSearchParams)} />}
        sx={{
          alignSelf: 'center',
          marginTop: '40px',
        }}
      />
    </>
  );
}
