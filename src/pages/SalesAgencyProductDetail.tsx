import { Box, Button, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { getSalesAgencyProductDetails, type SalesAgencyProductDetailsResponse } from '../backend';
import { FixedLoader } from '../components/FixedLoader.tsx';
import { colors, typography } from '../globalStyles';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';
import { mockBoolean } from '../utils/mock.ts';

export default function SalesAgencyProductDetail() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<SalesAgencyProductDetailsResponse | null>(null);

  const fetchData = async (id: number) => {
    const response = await getSalesAgencyProductDetails(id);

    setData(response);
  };

  useEffect(() => {
    const id = Number(paramId);
    if (isNaN(id)) {
      alert('잘못된 접근입니다.');
      navigate('/customer-service/notice', { replace: true });
      return;
    }

    fetchData(id);
  }, [paramId]);

  if (!data) {
    return <FixedLoader />;
  }

  const isApplied = mockBoolean();

  return (
    <Stack>
      <Typography
        sx={{
          ...typography.heading3M,
          color: colors.gray80,
        }}
      >
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
        <Typography sx={{ ...typography.normalTextB, color: colors.gray80 }}>{data.clientName}</Typography>
        <Typography sx={{ ...typography.heading4B, color: colors.gray80 }}>{data.productName}</Typography>
        <Typography sx={{ ...typography.smallTextR, color: colors.gray50 }}>
          {formatYyyyMmDd(data.startDate)} ~ {formatYyyyMmDd(data.endDate)} | 조회수 {data.boardPostDetail.viewsCount.toLocaleString()}
        </Typography>
      </Stack>

      <Stack
        sx={{
          width: '912px',
          padding: '50px 20px',
        }}
      >
        {data.boardPostDetail.content}
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
