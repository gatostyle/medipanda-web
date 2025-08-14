import { GetApp } from '@mui/icons-material';
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router';
import { useState } from 'react';

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

const FormCard = styled(Card)({
  backgroundColor: '#fff',
  boxShadow: 'none',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
});

const FileUploadButton = styled(Button)({
  padding: '12px 24px',
  borderColor: '#e0e0e0',
  color: '#666',
  textTransform: 'none',
  '&:hover': {
    borderColor: '#6B3AA0',
    color: '#6B3AA0',
  },
});

export default function InquiryNew() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setAttachedFiles(Array.from(files));
    }
  };

  return (
    <Box>
      <Typography variant='h5' sx={{ mb: 4, fontWeight: 'bold', color: '#333' }}>
        1:1 문의내역
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TabButton className='selected'>문의하기</TabButton>
      </Box>

      <FormCard>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant='body1' sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
              제목*
            </Typography>
            <TextField
              fullWidth
              placeholder='제목을 입력해주세요'
              value={title}
              onChange={e => setTitle(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff',
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant='body1' sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
              문의내용*
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={8}
              placeholder='내용을 입력해주세요'
              value={content}
              onChange={e => setContent(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#fff',
                },
              }}
            />
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography variant='body1' sx={{ mb: 1, fontWeight: 500, color: '#333' }}>
              파일 첨부
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <input
                type='file'
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id='file-upload'
                accept='.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx'
              />
              <label htmlFor='file-upload'>
                <FileUploadButton variant='outlined' startIcon={<GetApp />}>
                  파일 올리기
                </FileUploadButton>
              </label>
              {attachedFiles.length > 0 && (
                <Typography variant='body2' sx={{ color: '#666' }}>
                  {attachedFiles.length}개 파일 선택됨
                </Typography>
              )}
            </Box>
            {attachedFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {attachedFiles.map((file, index) => (
                  <Typography key={index} variant='body2' sx={{ color: '#666', display: 'block' }}>
                    {file.name}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
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
              취소
            </Button>
            <Button
              variant='contained'
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
              문의하기
            </Button>
          </Box>
        </CardContent>
      </FormCard>
    </Box>
  );
}
