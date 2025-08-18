import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';
import { type BoardDetailsResponse, getBoardDetails } from '../backend';
import { FixedLoader } from '../components/FixedLoader.tsx';
import { colors, typography } from '../custom/globalStyles.ts';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';

export default function NoticeDetail() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<BoardDetailsResponse | null>(null);

  const fetchDetail = async (id: number) => {
    const response = await getBoardDetails(id);

    setDetail(response);
  };

  useEffect(() => {
    const id = Number(paramId);
    if (isNaN(id)) {
      alert('잘못된 접근입니다.');
      navigate('/customer-service/notice', { replace: true });
      return;
    }

    fetchDetail(id);
  }, [paramId]);

  if (!detail) {
    return <FixedLoader />;
  }

  return (
    <Stack alignItems='center'>
      <Box sx={{ width: '100%' }}>
        <Typography variant='heading3M' sx={{ color: colors.gray80, mb: '30px' }}>
          공지사항
        </Typography>
      </Box>

      <Stack
        direction='row'
        alignItems='center'
        sx={{
          width: '100%',
          marginTop: '30px',
        }}
      >
        <Typography variant='mediumTextB' sx={{ color: colors.gray50, marginLeft: 'auto' }}>
          {detail.noticeProperties?.noticeType} 공지
        </Typography>
      </Stack>

      <Stack
        gap='5px'
        sx={{
          width: '100%',
          padding: '20px',
          marginTop: '20px',
          borderTop: `1px solid ${colors.gray50}`,
          boxSizing: 'border-box',
        }}
      >
        <Typography variant='normalTextB' sx={{ color: colors.gray80 }}>
          {detail.noticeProperties?.noticeType}
        </Typography>
        <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
          {detail.title}
        </Typography>
        <Typography variant='smallTextR' sx={{ color: colors.gray50 }}>
          {formatYyyyMmDd(detail.createdAt)} | 조회수 {detail.viewsCount.toLocaleString()}
        </Typography>
      </Stack>

      {detail.attachments && detail.attachments.length > 0 && (
        <Stack
          sx={{
            width: '100%',
            padding: '15px 20px',
            backgroundColor: colors.gray30,
            boxSizing: 'border-box',
          }}
        >
          {detail.attachments.map((file, index) => (
            <Link
              key={index}
              component={RouterLink}
              to={file.fileUrl}
              target='_blank'
              style={{
                ...typography.largeTextR,
              }}
            >
              {new URL(file.fileUrl).pathname.split('/').pop()}
            </Link>
          ))}
        </Stack>
      )}

      <Box
        sx={{
          width: '100%',
          padding: '50px 20px',
          boxSizing: 'border-box',
        }}
      >
        {detail.content}
      </Box>

      <Box>
        <Button
          variant='outlined'
          component={RouterLink}
          to='/customer-service/notice'
          sx={{
            width: '160px',
            height: '50px',
            borderColor: colors.navy,
            color: colors.navy,
          }}
        >
          목록
        </Button>
      </Box>
    </Stack>
  );
}
