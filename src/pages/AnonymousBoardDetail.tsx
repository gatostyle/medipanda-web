import { Favorite, MoreHoriz, Visibility } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { useParams } from 'react-router';

const ContentContainer = styled(Box)({
  padding: '24px',
  display: 'flex',
  gap: '24px',
});

const MainContent = styled(Box)({
  flex: 1,
});

const Sidebar = styled(Box)({
  width: '300px',
  flexShrink: 0,
});

const TabButton = styled(Button)({
  padding: '12px 24px',
  borderRadius: '4px',
  textTransform: 'none',
  fontSize: '14px',
  fontWeight: 500,
  minWidth: 'auto',
  '&.selected': {
    backgroundColor: '#e0e0e0',
    color: '#333',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
  },
  '&:not(.selected)': {
    backgroundColor: 'transparent',
    color: '#666',
    '&:hover': {
      backgroundColor: '#f5f5f5',
    },
  },
});

const PostCard = styled(Card)({
  backgroundColor: '#fff',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  marginBottom: '24px',
});

const PostHeader = styled(Box)({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '16px',
});

const PostActions = styled(Box)({
  display: 'flex',
  gap: '8px',
});

const ActionButton = styled(Button)({
  padding: '4px 12px',
  fontSize: '12px',
  textTransform: 'none',
  borderRadius: '4px',
});

const PostStats = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  marginTop: '16px',
  color: '#666',
  fontSize: '14px',
});

const CommentCard = styled(Card)({
  backgroundColor: '#f8f9fa',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  marginBottom: '12px',
});

const CommentInput = styled(Box)({
  display: 'flex',
  gap: '12px',
  marginTop: '16px',
});

const RelatedPostCard = styled(Card)({
  backgroundColor: '#f5f5f5',
  boxShadow: 'none',
  borderRadius: '8px',
  marginBottom: '8px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
});

export default function AnonymousBoardDetail() {
  const { id } = useParams();
  const [comment, setComment] = useState('');

  const mockPost = {
    id: Number(id),
    title: 'CSO 하시는 형들 있나요',
    author: 'CSO 찾니다',
    timestamp: '25-04-01 10:34',
    content: '솔리없제 괜찮어서 다른 일중일... 😭',
    imageUrl: '/mock-post-image.jpg',
    likes: 10,
    views: 300,
    comments: [
      {
        id: 1,
        author: 'CSO하니',
        content: '일어나면 일요다명하죠',
        timestamp: '24시',
        likes: 16,
        replies: 2,
      },
      {
        id: 2,
        author: '익명의 CSO',
        content: '첫사 CSO 일하느낀 일만나 다른나고 힘니',
        timestamp: '24시',
        likes: 0,
      },
      {
        id: 3,
        author: 'CSO 일하는',
        content: '월 10년 기기이 하는으......',
        timestamp: '14시',
        likes: 0,
      },
    ],
  };

  const relatedPosts = [
    { id: 1, title: '[스크랩 요청] "이번 현직자님들에 대한 질문을 봤는데" 너무나 다...', author: 'width392' },
    { id: 2, title: '[스크랩 요청] 오늘 읽은 현직이님의신의 좋 (feat. 멋힌 2년 출간 요약)', author: 'width392' },
    { id: 3, title: '[오현넷 지원] CSO 정보 받고 선선 PM, 광고되, 화건 요구하...', author: 'width392' },
  ];

  const handleSubmitComment = () => {
    if (!comment.trim()) return;
    console.log('Submitting comment:', comment);
    setComment('');
  };

  return (
    <Box>
      <ContentContainer>
        <MainContent>
          <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
            커뮤니티
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TabButton className='selected'>익명게시판</TabButton>
            <TabButton>MR-CSO 매칭</TabButton>
          </Box>

          <PostCard>
            <CardContent sx={{ p: 3 }}>
              <PostHeader>
                <Box>
                  <Typography variant='h5' sx={{ fontWeight: 'bold', color: '#333', mb: 1 }}>
                    {mockPost.title}
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#666' }}>
                    {mockPost.author} · {mockPost.timestamp}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size='small'>
                    <MoreHoriz />
                  </IconButton>
                  <Chip label='신고하기' size='small' />
                  <PostActions>
                    <ActionButton variant='outlined' size='small' color='error'>
                      신고하기
                    </ActionButton>
                    <ActionButton variant='outlined' size='small'>
                      저장하기
                    </ActionButton>
                    <ActionButton variant='contained' size='small'>
                      수정하기
                    </ActionButton>
                  </PostActions>
                </Box>
              </PostHeader>

              <Typography variant='body1' sx={{ mb: 2, lineHeight: 1.6 }}>
                {mockPost.content}
              </Typography>

              <Box sx={{ mb: 2 }}>
                <img
                  src={mockPost.imageUrl}
                  alt='Post image'
                  style={{
                    width: '200px',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    backgroundColor: '#f0f0f0',
                  }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Box>

              <PostStats>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Favorite fontSize='small' />
                  {mockPost.likes}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility fontSize='small' />
                  {mockPost.views}
                </Box>
              </PostStats>
            </CardContent>
          </PostCard>

          <Box sx={{ mb: 3 }}>
            {mockPost.comments.map((comment) => (
              <CommentCard key={comment.id}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body2' sx={{ fontWeight: 500 }}>
                        {comment.author}
                      </Typography>
                      <Chip label='CSO' size='small' color='error' />
                    </Box>
                    <IconButton size='small'>
                      <MoreHoriz />
                    </IconButton>
                  </Box>
                  <Typography variant='body2' sx={{ mb: 1 }}>
                    {comment.content}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: '#666', fontSize: '12px' }}>
                    <span>{comment.timestamp}</span>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      ❤️ {comment.likes}
                    </Box>
                    {comment.replies && <span>답글 {comment.replies}</span>}
                  </Box>
                </CardContent>
              </CommentCard>
            ))}
          </Box>

          <CommentInput>
            <TextField
              fullWidth
              placeholder='자유롭게 남겨주세요'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              size='small'
            />
            <Button
              variant='contained'
              onClick={handleSubmitComment}
              sx={{
                backgroundColor: '#1a237e',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#0d47a1',
                },
              }}
            >
              등록하기
            </Button>
          </CommentInput>
        </MainContent>

        <Sidebar>
          <Typography variant='h6' sx={{ mb: 2, fontWeight: 'bold' }}>
            관련글
          </Typography>
          {relatedPosts.map((post, index) => (
            <RelatedPostCard key={post.id}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant='body2' sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>
                  {index + 1}
                </Typography>
                <Typography variant='body2' sx={{ fontSize: '13px', lineHeight: 1.4, mb: 1 }}>
                  {post.title}
                </Typography>
                <Typography variant='body2' sx={{ fontSize: '11px', color: '#999' }}>
                  {post.author}
                </Typography>
              </CardContent>
            </RelatedPostCard>
          ))}
        </Sidebar>
      </ContentContainer>
    </Box>
  );
}
