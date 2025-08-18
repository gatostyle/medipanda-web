import { Favorite, MoreHoriz, Visibility } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, CircularProgress, IconButton, Snackbar, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { type BoardDetailsResponse, getBoardDetails } from '../backend';
import { FixedLoader } from '../components/FixedLoader.tsx';
import { MedipandaButton } from '../custom/components/MedipandaButton.tsx';
import { colors } from '../custom/globalStyles.ts';
import { formatYyyyMmDdHhMm } from '../utils/dateFormat.ts';

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
    backgroundColor: colors.gray300,
    color: colors.gray700,
    '&:hover': {
      backgroundColor: colors.gray300,
    },
  },
  '&:not(.selected)': {
    backgroundColor: 'transparent',
    color: colors.gray500,
    '&:hover': {
      backgroundColor: colors.gray50,
    },
  },
});

const PostCard = styled(Card)({
  boxShadow: 'none',
  border: `1px solid ${colors.gray300}`,
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
  color: colors.gray500,
  fontSize: '14px',
});

const CommentCard = styled(Card)({
  backgroundColor: colors.gray100,
  boxShadow: 'none',
  border: `1px solid ${colors.gray300}`,
  borderRadius: '8px',
  marginBottom: '12px',
});

const CommentInput = styled(Box)({
  display: 'flex',
  gap: '12px',
  marginTop: '16px',
});

const RelatedPostCard = styled(Card)({
  backgroundColor: colors.gray50,
  boxShadow: 'none',
  borderRadius: '8px',
  marginBottom: '8px',
  cursor: 'pointer',
  '&:hover': {
    backgroundColor: colors.gray300,
  },
});

export default function AnonymousBoardDetail() {
  const { id } = useParams();
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [currentTab, setCurrentTab] = useState('anonymous');

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const relatedPosts = [
    { id: 1, title: '[스크랩 요청] "이번 현직자님들에 대한 질문을 봤는데" 너무나 다...', author: 'width392' },
    { id: 2, title: '[스크랩 요청] 오늘 읽은 현직이님의신의 좋 (feat. 멋힌 2년 출간 요약)', author: 'width392' },
    { id: 3, title: '[오현넷 지원] CSO 정보 받고 선선 PM, 광고되, 화건 요구하...', author: 'width392' },
  ];

  const handleSubmitComment = () => {
    if (!comment.trim()) {
      showSnackbar('댓글을 입력해주세요.', 'warning');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setComment('');
      showSnackbar('댓글이 성공적으로 등록되었습니다!', 'success');
    }, 1000);
  };

  const handleTabChange = tab => {
    setCurrentTab(tab);
    if (tab === 'anonymous') {
      navigate('/community/anonymous');
    } else if (tab === 'mrCso') {
      navigate('/community/mr-cso-matching');
    }
  };

  const handleAction = action => {
    switch (action) {
      case 'report':
        showSnackbar('신고가 접수되었습니다.', 'success');
        break;
      case 'save':
        showSnackbar('게시글이 저장되었습니다.', 'success');
        break;
      case 'edit':
        navigate(`/community/anonymous/${id}/edit`);
        break;
      default:
        break;
    }
  };

  const handleRelatedPostClick = postId => {
    navigate(`/community/anonymous/${postId}`);
  };
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
      navigate('/community/anonymous', { replace: true });
      return;
    }

    fetchDetail(id);
  }, [paramId]);

  if (!detail) {
    return <FixedLoader />;
  }

  return (
    <Box>
      <ContentContainer>
        <MainContent>
          <Typography sx={{ mb: 4, fontWeight: 'bold', color: colors.gray700 }}>커뮤니티</Typography>

          <Box sx={{ mb: 3 }}>
            <TabButton className={currentTab === 'anonymous' ? 'selected' : ''} onClick={() => handleTabChange('anonymous')}>
              익명게시판
            </TabButton>
            <TabButton className={currentTab === 'mrCso' ? 'selected' : ''} onClick={() => handleTabChange('mrCso')}>
              MR-CSO 매칭
            </TabButton>
          </Box>

          <PostCard>
            <CardContent sx={{ p: 3 }}>
              <PostHeader>
                <Box>
                  <Typography sx={{ fontWeight: 'bold', color: colors.gray700, mb: 1 }}>{detail.title}</Typography>
                  <Typography sx={{ color: colors.gray500 }}>
                    {detail.nickname} · {formatYyyyMmDdHhMm(detail.createdAt)}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size='small'>
                    <MoreHoriz />
                  </IconButton>
                  <Chip label='신고하기' size='small' />
                  <PostActions>
                    <ActionButton variant='outlined' size='small' color='error' onClick={() => handleAction('report')}>
                      신고하기
                    </ActionButton>
                    <ActionButton variant='outlined' size='small' onClick={() => handleAction('save')}>
                      저장하기
                    </ActionButton>
                    <ActionButton variant='contained' size='small' onClick={() => handleAction('edit')}>
                      수정하기
                    </ActionButton>
                  </PostActions>
                </Box>
              </PostHeader>

              <Typography sx={{ mb: 2, lineHeight: 1.6 }}>{detail.content}</Typography>

              <Box sx={{ mb: 2 }}>{detail.content}</Box>

              <PostStats>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Favorite fontSize='small' />
                  {detail.likesCount}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Visibility fontSize='small' />
                  {detail.viewsCount}
                </Box>
              </PostStats>
            </CardContent>
          </PostCard>

          <Box sx={{ mb: 3 }}>
            {detail.comments.map(comment => (
              <CommentCard key={comment.id}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography sx={{ fontWeight: 500 }}>{comment.nickname}</Typography>
                      <Chip label='CSO' size='small' color='error' />
                    </Box>
                    <IconButton size='small'>
                      <MoreHoriz />
                    </IconButton>
                  </Box>
                  <Typography sx={{ mb: 1 }}>{comment.content}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: colors.gray500, fontSize: '12px' }}>
                    <span>{formatYyyyMmDdHhMm(comment.createdAt)}</span>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>❤️ {comment.likesCount}</Box>
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
              onChange={e => setComment(e.target.value)}
              size='small'
            />
            <MedipandaButton onClick={handleSubmitComment} disabled={loading} variant='contained' color='secondary'>
              {loading ? <CircularProgress size={20} color='inherit' sx={{ mr: 1 }} /> : null}
              등록하기
            </MedipandaButton>
          </CommentInput>
        </MainContent>

        <Sidebar>
          <Typography sx={{ mb: 2, fontWeight: 'bold' }}>관련글</Typography>
          {relatedPosts.map((post, index) => (
            <RelatedPostCard key={post.id} onClick={() => handleRelatedPostClick(post.id)}>
              <CardContent sx={{ p: 2 }}>
                <Typography sx={{ fontSize: '12px', color: colors.gray500, mb: 0.5 }}>{index + 1}</Typography>
                <Typography sx={{ fontSize: '13px', lineHeight: 1.4, mb: 1 }}>{post.title}</Typography>
                <Typography sx={{ fontSize: '11px', color: colors.gray400 }}>{post.author}</Typography>
              </CardContent>
            </RelatedPostCard>
          ))}
        </Sidebar>
      </ContentContainer>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
