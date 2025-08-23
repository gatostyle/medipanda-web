import { LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const LoaderWrapper = styled('div')(() => ({
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 9999,
  width: '100%',
}));

export function FixedLinearLoader() {
  return (
    <LoaderWrapper>
      <LinearProgress color='primary' sx={{ height: 2 }} />
    </LoaderWrapper>
  );
}
