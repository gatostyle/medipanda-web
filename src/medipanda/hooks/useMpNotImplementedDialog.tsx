import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { createContext, ReactNode, useContext, useState } from 'react';

const initialState = {
  open: (name: string) => {},
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
        },
      }}
    >
      {children}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle>알림</DialogTitle>
        <DialogContent>
          <Typography>{name}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} variant='contained' sx={{ bgcolor: '#10B981' }}>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </MpNotImplementedDialogContext.Provider>
  );
}

export function useMpNotImplementedDialog() {
  return useContext(MpNotImplementedDialogContext);
}
