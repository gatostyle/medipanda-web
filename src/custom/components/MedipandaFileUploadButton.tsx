import { colors } from '@/themes';
import { Button } from '@mui/material';
import type { ComponentProps } from 'react';

export function MedipandaFileUploadButton({
  accept,
  multiple,
  onChange,
  ...props
}: Omit<ComponentProps<typeof Button>, 'onChange'> & { accept?: string; multiple?: boolean; onChange?: (files: File[]) => void }) {
  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';

    if (accept !== undefined) {
      input.accept = accept;
    }

    input.multiple = multiple ?? false;

    input.onchange = () => onChange?.(input.files ? Array.from(input.files) : []);
    input.click();
  };

  return (
    <Button
      {...props}
      variant='outlined'
      startIcon={<img src='/assets/icons/icon-file-upload.svg' />}
      onClick={() => handleFileUpload()}
      sx={{
        ...props.sx,
        height: '50px',
        marginLeft: 'auto',
        borderColor: colors.gray40,
        color: colors.gray50,
      }}
    >
      파일 올리기
    </Button>
  );
}
