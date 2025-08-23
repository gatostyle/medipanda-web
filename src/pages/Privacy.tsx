import { Box, Typography } from '@mui/material';

export default function Privacy() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography sx={{ marginBottom: 4, fontWeight: 'bold' }}>개인정보처리방침</Typography>
      <Typography sx={{ lineHeight: 1.6, color: '#666' }}>개인정보처리방침 내용이 여기에 표시됩니다.</Typography>
    </Box>
  );
}
