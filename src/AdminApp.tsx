import { AdminProviders } from '@/providers-admin';
import { adminRouter } from '@/routes-admin';
import { RouterProvider } from 'react-router';
import './AdminApp.scss';

export function AdminApp() {
  return (
    <>
      <AdminProviders>
        <RouterProvider router={adminRouter} />
      </AdminProviders>
    </>
  );
}
