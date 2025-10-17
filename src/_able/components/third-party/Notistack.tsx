import { type ReactNode } from 'react';

// material-ui
import { styled } from '@mui/material/styles';

// third-party
import { SnackbarProvider } from 'notistack';

// custom styles
const StyledSnackbarProvider = styled(SnackbarProvider)(({ theme }) => ({
  '&.notistack-MuiContent-default': { backgroundColor: theme.palette.primary.main },
  '&.notistack-MuiContent-error': { backgroundColor: theme.palette.error.main },
  '&.notistack-MuiContent-success': { backgroundColor: theme.palette.success.main },
  '&.notistack-MuiContent-info': { backgroundColor: theme.palette.info.main },
  '&.notistack-MuiContent-warning': { backgroundColor: theme.palette.warning.main },
}));

// ===========================|| SNACKBAR - NOTISTACK ||=========================== //

export default function Notistack({ children }: { children: ReactNode }) {
  return (
    <StyledSnackbarProvider maxSnack={3} dense={false}>
      {children}
    </StyledSnackbarProvider>
  );
}
