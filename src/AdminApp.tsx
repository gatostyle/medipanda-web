import { AdminProviders } from '@/providers-admin';
import { adminRouter } from '@/routes-admin';
import { RouterProvider } from 'react-router';

export function AdminApp() {
  return (
    <>
      <AdminProviders>
        <RouterProvider router={adminRouter} />
      </AdminProviders>
    </>
  );
}
