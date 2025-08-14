import { Create, Search, TrendingUp } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  List,
  ListItem,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router';
import { useState } from 'react';

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

const StyledTableHead = styled(TableHead)({
  backgroundColor: '#f8f9fa',
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: '#333',
    borderBottom: '1px solid #e0e0e0',
  },
});

const NoticeRow = styled(TableRow)({
  backgroundColor: '#fff9c4',
  '& .MuiTableCell-root': {
    borderBottom: '1px solid #fff59d',
  },
  '&:hover': {
    backgroundColor: '#fff8b8 !important',
  },
});

const SidebarCard = styled(Card)({
  backgroundColor: '#fff',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  marginBottom: '16px',
  minWidth: '300px',
});

const TrendingItem = styled(Box)({
  padding: '8px 16px',
  borderRadius: '4px',
  marginBottom: '8px',
  backgroundColor: '#f8f9fa',
  fontSize: '14px',
  color: '#333',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#e9ecef',
  },
});

const mockPosts = [
  {
    id: 1,
    title: '공지글 등록시 제목노출',
    author: '메디판다',
    createdAt: 'YY-MM-DD HH:MM',
    viewCount: 46000,
    likeCount: 332,
    commentCount: 24,
    isNotice: true,
  },
  {
    id: 2,
    title: '공지글 등록시 제목노출',
    author: '메디판다',
    createdAt: 'YY-MM-DD HH:MM',
    viewCount: 46000,
    likeCount: 332,
    commentCount: 24,
    isNotice: true,
  },
  {
    id: 3,
    title: '형님들 나 한번만 도와줘ㅠ',
    author: '익명CSO',
    createdAt: 'YY-MM-DD HH:MM',
    viewCount: 46000,
    likeCount: 332,
    commentCount: 24,
    isNotice: false,
  },
  {
    id: 4,
    title: '형님들 나 한번만 도와줘ㅠ',
    author: '익명CSO',
    createdAt: 'YY-MM-DD HH:MM',
    viewCount: 46000,
    likeCount: 332,
    commentCount: 24,
    isNotice: false,
  },
  {
    id: 5,
    title: '형님들 나 한번만 도와줘ㅠ',
    author: '익명CSO',
    createdAt: 'YY-MM-DD HH:MM',
    viewCount: 46000,
    likeCount: 332,
    commentCount: 24,
    isNotice: false,
  },
];

const trendingTopics = [
  '[노하우 공유] "이런 원장님/교수님은 이렇게 뚫었다!" 나만의 디...',
  '[성과 관리] 월초/월말, 목표 달성을 위한 나만의 영업 활동 관리법',
  '[스터디 그룹] OOO 계열 신약, 핵심 디테일링 포인트는? (논문/...',
  '[커리어 개발] CSO 경력을 발판 삼아 PM, 마케터, 본사 정규직...',
  '[슬기로운 직장생활] 실적 압박, 고객과의 갈등... 지친 마음을 달...',
  '[업무 효율 UP] "이 앱/프로그램 써보니 정말 편해요!" (동선 관...',
  '[주간 제약 동향] 이번 주 꼭 알아야 할 제약/바이오 업계 뉴스 및...',
  '[아찔했던 순간] "이것 때문에 거래처 잃을 뻔..." 나의 실패담과 ...',
  '[소소한 잡담] 오늘 점심 뭐 드셨어요? (feat. 병원 근처 맛집 공유)',
  '[소소한 잡담] 오늘 점심 뭐 드셨어요? 2탄 (feat. 병원 근처 맛집...',
];

