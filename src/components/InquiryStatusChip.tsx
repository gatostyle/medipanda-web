import { colors } from '@/themes';
import { Box } from '@mui/material';

export function InquiryStatusChip({ responseStatus }: { responseStatus: boolean }) {
  return (
    <Box
      sx={{
        padding: '5px 16px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: responseStatus ? colors.navy : colors.vividViolet,
        borderRadius: '20px',
        color: responseStatus ? colors.navy : colors.vividViolet,
      }}
    >
      {responseStatus ? '답변 완료' : '답변 대기중'}
    </Box>
  );
}
