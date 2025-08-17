import { Box, Button, Link, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useParams } from 'react-router';
import { type BoardDetailsResponse, getBoardDetails } from '../backend';
import { FixedLoader } from '../components/FixedLoader.tsx';
import { colors, typography } from '../globalStyles';
import { formatYyyyMmDd } from '../utils/dateFormat.ts';

export default function NoticeDetail() {
  const { id: paramId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<BoardDetailsResponse | null>(null);

  const fetchData = async (id: number) => {
    const response = await getBoardDetails(id);

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

  return (
    <Stack alignItems='center'>
      <Box sx={{ width: '100%' }}>
        <Typography
          sx={{
            ...typography.heading3M,
            color: colors.gray80,
            mb: '30px',
          }}
        >
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
        <Typography
          sx={{
            ...typography.mediumTextB,
            color: colors.gray50,
            marginLeft: 'auto',
          }}
        >
          {data.noticeProperties?.noticeType} 공지
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
        <Typography sx={{ ...typography.normalTextB, color: colors.gray80 }}>{data.noticeProperties?.noticeType}</Typography>
        <Typography sx={{ ...typography.heading4B, color: colors.gray80 }}>{data.title}</Typography>
        <Typography sx={{ ...typography.smallTextR, color: colors.gray50 }}>
          {formatYyyyMmDd(data.createdAt)} | 조회수 {data.viewsCount.toLocaleString()}
        </Typography>
      </Stack>

      {data.attachments && data.attachments.length > 0 && (
        <Stack
          sx={{
            width: '100%',
            padding: '15px 20px',
            backgroundColor: colors.gray30,
            boxSizing: 'border-box',
          }}
        >
          {data.attachments.map((file, index) => (
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
        {data.content}
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
