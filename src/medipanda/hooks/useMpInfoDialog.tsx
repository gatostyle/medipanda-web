import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface MpInfoDialogContextType {
  showInfo: (message: string, title?: string) => void;
  hideInfo: () => void;
}

interface InfoDialogState {
  open: boolean;
  message: string;
  title: string;
}

const initialState: MpInfoDialogContextType = {
  showInfo: () => {},
  hideInfo: () => {}
};

export const MpInfoDialogContext = createContext<MpInfoDialogContextType>(initialState);

interface MpInfoDialogProps {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
}

const MpInfoDialog = ({ open, title, message, onClose }: MpInfoDialogProps) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="info-dialog-title"
      aria-describedby="info-dialog-description"
    >
      <DialogTitle id="info-dialog-title">
        <Box display="flex" alignItems="center">
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: '50%',
              backgroundColor: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 1
            }}
          >
            <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>i</Typography>
          </Box>
          {title}
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="info-dialog-description">{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#10B981' }} autoFocus>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

type MpInfoDialogProviderProps = {
  children: ReactNode;
};

export function MpInfoDialogProvider({ children }: MpInfoDialogProviderProps) {
  const [dialogState, setDialogState] = useState<InfoDialogState>({
    open: false,
    message: '',
    title: '알림'
  });

  const showInfo = useCallback((message: string, title?: string) => {
    setDialogState({
      open: true,
      message,
      title: title || '알림'
    });
  }, []);

  const hideInfo = useCallback(() => {
    setDialogState((prev) => ({ ...prev, open: false }));
  }, []);

  return (
    <MpInfoDialogContext.Provider
      value={{
        showInfo,
        hideInfo
      }}
    >
      {children}
      <MpInfoDialog open={dialogState.open} title={dialogState.title} message={dialogState.message} onClose={hideInfo} />
    </MpInfoDialogContext.Provider>
  );
}

export function useMpInfoDialog() {
  const context = useContext(MpInfoDialogContext);

  if (context === undefined) {
    throw new Error('useMpInfoDialog must be used within a MpInfoDialogProvider');
  }

  return context;
}
