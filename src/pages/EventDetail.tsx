import { Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { type EventBoardDetailsResponse, getEventBoardDetails } from '../backend';
import { FixedLoader } from '../components/FixedLoader.tsx';
import { colors } from '../custom/globalStyles.ts';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';

export default function EventDetail() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [detail, setdetail] = useState<EventBoardDetailsResponse | null>(null);

  const fetchDetail = async (id: number) => {
    const response = await getEventBoardDetails(id);

    setdetail(response);
  };

  useEffect(() => {
    const id = Number(paramId);
    if (isNaN(id)) {
      alert('잘못된 접근입니다.');
      navigate('/events', { replace: true });
      return;
    }

    fetchDetail(id);
  }, [paramId]);

  if (!detail) {
    return <FixedLoader />;
  }

  return (
    <Stack>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
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
        <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
          {detail.boardPostDetail.title}
        </Typography>
        <Typography variant='normalTextR' sx={{ color: colors.gray80 }}>
          {detail.description}
        </Typography>
        <Typography variant='smallTextR' sx={{ color: colors.gray50 }}>
          {formatYyyyMmDd(detail.eventStartDate)} ~ {formatYyyyMmDd(detail.eventEndDate)} | 조회수{' '}
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
    </Stack>
  );
}
