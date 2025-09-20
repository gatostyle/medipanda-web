import { uploadSettlementExcel } from '@/backend';
import { useMpModal } from '@/hooks/useMpModal';
import { AttachFile as AttachFileIcon, UploadFile } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';

export interface MpSettlementUploadModalProps {
  open: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

function MpSettlementUploadModalInternal({ open, onClose, onSuccess }: MpSettlementUploadModalProps) {
  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();

  const form = useForm({
    defaultValues: {
      file: null as File | null,
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        form.setValue('file', acceptedFiles[0]);
      }
    }, []),
    accept: { 'application/vnd.ms-excel': ['.xls', '.xlsx'] },
  });

  const handleFileUpload = async () => {
    if (form.getValues('file') === null) {
      await alert('업로드할 파일을 선택하세요.');
      return;
    }

    try {
      await uploadSettlementExcel({ file: form.getValues('file')! });
      enqueueSnackbar('업로드가 완료되었습니다.', { variant: 'success' });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to upload file:', error);
      await alertError('업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>정산내역 업로드</DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Stack direction='row' alignItems='center' sx={{ mt: 1, mb: 3 }}>
            <Button
              href={import.meta.env.VITE_APP_URL_FILE_SETTLEMENT}
              target='_blank'
              variant='contained'
              color='success'
              size='small'
              startIcon={<AttachFileIcon />}
              sx={{
                marginLeft: 'auto',
              }}
            >
              양식 다운로드
            </Button>
          </Stack>
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed #e0e0e0',
              borderRadius: 1,
              p: 4,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'transparent',
              '&:hover': {
                borderColor: 'primary.main',
              },
            }}
          >
            <input {...getInputProps()} />
            <UploadFile sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant='h6' color='text.secondary'>
              여기에 파일을 드래그하거나 클릭하여 업로드하세요.
            </Typography>
            {form.getValues('file') && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                선택된 파일: {form.getValues('file')!.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
          <Button variant='outlined' onClick={onClose} sx={{ minWidth: 100 }}>
            취소
          </Button>
          <Button variant='contained' color='success' onClick={handleFileUpload} disabled={!form.getValues('file')} sx={{ minWidth: 100 }}>
            업로드
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export function MpSettlementUploadModal(props: MpSettlementUploadModalProps) {
  if (!props.open) {
    return null;
  }

  return <MpSettlementUploadModalInternal {...props} />;
}
