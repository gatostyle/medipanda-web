import { Info } from '@mui/icons-material';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import { createContext, type ReactNode, useCallback, useContext, useState } from 'react';

interface MpModalContextType {
  alert: (message: string) => Promise<void>;
  alertError: (message: string) => Promise<void>;
  confirm: (message: string) => Promise<boolean>;
}

const initialState: MpModalContextType = {
  alert: () => Promise.resolve(),
  alertError: () => Promise.resolve(),
  confirm: () => Promise.resolve(true),
};

export const MpModalContext = createContext<MpModalContextType>(initialState);

interface MpModalProps {
  open: boolean;
  color?: 'primary' | 'error';
  title: string;
  message: string;
  onClose: () => void;
  onCancel?: () => void;
}

const MpModalInternal = ({ open, color, title, message, onClose, onCancel }: MpModalProps) => {
  return (
    <Dialog open={open} onClose={onCancel ?? onClose} maxWidth='sm' fullWidth>
      <DialogTitle>
        <Stack direction='row' alignItems='center' gap={1}>
          <Info color={color ?? 'primary'} />
          {title}
        </Stack>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        {onCancel !== undefined && (
          <Button onClick={onClose} variant='outlined'>
            취소
          </Button>
        )}
        <Button onClick={onClose} variant='contained' autoFocus>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function MpModal(props: MpModalProps) {
  if (!props.open) {
    return null;
  }

  return <MpModalInternal {...props} />;
}

interface MpModalProviderProps {
  children: ReactNode;
}

export function MpModalProvider({ children }: MpModalProviderProps) {
  const [modalProps, setModalProps] = useState<MpModalProps>({
    open: false,
    message: '',
    title: '알림',
    onClose: () => undefined,
  });

  const alert: (message: string) => Promise<void> = useCallback((message: string) => {
    return new Promise(resolve => {
      setModalProps({
        open: true,
        message,
        color: 'primary',
        title: '알림',
        onClose: () => {
          setModalProps(prev => ({ ...prev, open: false }));
          resolve();
        },
      });
    });
  }, []);

  const alertError: (message: string) => Promise<void> = useCallback((message: string) => {
    return new Promise(resolve => {
      setModalProps({
        open: true,
        message,
        color: 'error',
        title: '알림',
        onClose: () => {
          setModalProps(prev => ({ ...prev, open: false }));
          resolve();
        },
      });
    });
  }, []);

  const confirm: (message: string) => Promise<boolean> = useCallback((message: string) => {
    return new Promise(resolve => {
      setModalProps({
        open: true,
        message,
        color: 'error',
        title: '오류',
        onClose: () => {
          setModalProps(prev => ({ ...prev, open: false }));
          resolve(true);
        },
        onCancel: () => {
          setModalProps(prev => ({ ...prev, open: false }));
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <MpModalContext.Provider
      value={{
        alert,
        alertError,
        confirm,
      }}
    >
      {children}
      <MpModal {...modalProps} />
    </MpModalContext.Provider>
  );
}

export function useMpModal() {
  const context = useContext(MpModalContext);

  if (context === undefined) {
    throw new Error('useMpModal must be used within a MpModalProvider');
  }

  return context;
}
