import { colors } from '@/themes';
import { Close } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, IconButton, Stack, Typography } from '@mui/material';
import type { ComponentProps, CSSProperties } from 'react';

export function MedipandaDialog({ width, ...props }: Omit<ComponentProps<typeof Dialog>, 'sx'> & { width?: CSSProperties['width'] }) {
  return (
    <Dialog
      {...props}
      maxWidth={false}
      sx={{
        '& .MuiDialog-paper': {
          width,
          borderRadius: '20px',
        },
      }}
    />
  );
}

export function MedipandaDialogTitle({ title, onClose }: { title?: string; onClose?: () => void }) {
  return (
    <DialogTitle
      component={Stack}
      direction='row'
      alignItems='center'
      sx={{
        padding: '20px 30px',
        boxSizing: 'border-box',
        backgroundColor: colors.gray10,
      }}
    >
      <Typography variant='heading2B' sx={{ color: colors.gray80 }}>
        {title}
      </Typography>
      {onClose && (
        <IconButton
          onClick={onClose}
          sx={{
            marginLeft: 'auto',
          }}
        >
          <Close width={40} height={40} />
        </IconButton>
      )}
    </DialogTitle>
  );
}

export function MedipandaDialogContent(props: ComponentProps<typeof DialogContent>) {
  return (
    <DialogContent
      {...props}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        padding: '40px 30px 60px 30px',
      }}
    />
  );
}
