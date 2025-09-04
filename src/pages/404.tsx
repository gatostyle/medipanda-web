import { Button, Grid, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Error404() {
  return (
    <Grid
      container
      spacing={10}
      direction='column'
      alignItems='center'
      justifyContent='center'
      sx={{ minHeight: '100vh', pt: 2, pb: 1, overflow: 'hidden' }}
    >
      <Grid size={{ xs: 12 }}>
        <Stack spacing={2} justifyContent='center' alignItems='center'>
          <Typography>Page Not Found</Typography>
          <Button component={Link} to={import.meta.env.VITE_BASE_NAME} variant='text'>
            Back To Home
          </Button>
        </Stack>
      </Grid>
    </Grid>
  );
}
