import './App.css';
import { LinearProgress } from '@mui/material';
import { RouterProvider } from 'react-router';
import { Providers } from './Providers.tsx';
import { router } from './routes.tsx';

export function App() {
  return (
    <>
      <Providers>
        <LinearProgress />
        <RouterProvider router={router} />
      </Providers>
    </>
  );
}
