import { LinearProgress, styled } from '@mui/material';

export const FixedLinearProgress = styled(LinearProgress)(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 9999,
  width: '100%',
  height: '2px',
}));
