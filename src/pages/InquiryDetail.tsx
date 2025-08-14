import { AccountCircle, GetApp } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink, useParams } from 'react-router';

const TabButton = styled(Button)({
  padding: '12px 24px',
  borderRadius: '4px 4px 0 0',
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: 500,
  border: 'none',
  '&.selected': {
    backgroundColor: '#6B3AA0',
    color: '#fff',
    borderBottom: 'none',
    '&:hover': {
      backgroundColor: '#6B3AA0',
    },
  },
  '&:not(.selected)': {
    backgroundColor: '#f8f9fa',
    color: '#666',
    borderBottom: '1px solid #e0e0e0',
    '&:hover': {
      backgroundColor: '#e9ecef',
    },
  },
});

const QuestionCard = styled(Card)({
  backgroundColor: '#f8f9fa',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  marginBottom: '16px',
});

const AnswerCard = styled(Card)({
  backgroundColor: '#fff',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  marginBottom: '24px',
});

export default function InquiryDetail() {
  const { id } = useParams();

  const mockInquiry = {
    id: Number(id),
    title: '커뮤니티에서 활동중에 답글처리이 안되요',
    question: `안녕하세요
다음아니라 커뮤니티 활동중에 제가 작성한 글에 대해서
상대방이 작은 답글이 확인이 되지 않습니다.
해당 건 문의해안 요청드립니다.`,
    createdAt: '25-04-01 10:36',
    status: '답변 완료',
    statusColor: '#4caf50',
    answer: {
      content: `안녕하세요
CSO Link 방식에 ------- 으로 확인이 되고있습니다.
감사합니다.
추가내용이 필요하시다면 고객센터로 연락주시면 감사하겠습니다.`,
      respondedAt: '2025-02-23 16:34',
      responder: '관리자',
    },
  };

  return (
    <Box>
      <Typography variant='h5' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        1:1 문의내역
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TabButton className='selected'>문의내역</TabButton>
      </Box>

      <Box sx={{ mb: 4 }}>
        <QuestionCard>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#333' }}>
                {mockInquiry.title}
              </Typography>
              <Chip
                label={mockInquiry.status}
                size='small'
                sx={{
                  backgroundColor: mockInquiry.statusColor,
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              />
            </Box>
            <Typography variant='body2' sx={{ color: '#666', mb: 3 }}>
              {mockInquiry.createdAt}
            </Typography>
            <Typography
              variant='body1'
              sx={{
                lineHeight: 1.8,
                color: '#333',
                whiteSpace: 'pre-line',
                backgroundColor: '#fff',
                padding: '16px',
                borderRadius: '4px',
                border: '1px solid #e0e0e0',
              }}
            >
              {mockInquiry.question}
            </Typography>
          </CardContent>
        </QuestionCard>

        {mockInquiry.answer && (
          <AnswerCard>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccountCircle sx={{ color: '#6B3AA0' }} />
                <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#333' }}>
                  문의하신 내용의 답변이 완료되었습니다.
                </Typography>
                <Typography variant='body2' sx={{ color: '#666', ml: 'auto' }}>
                  {mockInquiry.answer.responder} {mockInquiry.answer.respondedAt}
                </Typography>
              </Box>
              <Typography
                variant='body1'
                sx={{
                  lineHeight: 1.8,
                  color: '#333',
                  whiteSpace: 'pre-line',
                  backgroundColor: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '4px',
                  border: '1px solid #e0e0e0',
                }}
              >
                {mockInquiry.answer.content}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Button
                  variant='outlined'
                  startIcon={<GetApp />}
                  sx={{
                    borderColor: '#e0e0e0',
                    color: '#666',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#6B3AA0',
                      color: '#6B3AA0',
                    },
                  }}
                >
                  파일 다운로드
                </Button>
              </Box>
            </CardContent>
          </AnswerCard>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          component={RouterLink}
          to='/customer-service/inquiry'
          variant='outlined'
          sx={{
            padding: '12px 32px',
            borderColor: '#e0e0e0',
            color: '#666',
            textTransform: 'none',
            '&:hover': {
              borderColor: '#6B3AA0',
              color: '#6B3AA0',
            },
          }}
        >
          목록
        </Button>
      </Box>
    </Box>
  );
}
