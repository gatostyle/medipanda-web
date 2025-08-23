import { InquiryStatusChip } from '@/components/InquiryStatusChip';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '@/custom/components/MedipandaTab';
import { colors } from '@/themes';
import { formatYyyyMmDdHhMm } from '@/lib/dateFormat';
import { GetApp } from '@mui/icons-material';
import { Alert, Box, Button, CircularProgress, Snackbar, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router';

export default function InquiryDetail() {
  const { id: paramId } = useParams();
  const inquiryId = Number(paramId);

  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleFileDownload = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showSnackbar('파일이 성공적으로 다운로드되었습니다.', 'success');
    }, 1500);
  };

  const mockInquiry = {
    id: Number(inquiryId),
    title: '커뮤니티에서 활동중에 답글처리이 안되요',
    question: `안녕하세요
다음아니라 커뮤니티 활동중에 제가 작성한 글에 대해서
상대방이 작은 답글이 확인이 되지 않습니다.
해당 건 문의해안 요청드립니다.`,
    createdAt: '2025-04-01T10:36:00',
    status: '답변 완료',
    statusColor: colors.success,
    answer: {
      content: `안녕하세요
CSO Link 방식에 ------- 으로 확인이 되고있습니다.
감사합니다.
추가내용이 필요하시다면 고객센터로 연락주시면 감사하겠습니다.`,
      respondedAt: '2025-02-23T16:34:00',
      responder: '관리자',
    },
  };

  return (
    <>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        1:1 문의내엵
      </Typography>

      <MedipandaTabs value={0} sx={{ marginTop: '30px' }}>
        <MedipandaTab label='문의내역' />
        <MedipandaTabElse />
      </MedipandaTabs>

      <Stack
        direction='row'
        alignItems='center'
        gap='10px'
        sx={{
          padding: '20px',
          marginTop: '40px',
          borderBottom: `1px solid ${colors.gray30}`,
          boxSizing: 'border-box',
        }}
      >
        <Typography variant='heading4B' sx={{ color: colors.gray80 }}>
          {mockInquiry.title}
        </Typography>
        <InquiryStatusChip responseStatus={mockInquiry.status} />
        <Typography variant='smallTextR' sx={{ color: colors.gray50, marginLeft: 'auto' }}>
          {formatYyyyMmDdHhMm(mockInquiry.createdAt)}
        </Typography>
      </Stack>

      <Box
        sx={{
          padding: '50px 20px',
          borderBottom: `1px solid ${colors.gray30}`,
        }}
      >
        {mockInquiry.question}
      </Box>

      {mockInquiry.answer && (
        <Stack
          gap='20px'
          sx={{
            padding: '30px 40px',
            borderBottom: `1px solid ${colors.gray30}`,
            boxSizing: 'border-box',
          }}
        >
          <Stack direction='row' alignItems='center'>
            <Typography variant='heading2B' sx={{ color: colors.gray80 }}>
              문의하신 내용의 답변이 완료되었습니다.
            </Typography>
            <Typography variant='heading5B' sx={{ color: colors.gray80, marginLeft: 'auto' }}>
              관리자
            </Typography>
            <Typography variant='smallTextR' sx={{ color: colors.gray50, marginLeft: '10px' }}>
              {formatYyyyMmDdHhMm(mockInquiry.answer.respondedAt)}
            </Typography>
          </Stack>
          <Box
            sx={{
              padding: '15px 20px',
              backgroundColor: colors.gray10,
            }}
          >
            {mockInquiry.answer.content}
          </Box>
          <Box>
            <Button
              variant='contained'
              startIcon={loading ? <CircularProgress size={16} /> : <GetApp />}
              onClick={handleFileDownload}
              disabled={loading}
              sx={{
                width: '160px',
                height: '50px',
                backgroundColor: colors.navy,
                color: colors.white,
              }}
            >
              파일 다운로드
            </Button>
          </Box>
        </Stack>
      )}

      <Stack
        direction='row'
        gap='10px'
        sx={{
          marginTop: '40px',
        }}
      >
        <Button
          fullWidth
          component={RouterLink}
          to='/customer-service/inquiry'
          variant='outlined'
          sx={{
            width: '160px',
            height: '50px',
            borderColor: colors.navy,
            color: colors.navy,
          }}
        >
          목록
        </Button>
      </Stack>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
