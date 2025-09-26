import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { createContext, type ReactNode, useContext, useState } from 'react';

interface BasicModalState {
  showInfoDialog: (message: string, title?: string) => Promise<void>;
  showConfirmDialog: (message: string, title?: string) => Promise<boolean>;
}

const initialState: BasicModalState = {
  showInfoDialog: Promise.resolve,
  showConfirmDialog: Promise.resolve,
};

const BasicModalContext = createContext<BasicModalState>(initialState);

export function BasicModalProvider({ children }: { children: ReactNode }) {
  const [dialogConfig, setDialogConfig] = useState({
    open: false,
    type: 'INFO' as 'INFO' | 'CONFIRM',
    title: '',
    message: '',
    onClose: (() => undefined) as (result: boolean) => void,
  });

  const showInfoDialog = async (message: string, title?: string): Promise<void> => {
    setDialogConfig({
      open: true,
      type: 'INFO',
      title: title ?? '알림',
      message,
      onClose: () => {
        setDialogConfig({
          ...dialogConfig,
          open: false,
        });
      },
    });
  };

  const showConfirmDialog = async (message: string, title?: string): Promise<boolean> => {
    return new Promise(resolve => {
      setDialogConfig({
        open: true,
        type: 'CONFIRM',
        title: title ?? '알림',
        message,
        onClose: (result: boolean) => {
          setDialogConfig({
            ...dialogConfig,
            open: false,
          });
          resolve(result);
        },
      });
    });
  };

  return (
    <BasicModalContext.Provider
      value={{
        showInfoDialog,
        showConfirmDialog,
      }}
    >
      {children}
      {dialogConfig.open && (
        <Dialog
          open
          disableEscapeKeyDown={dialogConfig.type === 'CONFIRM'}
          onClose={dialogConfig.type !== 'CONFIRM' ? () => dialogConfig.onClose(true) : undefined}
        >
          <DialogTitle>{dialogConfig.title}</DialogTitle>
          <DialogContent sx={{ minWidth: '400px' }}>{dialogConfig.message}</DialogContent>
          <DialogActions>
            {dialogConfig.type === 'CONFIRM' && <Button onClick={() => dialogConfig.onClose(false)}>취소</Button>}
            <Button onClick={() => dialogConfig.onClose(true)}>확인</Button>
          </DialogActions>
        </Dialog>
      )}
    </BasicModalContext.Provider>
  );
}

export function useBasicModal() {
  return useContext(BasicModalContext);
}
