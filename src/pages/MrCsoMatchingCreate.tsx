import { FormatBold, FormatListBulleted, Image } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router';

const ContentContainer = styled(Box)({
  padding: '24px',
  maxWidth: '800px',
  margin: '0 auto',
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

const FormCard = styled(Card)({
  backgroundColor: '#fff',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  marginTop: '24px',
});

const ToolbarContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  borderTop: '1px solid #e0e0e0',
  padding: '12px 16px',
  backgroundColor: '#f8f9fa',
});

const ActionButtons = styled(Box)({
  display: 'flex',
  gap: '12px',
  justifyContent: 'center',
  marginTop: '24px',
});

export default function MrCsoMatchingCreate() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }
    // Submit logic would go here
    console.log('Submitting:', { title, content, isAnonymous });
  };

  return (
    <ContentContainer>
      <Typography variant='h4' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        커뮤니티
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TabButton>익명게시판</TabButton>
        <TabButton className='selected'>MR-CSO 매칭</TabButton>
      </Box>

      <FormCard>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  sx={{
                    color: '#6B3AA0',
                    '&.Mui-checked': {
                      color: '#6B3AA0',
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant='body2' sx={{ fontWeight: 500 }}>
                    익명
                  </Typography>
                  <Typography variant='body2' sx={{ color: '#666' }}>
                    닉네임 숨기기
                  </Typography>
                </Box>
              }
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant='body1' sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
              제목*
            </Typography>
            <TextField
              fullWidth
              placeholder='제목을 입력해주세요'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff',
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant='body1' sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
              문의내용*
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={12}
              placeholder='내용을 입력해주세요'
              value={content}
              onChange={(e) => setContent(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff',
                  padding: 0,
                },
                '& .MuiInputBase-input': {
                  padding: '16px',
                },
              }}
            />
            <ToolbarContainer>
              <IconButton size='small' sx={{ color: '#666' }}>
                <FormatBold />
              </IconButton>
              <IconButton size='small' sx={{ color: '#666' }}>
                <FormatListBulleted />
              </IconButton>
              <IconButton size='small' sx={{ color: '#666' }}>
                <Image />
              </IconButton>
            </ToolbarContainer>
          </Box>
        </CardContent>
      </FormCard>

      <ActionButtons>
        <Button
          component={RouterLink}
          to='/community/mr-cso-matching'
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
          취소
        </Button>
        <Button
          variant='contained'
          onClick={handleSubmit}
          sx={{
            padding: '12px 32px',
            backgroundColor: '#6B3AA0',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#5a2d8a',
            },
          }}
          disabled={!title.trim() || !content.trim()}
        >
          작성하기
        </Button>
      </ActionButtons>
    </ContentContainer>
  );
}
