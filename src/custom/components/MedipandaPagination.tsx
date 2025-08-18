import { Pagination } from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors, typography } from '../globalStyles.ts';

export const MedipandaPagination = styled(Pagination)({
  '& .MuiPaginationItem-root': {
    '&.MuiPaginationItem-firstLast, &.MuiPaginationItem-previousNext': {
      border: `1px solid ${colors.gray30}`,
      borderRadius: '4px',
    },
    '&.MuiPaginationItem-page': {
      ...typography.smallTextB,
      backgroundColor: 'unset',

      '&.Mui-selected,&:hover': {
        color: colors.vividViolet,
        textDecoration: 'underline',
        backgroundColor: 'unset',
      },
    },
  },
});
