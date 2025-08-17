import { Box, Typography } from '@mui/material';

export default function Terms() {
  return (
    <Box sx={{ p: 4 }}>
      <Typography sx={{ mb: 4, fontWeight: 'bold' }}>이용약관</Typography>
      <Typography sx={{ lineHeight: 1.6, color: '#666' }}>이용약관 내용이 여기에 표시됩니다.</Typography>
    </Box>
  );
}
