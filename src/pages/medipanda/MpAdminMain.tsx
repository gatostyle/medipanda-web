import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const MpAdminMain: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          관리자 페이지
        </Typography>
        <Typography variant="body1" color="text.secondary">
          좌측 메뉴에서 원하는 관리 기능을 선택해주세요.
        </Typography>
      </Paper>
    </Box>
  );
};

export default MpAdminMain;
