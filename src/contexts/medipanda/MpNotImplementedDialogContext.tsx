import { createContext, ReactNode, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const initialState = {
  open: (name: string) => {}
};

export const MpNotImplementedDialogContext = createContext(initialState);

type MpMenuProviderProps = {
  children: ReactNode;
};

export function MpNotImplementedDialogProvider({ children }: MpMenuProviderProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');

  return (
    <MpNotImplementedDialogContext.Provider
      value={{
        open: (name: string) => {
          setName(name);
          setOpen(true);
        }
      }}
    >
      {children}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>알림</DialogTitle>
        <DialogContent>
          <Typography>{name} 기능은 아직 구현되지 않았습니다.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant="contained" sx={{ bgcolor: '#10B981' }}>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </MpNotImplementedDialogContext.Provider>
  );
}
