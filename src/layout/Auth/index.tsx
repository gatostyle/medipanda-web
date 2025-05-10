import { Outlet } from 'react-router-dom';

// project import
import { CsoGuestGuard } from 'utils/route-guard/cso-link';

// ==============================|| LAYOUT - AUTH ||============================== //

export default function AuthLayout() {
  return (
    <CsoGuestGuard>
      <Outlet />
    </CsoGuestGuard>
  );
}