export default function AnonymousList() {
  const [currentTab, setCurrentTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('인기순');

  return (
    <Box sx={{ display: 'flex', gap: 4 }}>
      <Box sx={{ flex: 1 }}>
        <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
          커뮤니티
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex' }}>
            <TabButton className={currentTab === 0 ? 'selected' : ''} onClick={() => setCurrentTab(0)}>
              익명게시판
            </TabButton>
            <TabButton className={currentTab === 1 ? 'selected' : ''} onClick={() => setCurrentTab(1)}>
              MR-CSO 매칭
            </TabButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant='text'
              sx={{
                color: sortBy === '인기순' ? '#6B3AA0' : '#666',
                textTransform: 'none',
                textDecoration: sortBy === '인기순' ? 'underline' : 'none',
              }}
              onClick={() => setSortBy('인기순')}
            >
              인기순
            </Button>
            <Button
              variant='text'
              sx={{
                color: sortBy === '댓글순' ? '#6B3AA0' : '#666',
                textTransform: 'none',
                textDecoration: sortBy === '댓글순' ? 'underline' : 'none',
              }}
              onClick={() => setSortBy('댓글순')}
            >
              댓글순
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box />
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
              MY 내 글
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ boxShadow: 'none', border: '1px solid #e0e0e0' }}>
          <Table>
            <StyledTableHead>
              <TableRow>
                <StyledTableCell sx={{ width: '50%' }}>제목</StyledTableCell>
                <StyledTableCell align='center' sx={{ width: '120px' }}>
                  작성자
                </StyledTableCell>
                <StyledTableCell align='center' sx={{ width: '140px' }}>
                  작성일
                </StyledTableCell>
                <StyledTableCell align='center' sx={{ width: '80px' }}>
                  조회수
                </StyledTableCell>
                <StyledTableCell align='center' sx={{ width: '80px' }}>
                  좋아요
                </StyledTableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {mockPosts.map(post => (
                <TableRow
                  key={post.id}
                  component={post.isNotice ? NoticeRow : undefined}
                  sx={!post.isNotice ? { '&:hover': { backgroundColor: '#f9f9f9' } } : {}}
                >
                  <StyledTableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {post.isNotice && (
                        <Chip
                          label='공지'
                          size='small'
                          sx={{
                            backgroundColor: '#f44336',
                            color: '#fff',
                            fontSize: '11px',
                            height: '20px',
                          }}
                        />
                      )}
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
                      <Chip
                        label={`[${post.commentCount}]`}
                        size='small'
                        sx={{
                          backgroundColor: '#f0f0f0',
                          color: '#666',
                          fontSize: '11px',
                          height: '18px',
                        }}
                      />
                    </Box>
                  </StyledTableCell>
                  <StyledTableCell align='center'>{post.author}</StyledTableCell>
                  <StyledTableCell align='center'>{post.createdAt}</StyledTableCell>
                  <StyledTableCell align='center'>
                    {post.viewCount >= 1000 ? `${(post.viewCount / 1000).toFixed(1)}만` : post.viewCount}
                  </StyledTableCell>
                  <StyledTableCell align='center'>{post.likeCount}</StyledTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 4, mb: 4 }}>
          <TextField
            placeholder='제목을 입력해주세요.'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            fullWidth
            size='small'
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={10}
            page={1}
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '14px',
              },
              '& .Mui-selected': {
                backgroundColor: '#6B3AA0 !important',
                color: '#fff',
              },
            }}
          />
        </Box>
      </Box>

      <Box sx={{ width: '320px', flexShrink: 0 }}>
        <SidebarCard>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUp sx={{ color: '#f44336' }} />
              <Typography variant='h6' sx={{ fontWeight: 'bold', color: '#333' }}>
                실시간 인기글
              </Typography>
            </Box>
            <List sx={{ p: 0 }}>
              {trendingTopics.slice(0, 10).map((topic, index) => (
                <ListItem key={index} sx={{ p: 0, mb: 1 }}>
                  <TrendingItem>
                    <Typography variant='body2' sx={{ fontWeight: 500, mb: 0.5 }}>
                      {index + 1}
                    </Typography>
                    <Typography
                      variant='caption'
                      sx={{
                        fontSize: '12px',
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {topic}
                    </Typography>
                  </TrendingItem>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </SidebarCard>

        {Array.from({ length: 3 }).map((_, index) => (
          <Box
            key={index}
            sx={{
              width: '100%',
              height: '120px',
              backgroundColor: '#e0e0e0',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              color: '#666',
            }}
          >
            광고배너 width392
          </Box>
        ))}
      </Box>
    </Box>
  );
}
