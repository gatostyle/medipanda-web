import { OutlinedInput } from '@mui/material';
import { styled } from '@mui/material/styles';

export const MedipandaOutlinedInput = styled(OutlinedInput)({
  borderRadius: '5px',

  '& .MuiOutlinedInput-input': {
    boxSizing: 'border-box',
  },
}) as unknown as typeof OutlinedInput;
