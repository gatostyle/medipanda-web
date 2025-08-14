import { GetApp } from '@mui/icons-material';
import { Box, Button, Chip, Link, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useParams } from 'react-router';

const ContentArea = styled(Box)({
  backgroundColor: '#fff',
  borderRadius: '8px',
  padding: '32px',
  border: '1px solid #e0e0e0',
});

const FileDownloadLink = styled(Link)({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '4px',
  color: '#6B3AA0',
  textDecoration: 'underline',
  fontSize: '14px',
  cursor: 'pointer',
  '&:hover': {
    textDecoration: 'underline',
  },
});

export default function NoticeDetail() {
  const { id } = useParams();

  const mockNotice = {
    id: Number(id),
    category: '동구바이오',
    title: '[품질] 휴비스트제약- 품질 및 관리 품목 안내',
    content: `품질 및 관리 품목 안내드립니다

하기 품목과 간순니다.

감사합니다.`,
    createdAt: '25-04-01 10:36',
    viewCount: 1250,
    attachments: [
      {
        fileName: '엑셀파일.xls',
        fileUrl: '/mock-excel-file.xls',
      },
    ],
  };

  return (
    <Box>
      <Typography variant='body2' sx={{ mb: 2, color: '#666' }}>
        메디판다 공지
      </Typography>

      <ContentArea>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Chip
              label={mockNotice.category}
              size='small'
              sx={{
                backgroundColor: '#6B3AA0',
                color: '#fff',
                fontSize: '12px',
                height: '24px',
              }}
            />
            <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#333' }}>
              {mockNotice.title}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
            <Typography variant='body2' sx={{ color: '#666' }}>
              {mockNotice.createdAt}
            </Typography>
            <Typography variant='body2' sx={{ color: '#666' }}>
              조회수 {mockNotice.viewCount.toLocaleString()}
            </Typography>
          </Box>

          {mockNotice.attachments && mockNotice.attachments.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {mockNotice.attachments.map((file, index) => (
                <FileDownloadLink key={index} href={file.fileUrl} download>
                  <GetApp sx={{ fontSize: '16px' }} />
                  {file.fileName}
                </FileDownloadLink>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 4, minHeight: '200px' }}>
          <Typography
            variant='body1'
            sx={{
              lineHeight: 1.8,
              color: '#333',
              whiteSpace: 'pre-line',
            }}
          >
            {mockNotice.content}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            component={RouterLink}
            to='/customer-service/notice'
            variant='outlined'
            sx={{
              padding: '12px 32px',
              borderColor: '#e0e0e0',
              color: '#666',
              '&:hover': {
                borderColor: '#6B3AA0',
                color: '#6B3AA0',
              },
            }}
          >
            목록
          </Button>
        </Box>
      </ContentArea>
    </Box>
  );
}
