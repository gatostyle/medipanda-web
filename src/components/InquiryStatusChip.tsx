import { colors } from '@/themes';
import { Box } from '@mui/material';

export function InquiryStatusChip({ status }: { status: boolean }) {
  return (
    <Box
      sx={{
        padding: '5px 16px',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: status ? colors.navy : colors.vividViolet,
        borderRadius: '20px',
        color: status ? colors.navy : colors.vividViolet,
      }}
    >
      {status ? '답변 완료' : '답변 대기중'}
    </Box>
  );
}
