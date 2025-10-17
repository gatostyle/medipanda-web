import { Link } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';

export default function Error404() {
  return (
    <Stack
      spacing={2}
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        pt: 2,
        pb: 1,
        overflow: 'hidden',
      }}
    >
      <Typography variant='h1'>Page Not Found</Typography>
      <Button component={Link} to={'/'} variant='contained'>
        Back To Home
      </Button>
    </Stack>
  );
}
