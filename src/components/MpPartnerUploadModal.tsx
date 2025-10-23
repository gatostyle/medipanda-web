import { ContractStatus, type MemberResponse, uploadPartnersExcel } from '@/backend';
import { useMpModal } from '@/hooks/useMpModal';
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
import { useForm } from 'react-hook-form';
import { SearchNormal1 } from 'iconsax-reactjs';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { MpMemberSelectModal } from './MpMemberSelectModal';

export interface MpPartnerUploadModalProps {
  open: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

function MpPartnerUploadModalInternal({ open, onClose, onSuccess }: MpPartnerUploadModalProps) {
  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
      member: null as MemberResponse | null,
      file: null as File | null,
    },
  });
  const formMember = form.watch('member');
  const formFile = form.watch('file');

  const [memberSelectModalOpen, setMemberSelectModalOpen] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        form.setValue('file', acceptedFiles[0]);
      }
    }, []),
    accept: { 'application/vnd.ms-excel': ['.xls', '.xlsx'] },
  });

  const handleMemberSelect = async (member: MemberResponse) => {
    await form.setValue('member', member);
    setMemberSelectModalOpen(false);
  };

  const handleFileUpload = async () => {
    if (form.getValues('member') === null) {
      await alert('사용자명을 선택하세요.');
      return;
    }

    if (form.getValues('file') === null) {
      await alert('업로드할 파일을 선택하세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await uploadPartnersExcel(form.getValues('member')!.userId, { file: form.getValues('file')! });
      enqueueSnackbar('업로드가 완료되었습니다.', { variant: 'success' });
      onSuccess?.();
    } catch (error) {
      console.error('Failed to upload file:', error);
      await alertError('업로드 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontSize: '1.25rem', fontWeight: 600 }}>거래선 업로드</DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Stack direction='row' alignItems='center' sx={{ mt: 1, mb: 3 }}>
            <Box>
              <TextField
                label={(formMember?.name ?? '') !== '' ? '사용자명' : ''}
                placeholder={(formMember?.name ?? '') === '' ? '사용자명' : ''}
                value={formMember?.name ?? ''}
                size='small'
                required
                InputProps={{
                  readOnly: true,
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
              href='/assets/templates/거래선_양식.xlsx'
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
            {formFile && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                선택된 파일: {formFile.name}
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
            disabled={!formMember || !formFile || isSubmitting}
            sx={{ minWidth: 100 }}
          >
            {isSubmitting ? '업로드 중...' : '업로드'}
          </Button>
        </DialogActions>
      </Dialog>

      <MpMemberSelectModal
        open={memberSelectModalOpen}
        onClose={() => setMemberSelectModalOpen(false)}
        onSelect={handleMemberSelect}
        additionalFilter={{
          contractStatus: ContractStatus.CONTRACT,
        }}
      />
    </>
  );
}

export function MpPartnerUploadModal(props: MpPartnerUploadModalProps) {
  if (!props.open) {
    return null;
  }

  return <MpPartnerUploadModalInternal {...props} />;
}
