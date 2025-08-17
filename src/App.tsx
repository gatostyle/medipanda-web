import './App.css';
import { RouterProvider } from 'react-router';
import { Providers } from './Providers.tsx';
import { router } from './routes.tsx';

export function App() {
  return (
    <>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </>
  );
}
