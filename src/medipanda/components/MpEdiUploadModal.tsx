import { DateString, MemberResponse, uploadEdiZip } from '@/backend';
import { MpMemberSelectModal } from '@/medipanda/components/MpMemberSelectModal';
import { useMpModal } from '@/medipanda/hooks/useMpModal';
import { UploadFile } from '@mui/icons-material';
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
import { DatePicker } from '@mui/x-date-pickers';
import { useFormik } from 'formik';
import { SearchNormal1 } from 'iconsax-react';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

export interface MpEdiUploadModalProps {
  open: boolean;
  onClose?: () => void;
  onSuccess?: () => void;
}

function MpEdiUploadModalInternal({ open, onClose, onSuccess }: MpEdiUploadModalProps) {
  const { alert, alertError } = useMpModal();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      prescriptionMonth: null as Date | null,
      settlementMonth: null as Date | null,
      partnerUser: null as MemberResponse | null,
      file: null as File | null,
    },
    onSubmit: async values => {
      if (values.prescriptionMonth === null) {
        await alert('처방월을 선택하세요.');
        return;
      }

      if (values.settlementMonth === null) {
        await alert('정산월을 선택하세요.');
        return;
      }

      if (values.partnerUser === null) {
        await alert('사용자를 선택하세요.');
        return;
      }

      if (values.file === null) {
        await alert('파일을 선택하세요.');
        return;
      }

      try {
        const response = await uploadEdiZip({
          prescriptionMonth: new DateString(values.prescriptionMonth).toString(),
          settlementMonth: new DateString(values.settlementMonth).toString(),
          partnerUserId: values.partnerUser.userId,
          file: values.file,
        });

        if (response.errors && response.errors.length > 0) {
          const error = response.errors[0];

          switch (error.error) {
            case 'INVALID_EXTENSION':
              await alert('첨부하신 파일중에 jpg, jpeg, png, pdf파일이 아닌 형식이 있습니다.');
              break;
            case 'INVALID_FILENAME_FORMAT':
              await alert('첨부하신 파일중에 딜러명_거래처명_처방월 (홍길동_메디판다_202504)으로 입력하지 않은 파일명이 있습니다.');
              break;
            case 'DEALER_NOT_FOUND':
            case 'PARTNER_NOT_FOUND':
            case 'DRUG_COMPANY_NOT_FOUND':
              await alert(`파일중 거래선으로 등록되지 않은 거래처가 있습니다.`);
              break;
            case 'INVALID_MONTH_FORMAT':
              await alertError(`EDI 등록 중 오류가 발생했습니다.\n${error.error}(${error.fileName}): ${error.message}\n`);
              break;
            case 'DUPLICATE_DEALER_PARTNER_DRUG_COMPANY':
              await alertError(`EDI 등록 중 오류가 발생했습니다.\n${error.error}(${error.fileName}): ${error.message}\n`);
              break;
            case 'DRUG_COMPANY_MISMATCH':
              await alertError(`EDI 등록 중 오류가 발생했습니다.\n${error.error}(${error.fileName}): ${error.message}\n`);
              break;
          }

          return;
        }

        enqueueSnackbar('업로드가 완료되었습니다.', { variant: 'success' });
        onSuccess?.();
      } catch (error) {
        console.error('Failed to upload rate table:', error);
        await alertError('업로드 중 오류가 발생했습니다.');
      }
    },
  });

  const [memberSearchDialogOpen, setMemberSearchDialogOpen] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: useCallback(async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        if (!acceptedFiles[0].name.toLowerCase().endsWith('.zip')) {
          await alert('.zip 파일만 업로드할 수 있습니다.');
          return;
        }

        await formik.setFieldValue('file', acceptedFiles[0]);
      }
    }, []),
  });

  const handleMemberSelect = (member: MemberResponse) => {
    formik.setFieldValue('partnerUser', member);

    setMemberSearchDialogOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
        <DialogTitle sx={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>EDI 등록</DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Stack direction='row' spacing={2} justifyContent='center' alignItems='center' sx={{ mt: 1, mb: 3 }}>
            <Typography variant='body1'>처방월 선택</Typography>
            <Box>
              <DatePicker
                value={formik.values.prescriptionMonth}
                onChange={value => formik.setFieldValue('prescriptionMonth', value?.setDate(1) ?? null)}
                format='yyyy-MM'
                views={['year', 'month']}
                label='처방월'
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
            </Box>
            <Typography variant='body1'>정산월 선택</Typography>
            <Box>
              <DatePicker
                value={formik.values.settlementMonth}
                onChange={value => formik.setFieldValue('settlementMonth', value?.setDate(1) ?? null)}
                format='yyyy-MM'
                views={['year', 'month']}
                label='정산월'
                slotProps={{
                  textField: {
                    size: 'small',
                  },
                }}
              />
            </Box>
            <Box>
              <TextField
                label={(formik.values.partnerUser?.name ?? '') !== '' ? '사용자명' : ''}
                placeholder={(formik.values.partnerUser?.name ?? '') === '' ? '사용자명' : ''}
                value={formik.values.partnerUser?.name ?? ''}
                size='small'
                required
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <InputAdornment position='end'>
                      <IconButton onClick={() => setMemberSearchDialogOpen(true)} edge='end'>
                        <SearchNormal1 size={20} />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
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
            onClick={formik.submitForm}
            disabled={
              formik.values.prescriptionMonth === null ||
              formik.values.settlementMonth === null ||
              formik.values.file === null ||
              formik.isSubmitting
            }
            sx={{ minWidth: 100 }}
          >
            업로드
          </Button>
        </DialogActions>
      </Dialog>

      <MpMemberSelectModal open={memberSearchDialogOpen} onClose={() => setMemberSearchDialogOpen(false)} onSelect={handleMemberSelect} />
    </>
  );
}

export function MpEdiUploadModal(props: MpEdiUploadModalProps) {
  if (!props.open) {
    return null;
  }

  return <MpEdiUploadModalInternal {...props} />;
}
