import { ArrowBackIos, ArrowForwardIos, Create } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router';

const HeroSection = styled(Box)({
  background: 'linear-gradient(135deg, #1a237e 0%, #6B3AA0 100%)',
  borderRadius: '16px',
  padding: '48px',
  color: '#fff',
  position: 'relative',
  marginBottom: '32px',
  overflow: 'hidden',
});

const BenefitItem = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
  padding: '12px 16px',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: '8px',
  backdropFilter: 'blur(10px)',
});

const BenefitNumber = styled(Box)({
  width: '32px',
  height: '32px',
  borderRadius: '50%',
  backgroundColor: '#6B3AA0',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  marginRight: '16px',
  flexShrink: 0,
});

const PartnerCard = styled(Card)({
  backgroundColor: '#f8f9fa',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  borderRadius: '12px',
  height: '140px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
});

const CommunitySection = styled(Box)({
  backgroundColor: '#fff',
  borderRadius: '12px',
  border: '1px solid #e0e0e0',
  overflow: 'hidden',
});

const TabButton = styled(Button)({
  padding: '16px 32px',
  borderRadius: 0,
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 500,
  border: 'none',
  borderBottom: '3px solid transparent',
  '&.selected': {
    backgroundColor: 'transparent',
    color: '#6B3AA0',
    borderBottom: '3px solid #6B3AA0',
    fontWeight: 'bold',
  },
  '&:not(.selected)': {
    backgroundColor: 'transparent',
    color: '#666',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
});

const StyledTableCell = styled(TableCell)({
  padding: '16px',
  borderBottom: '1px solid #f0f0f0',
  fontSize: '14px',
});

const benefits = [
  '의약품 제품 검색으로 수수료 비교 정보를 빠르게 확인하세요.',
  'AI 문자인식(OCR)으로 처방 통계를 자동으로 입력하세요.',
  '딜러 관리 기능으로 정산 업무를 간소화하세요.',
  '제휴 업체 할인으로 오프라인 혜택을 누리세요.',
];

const mockCommunityPosts = [
  {
    id: 1,
    title: '형님들 나 한번만 도와줘ㅠ',
    commentCount: 300,
    likeCount: 100,
    author: 'CSO 합니두',
    createdAt: '3분전',
    viewCount: 100,
  },
  {
    id: 2,
    title: '형님들 나 한번만 도와줘ㅠ',
    commentCount: 300,
    likeCount: 100,
    author: 'CSO 합니두',
    createdAt: '3분전',
    viewCount: 100,
  },
  {
    id: 3,
    title: '형님들 나 한번만 도와줘ㅠ',
    commentCount: 300,
    likeCount: 100,
    author: 'CSO 합니두',
    createdAt: '3분전',
    viewCount: 100,
  },
  {
    id: 4,
    title: '형님들 나 한번만 도와줘ㅠ',
    commentCount: 300,
    likeCount: 100,
    author: 'CSO 합니두',
    createdAt: '3분전',
    viewCount: 100,
  },
  {
    id: 5,
    title: '형님들 나 한번만 도와줘ㅠ',
    commentCount: 300,
    likeCount: 100,
    author: 'CSO 합니두',
    createdAt: '3분전',
    viewCount: 100,
  },
];

export default function HomeNoContract() {
  return (
    <Box>
      <HeroSection>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant='h3' sx={{ fontWeight: 'bold', mb: 1, fontSize: '48px' }}>
              CSO A to Z
            </Typography>
            <Typography variant='h6' sx={{ mb: 4, opacity: 0.9 }}>
              CSO시작부터 매출 관리까지 한번에!
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant='h5' sx={{ mb: 3, fontWeight: 'bold' }}>
                아직 <span style={{ color: '#FFE082' }}>메디판다 파트너</span>가 아니신가요?
              </Typography>
              <Typography variant='body1' sx={{ mb: 3, opacity: 0.9 }}>
                파트너로서 아래 혜택을 누리세요.
              </Typography>

              <Box sx={{ mb: 4 }}>
                {benefits.map((benefit, index) => (
                  <BenefitItem key={index}>
                    <BenefitNumber>{index + 1}</BenefitNumber>
                    <Typography variant='body2' sx={{ lineHeight: 1.5 }}>
                      {benefit}
                    </Typography>
                  </BenefitItem>
                ))}
              </Box>

              <Button
                component={RouterLink}
                to='/request-contract'
                variant='contained'
                sx={{
                  backgroundColor: '#fff',
                  color: '#6B3AA0',
                  fontWeight: 'bold',
                  padding: '12px 32px',
                  borderRadius: '24px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: '#f5f5f5',
                  },
                }}
              >
                파트너사 계약신청하기
              </Button>
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', ml: 4 }}>
            <Typography variant='body1' sx={{ mb: 2, fontWeight: 500 }}>
              매출을 더 올리고 싶다면?
            </Typography>
            <Box
              sx={{
                width: 120,
                height: 120,
                backgroundColor: '#fff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  backgroundColor: '#000',
                  borderRadius: '4px',
                  backgroundImage:
                    'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSJibGFjayIvPgo8L3N2Zz4K")',
                }}
              />
            </Box>
            <Typography variant='caption' sx={{ opacity: 0.8 }}>
              QR코드를 스캔해주세요
            </Typography>
          </Box>
        </Box>
      </HeroSection>

      <Box sx={{ display: 'flex', gap: 4, mb: 4 }}>
        <PartnerCard sx={{ flex: 1 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant='body2' sx={{ color: '#666', mb: 1 }}>
              매출을 더 올리고 싶다면?
            </Typography>
            <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#333' }}>
              메디판다와 파트너하기
            </Typography>
          </CardContent>
        </PartnerCard>

        <Box sx={{ position: 'relative', flex: 1 }}>
          <PartnerCard sx={{ backgroundColor: '#1a237e', color: '#fff' }}>
            <CardContent sx={{ textAlign: 'center', color: '#fff' }}>
              <Typography variant='body2' sx={{ mb: 1, opacity: 0.8 }}>
                세상에서 가장 쉬운 병원 경영&마케팅
              </Typography>
              <Typography variant='h6' sx={{ fontWeight: 'bold', mb: 1 }}>
                리버스클리닉
              </Typography>
              <Typography variant='body2' sx={{ opacity: 0.8 }}>
                가맹점 모집
              </Typography>
            </CardContent>
          </PartnerCard>
          <IconButton
            sx={{
              position: 'absolute',
              left: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#fff',
              boxShadow: 2,
              '&:hover': { backgroundColor: '#f5f5f5' },
            }}
          >
            <ArrowBackIos />
          </IconButton>
          <IconButton
            sx={{
              position: 'absolute',
              right: -20,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: '#fff',
              boxShadow: 2,
              '&:hover': { backgroundColor: '#f5f5f5' },
            }}
          >
            <ArrowForwardIos />
          </IconButton>
        </Box>
      </Box>

      <CommunitySection>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex' }}>
            <TabButton className='selected'>익명게시판</TabButton>
            <TabButton>MR-CSO매칭</TabButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant='contained'
              startIcon={<Create />}
              sx={{
                backgroundColor: '#6B3AA0',
                textTransform: 'none',
                '&:hover': { backgroundColor: '#5a2d8a' },
              }}
            >
              글쓰기
            </Button>
            <Button
              variant='outlined'
              sx={{
                borderColor: '#e0e0e0',
                color: '#666',
                textTransform: 'none',
                '&:hover': { borderColor: '#6B3AA0', color: '#6B3AA0' },
              }}
            >
              더보기
            </Button>
          </Box>
        </Box>

        <TableContainer>
          <Table>
            <TableHead sx={{ backgroundColor: '#f8f9fa' }}>
              <TableRow>
                <StyledTableCell align='center' sx={{ width: '60px' }}>
                  No
                </StyledTableCell>
                <StyledTableCell sx={{ width: '40%' }}>제목</StyledTableCell>
                <StyledTableCell align='center' sx={{ width: '80px' }}>
                  댓글
                </StyledTableCell>
                <StyledTableCell align='center' sx={{ width: '80px' }}>
                  추천수
                </StyledTableCell>
                <StyledTableCell align='center' sx={{ width: '100px' }}>
                  작성자
                </StyledTableCell>
                <StyledTableCell align='center' sx={{ width: '100px' }}>
                  등록일
                </StyledTableCell>
                <StyledTableCell align='center' sx={{ width: '80px' }}>
                  조회수
                </StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {mockCommunityPosts.map((post, index) => (
                <TableRow key={post.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                  <StyledTableCell align='center'>{index + 1}</StyledTableCell>
                  <StyledTableCell>
                    <Typography
                      component={RouterLink}
                      to={`/community/anonymous/${post.id}`}
                      sx={{
                        textDecoration: 'none',
                        color: '#333',
                        '&:hover': { textDecoration: 'underline', color: '#6B3AA0' },
                      }}
                    >
                      {post.title}
                    </Typography>
                  </StyledTableCell>
                  <StyledTableCell align='center'>
                    <Chip
                      label={`${post.commentCount}개`}
                      size='small'
                      sx={{ backgroundColor: '#f0f0f0', color: '#666', fontSize: '12px' }}
                    />
                  </StyledTableCell>
                  <StyledTableCell align='center'>{post.likeCount}</StyledTableCell>
                  <StyledTableCell align='center'>{post.author}</StyledTableCell>
                  <StyledTableCell align='center'>{post.createdAt}</StyledTableCell>
                  <StyledTableCell align='center'>{post.viewCount}</StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CommunitySection>
    </Box>
  );
}
