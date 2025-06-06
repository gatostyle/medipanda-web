import { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Paper } from '@mui/material';
import { AttachSquare } from 'iconsax-react';
import { useMpNotImplementedDialog } from 'hooks/medipanda/useMpNotImplementedDialog';

interface FileUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function FileUploadDialog({ open, onClose }: FileUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { open: openNotImplementedDialog } = useMpNotImplementedDialog();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }
        }}
      >
        <DialogTitle
          sx={{
            textAlign: 'center',
            fontSize: '20px',
            fontWeight: 600,
            py: 3,
            borderBottom: '1px solid #e0e0e0'
          }}
        >
          파일업로드
        </DialogTitle>

        <DialogContent sx={{ py: 4 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3
            }}
          >
            <Paper
              sx={{
                width: '120px',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed #10B981',
                backgroundColor: '#F0FDF4',
                borderRadius: 2,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                '&:hover': {
                  backgroundColor: '#ECFDF5'
                }
              }}
              component="label"
            >
              <input type="file" hidden onChange={handleFileSelect} accept=".xlsx,.xls,.csv" />
              <AttachSquare size="32" color="#10B981" />
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#10B981',
                  mt: 1
                }}
              >
                파일
              </Typography>
            </Paper>

            {selectedFile && (
              <Typography
                sx={{
                  fontSize: '14px',
                  color: '#374151',
                  textAlign: 'center'
                }}
              >
                선택된 파일: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            justifyContent: 'center',
            gap: 2,
            pb: 3,
            px: 3
          }}
        >
          <Button
            onClick={handleCancel}
            variant="outlined"
            sx={{
              minWidth: '100px',
              height: '40px',
              borderRadius: '8px',
              borderColor: '#9CA3AF',
              color: '#374151',
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                borderColor: '#6B7280',
                backgroundColor: '#F9FAFB'
              }
            }}
          >
            취소
          </Button>

          <Button
            onClick={() => openNotImplementedDialog('업데이트')}
            variant="contained"
            sx={{
              minWidth: '100px',
              height: '40px',
              borderRadius: '8px',
              backgroundColor: '#10B981',
              fontSize: '14px',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#059669'
              }
            }}
          >
            업데이트
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
