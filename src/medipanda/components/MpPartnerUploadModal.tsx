import { MemberResponse, uploadPartnersExcel } from '@/backend';
import { MpMemberSelectModal } from '@/medipanda/components/MpMemberSelectModal';
import { useMpErrorDialog } from '@/medipanda/hooks/useMpErrorDialog';
import { useMpInfoDialog } from '@/medipanda/hooks/useMpInfoDialog';
import { AttachFile as AttachFileIcon, UploadFile } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import { SearchNormal1 } from 'iconsax-react';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export interface MpPartnerUploadModalProps {
  open: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

function MpPartnerUploadModalInternal({ open, onClose, onSuccess }: MpPartnerUploadModalProps) {
  const infoDialog = useMpInfoDialog();
  const errorDialog = useMpErrorDialog();

  const formik = useFormik({
    initialValues: {
      member: null as MemberResponse | null,
      file: null as File | null,
    },
    onSubmit: async values => {},
  });

  const [memberSelectModalOpen, setMemberSelectModalOpen] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        formik.setFieldValue('file', acceptedFiles[0]);
      }
    }, []),
    accept: { 'application/vnd.ms-excel': ['.xls', '.xlsx'] },
  });

  const handleMemberSelect = async (member: MemberResponse) => {
    await formik.setFieldValue('member', member);
    setMemberSelectModalOpen(false);
  };

  const handleFileUpload = async () => {
    if (formik.values.member === null) {
      alert('사용자명을 선택해주세요.');
      return;
    }

    if (formik.values.file === null) {
      infoDialog.showInfo('업로드할 파일을 선택해주세요.');
      return;
    }

    try {
      await uploadPartnersExcel(formik.values.member.userId, { file: formik.values.file });
      infoDialog.showInfo('업로드가 완료되었습니다.');
      onSuccess?.();
    } catch (error) {
      console.error('Failed to upload file:', error);
      errorDialog.showError('업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>거래선 업로드</DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Stack direction='row' alignItems='center' sx={{ mb: 3 }}>
            <Box>
              <TextField
                placeholder='사용자명'
                value={formik.values.member?.name ?? ''}
                required
                disabled
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setMemberSelectModalOpen(true)} edge='end'>
                        <SearchNormal1 size={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Button
              href={import.meta.env.VITE_APP_URL_FILE_BUSINESS_PARTNER}
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
          <Button
            variant='contained'
            color='success'
            onClick={handleFileUpload}
            disabled={!formik.values.member || !formik.values.file}
            sx={{ minWidth: 100 }}
          >
            업데이트
          </Button>
        </DialogActions>
      </Dialog>

      <MpMemberSelectModal open={memberSelectModalOpen} onClose={() => setMemberSelectModalOpen(false)} onSelect={handleMemberSelect} />
    </>
  );
}

export function MpPartnerUploadModal(props: MpPartnerUploadModalProps) {
  if (!props.open) {
    return null;
  }

  return <MpPartnerUploadModalInternal {...props} />;
}
