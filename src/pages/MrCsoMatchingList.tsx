import { Favorite, Search, Visibility } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  InputAdornment,
  Pagination,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';

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
  marginBottom: '16px',
  cursor: 'pointer',
  '&:hover': {
    borderColor: '#ccc',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
});

const FilterContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '24px',
});

const PostHeader = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  marginBottom: '12px',
});

const PostStats = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '16px',
  color: '#666',
  fontSize: '14px',
  marginTop: '12px',
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

export default function MrCsoMatchingList() {
  const [searchValue, setSearchValue] = useState('');

  const mockPosts = [
    {
      id: 1,
      title: '클들이 방워헙하에가 갖출 외래하생년기다',
      author: '메디판다',
      timestamp: 'YY-MM-DD HH:MM',
      likes: 2548,
      views: 46,
      isNew: true,
      status: '완료',
    },
    {
      id: 2,
      title: '차니별 나 인원인 오록페서',
      author: '익명CSO',
      timestamp: 'YY-MM-DD HH:MM',
      likes: 4603,
      views: 332,
      isNew: true,
      status: '내 글',
    },
  ];

  const relatedPosts = [
    { id: 1, title: '공고내용 width392' },
    { id: 2, title: '공고내용 width392' },
    { id: 3, title: '공고내용 width392' },
  ];

  return (
    <Box>
      <ContentContainer>
        <MainContent>
          <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
            커뮤니티
          </Typography>

          <Box sx={{ mb: 3 }}>
            <TabButton>익명게시판</TabButton>
            <TabButton className='selected'>MR-CSO 매칭</TabButton>
          </Box>

          <FilterContainer>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                제목
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                작성자
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                작성일
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                조회수
              </Typography>
              <Typography variant='body1' sx={{ fontWeight: 500 }}>
                좋아요
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant='contained'
                  size='small'
                  sx={{
                    backgroundColor: '#1a237e',
                    textTransform: 'none',
                    fontSize: '12px',
                    '&:hover': {
                      backgroundColor: '#0d47a1',
                    },
                  }}
                >
                  글쓰기
                </Button>
                <Button
                  variant='outlined'
                  size='small'
                  sx={{
                    borderColor: '#f44336',
                    color: '#f44336',
                    textTransform: 'none',
                    fontSize: '12px',
                    '&:hover': {
                      borderColor: '#d32f2f',
                      color: '#d32f2f',
                    },
                  }}
                >
                  내 글
                </Button>
              </Box>
            </Box>
          </FilterContainer>

          <Box sx={{ mb: 3 }}>
            {mockPosts.map((post) => (
              <PostCard key={post.id} component={RouterLink} to={`/community/mr-cso-matching/${post.id}`}>
                <CardContent sx={{ p: 3 }}>
                  <PostHeader>
                    <Typography
                      sx={{
                        fontSize: '16px',
                        fontWeight: 500,
                        color: '#333',
                        textDecoration: 'none',
                      }}
                    >
                      {post.title}
                    </Typography>
                    {post.isNew && <Chip label='24' size='small' color='error' />}
                  </PostHeader>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant='body2' sx={{ color: '#666' }}>
                        {post.author}
                      </Typography>
                      <Typography variant='body2' sx={{ color: '#666' }}>
                        {post.timestamp}
                      </Typography>
                      <Typography variant='body2' sx={{ color: '#666' }}>
                        {post.views}
                      </Typography>
                      <Typography variant='body2' sx={{ color: '#666' }}>
                        {post.likes.toLocaleString()}
                      </Typography>
                    </Box>
                    <Chip
                      label={post.status}
                      size='small'
                      variant='outlined'
                      sx={{
                        color: post.status === '완료' ? '#4caf50' : '#666',
                        borderColor: post.status === '완료' ? '#4caf50' : '#666',
                      }}
                    />
                  </Box>
                </CardContent>
              </PostCard>
            ))}
          </Box>

          <TextField
            fullWidth
            placeholder='자유롭게 입력해주세요'
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            size='small'
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position='end'>
                  <Search sx={{ color: '#999' }} />
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination count={10} page={2} showFirstButton showLastButton />
          </Box>
        </MainContent>

        <Sidebar>
          {relatedPosts.map((post, index) => (
            <RelatedPostCard key={post.id}>
              <CardContent sx={{ p: 2 }}>
                <Typography variant='body2' sx={{ fontSize: '13px', color: '#666' }}>
                  {post.title}
                </Typography>
              </CardContent>
            </RelatedPostCard>
          ))}
        </Sidebar>
      </ContentContainer>
    </Box>
  );
}
