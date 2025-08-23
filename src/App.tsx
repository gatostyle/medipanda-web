import './App.css';
import { RouterProvider } from 'react-router';
import { Providers } from './Providers';
import { router } from './routes';

export function App() {
  return (
    <>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </>
  );
}
