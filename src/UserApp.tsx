import { UserProviders } from '@/providers-user';
import { userRouter } from '@/routes-user';
import { RouterProvider } from 'react-router';
import './UserApp.scss';

export function UserApp() {
  return (
    <>
      <UserProviders>
        <RouterProvider router={userRouter} />
      </UserProviders>
    </>
  );
}
