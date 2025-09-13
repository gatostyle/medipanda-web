import { uploadProductExtraInfo } from '@/backend';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import { AttachFile as AttachFileIcon, UploadFile } from '@mui/icons-material';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useFormik } from 'formik';
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

export interface MpProductUploadModalProps {
  open: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

function MpProductUploadModalInternal({ open, onClose, onSuccess }: MpProductUploadModalProps) {
  const errorDialog = useMpErrorDialog();
  const { alert } = useMpModal();

  const formik = useFormik({
    initialValues: {
      file: null as File | null,
    },
    onSubmit: async values => {
      if (values.file === null) {
        await alert('파일을 선택해주세요.');
        return;
      }

      try {
        await uploadProductExtraInfo({ file: values.file });
        await alert('업로드가 완료되었습니다.');
        onSuccess?.();
      } catch (error) {
        console.error('Failed to upload rate table:', error);
        errorDialog.showError('업로드 중 오류가 발생했습니다.');
      }
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        formik.setFieldValue('file', acceptedFiles[0]);
      }
    }, []),
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>요율표 업로드</DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 3 }}>
        <Box sx={{ textAlign: 'right', mb: 2 }}>
          <Button
            href={import.meta.env.VITE_APP_URL_FILE_PRODUCT_RATE_TABLE}
            target='_blank'
            variant='contained'
            color='success'
            size='small'
            startIcon={<AttachFileIcon />}
          >
            양식 다운로드
          </Button>
        </Box>
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
          {formik.values.file && (
            <Typography variant='body2' sx={{ mt: 1 }}>
              선택된 파일: {formik.values.file.name}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button variant='outlined' onClick={onClose} sx={{ minWidth: 100 }}>
          취소
        </Button>
        <Button variant='contained' color='success' onClick={formik.submitForm} disabled={!formik.values.file} sx={{ minWidth: 100 }}>
          업데이트
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function MpProductUploadModal(props: MpProductUploadModalProps) {
  if (!props.open) {
    return null;
  }

  return <MpProductUploadModalInternal {...props} />;
}
