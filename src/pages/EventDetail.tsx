import { Stack, Typography } from '@mui/material';
import { useParams } from 'react-router';
import { colors, typography } from '../globalStyles';

export default function EventDetail() {
  const { id } = useParams();

  const mockEvent = {
    id: Number(id),
    title: '메디판다 그랜드 오픈이벤트!!!!!',
    description: '해당 이벤트는 메디판다 오픈기념 이벤트입니다.',
    dateRange: '2025-06-10 ~ 2025-06-30',
    viewsCount: 1260,
    benefits: [
      {
        number: '하나',
        title: '다양한 혜택제품',
        description: '다양한 혜택제품, JW 수액, 주사제, 소모품 등 병원에 필요한 제품을 원스톱 구매!',
        icon: '💊',
      },
      {
        number: '둘',
        title: '포인트 제도',
        description: '포스팀 적립 제도! 시그 가입 시 5만 포인트 지급!',
        icon: '🎁',
      },
    ],
  };

  return (
    <Stack>
      <Typography
        sx={{
          ...typography.heading3M,
          color: colors.gray80,
        }}
      >
        이벤트
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
        <Typography sx={{ ...typography.heading4B, color: colors.gray80 }}>{mockEvent.title}</Typography>
        <Typography sx={{ ...typography.normalTextR, color: colors.gray80 }}>{mockEvent.description}</Typography>
        <Typography sx={{ ...typography.smallTextR, color: colors.gray50 }}>
          {mockEvent.dateRange} | 조회수 {mockEvent.viewsCount.toLocaleString()}
        </Typography>
      </Stack>

      <Stack
        sx={{
          width: '912px',
          padding: '50px 20px',
        }}
      >
        <span>이미지</span>
      </Stack>
    </Stack>
  );
}
