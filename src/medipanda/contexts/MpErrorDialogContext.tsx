import { createContext, ReactNode, useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface MpErrorDialogContextType {
  showError: (message: string, title?: string) => void;
  hideError: () => void;
}

interface ErrorDialogState {
  open: boolean;
  message: string;
  title: string;
}

const initialState: MpErrorDialogContextType = {
  showError: () => {},
  hideError: () => {}
};

export const MpErrorDialogContext = createContext<MpErrorDialogContextType>(initialState);

interface MpErrorDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const MpErrorDialog = ({ open, title, message, onClose }: MpErrorDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-description"
    >
      <DialogTitle id="error-dialog-title">
        <Box display="flex" alignItems="center">
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#f44336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>!</Typography>
          </Box>
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="error-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#10B981' }} autoFocus>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type MpErrorDialogProviderProps = {
  children: ReactNode;
};

export function MpErrorDialogProvider({ children }: MpErrorDialogProviderProps) {
  const [dialogState, setDialogState] = useState<ErrorDialogState>({
    open: false,
    message: '',
    title: '오류'
  });

  const showError = useCallback((message: string, title?: string) => {
    setDialogState({
      open: true,
      message,
      title: title || '오류'
    });
  }, []);

  const hideError = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <MpErrorDialogContext.Provider
      value={{
        showError,
        hideError
      }}
    >
      {children}
      <MpErrorDialog open={dialogState.open} title={dialogState.title} message={dialogState.message} onClose={hideError} />
    </MpErrorDialogContext.Provider>
  );
}
