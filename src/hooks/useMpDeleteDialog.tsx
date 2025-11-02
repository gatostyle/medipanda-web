import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { createContext, type ReactNode, useContext, useState } from 'react';

export interface DeleteDialogConfig {
  title?: string;
  message: string;
  confirmText?: string;
  onConfirm: () => void | Promise<void>;
}

const initialState = {
  open: (_: DeleteDialogConfig) => undefined,
};

export const MpDeleteDialogContext = createContext(initialState);

interface MpDeleteDialogProviderProps {
  children: ReactNode;
}

export function MpDeleteDialogProvider({ children }: MpDeleteDialogProviderProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<DeleteDialogConfig | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!config) return;

    setLoading(true);
    try {
      await config.onConfirm();
      setOpen(false);
      setConfig(null);
    } catch (error) {
      console.error('Delete operation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    setOpen(false);
    setConfig(null);
  };

  return (
    <MpDeleteDialogContext.Provider
      value={{
        open: (deleteConfig: DeleteDialogConfig) => {
          setConfig(deleteConfig);
          setOpen(true);
        },
      }}
    >
      {children}
      <Dialog open={open} onClose={handleCancel} maxWidth='sm' fullWidth>
        <DialogTitle>{config?.title || '삭제 확인'}</DialogTitle>
        <DialogContent>
          <Typography>{config?.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleConfirm} variant='contained' color='error' disabled={loading}>
            {config?.confirmText ?? '삭제'}
            {loading ? ' 중...' : ''}
          </Button>
        </DialogActions>
      </Dialog>
    </MpDeleteDialogContext.Provider>
  );
}

export function useMpDeleteDialog() {
  return useContext(MpDeleteDialogContext);
}
