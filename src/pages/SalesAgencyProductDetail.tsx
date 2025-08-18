import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getSalesAgencyProductDetails, type SalesAgencyProductDetailsResponse } from '../backend';
import { FixedLoader } from '../components/FixedLoader.tsx';
import { colors } from '../custom/globalStyles.ts';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';
import { mockBoolean } from '../utils/mock.ts';

export default function SalesAgencyProductDetail() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<SalesAgencyProductDetailsResponse | null>(null);

  const fetchDetail = async (id: number) => {
    const response = await getSalesAgencyProductDetails(id);

    setDetail(response);
  };

  useEffect(() => {
    const id = Number(paramId);
    if (isNaN(id)) {
      alert('잘못된 접근입니다.');
      navigate('sales-agency-products', { replace: true });
      return;
    }

    fetchDetail(id);
  }, [paramId]);

  if (!detail) {
    return <FixedLoader />;
  }

  const isApplied = mockBoolean();

  return (
    <Stack>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        영업대행상품
      </Typography>

      <Stack
        gap='5px'
        sx={{
          width: '912px',
          padding: '20px',
          marginTop: '30px',
          borderTop: `1px solid ${colors.gray50}`,
        }}
      >
        <Typography variant='normalTextB' sx={{ color: colors.gray80 }}>
          {detail.clientName}
        </Typography>
        <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
          {detail.productName}
        </Typography>
        <Typography variant='smallTextR' sx={{ color: colors.gray50 }}>
          {formatYyyyMmDd(detail.startDate)} ~ {formatYyyyMmDd(detail.endDate)} | 조회수{' '}
          {detail.boardPostDetail.viewsCount.toLocaleString()}
        </Typography>
      </Stack>

      <Stack
        sx={{
          width: '912px',
          padding: '50px 20px',
        }}
      >
        {detail.boardPostDetail.content}
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
        <Button
          variant='contained'
          disabled={isApplied}
          sx={{
            width: '287px',
            height: '49px',
            backgroundColor: !isApplied ? colors.vividViolet : colors.gray50,
          }}
        >
          {!isApplied ? '영업대행 신청하기' : '영업대행 신청완료'}
        </Button>
      </Box>
    </Stack>
  );
}
