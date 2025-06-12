import { createContext, ReactNode, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

export interface DeleteDialogConfig {
  title?: string;
  message: string;
  onConfirm: () => void | Promise<void>;
}

const initialState = {
  open: (config: DeleteDialogConfig) => {}
};

export const MpDeleteDialogContext = createContext(initialState);

type MpDeleteDialogProviderProps = {
  children: ReactNode;
};

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
        }
      }}
    >
      {children}
      <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
        <DialogTitle>{config?.title || '삭제 확인'}</DialogTitle>
        <DialogContent>
          <Typography>{config?.message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} disabled={loading}>
            취소
          </Button>
          <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading}>
            {loading ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </MpDeleteDialogContext.Provider>
  );
}
