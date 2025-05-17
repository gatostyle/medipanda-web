import { Outlet } from 'react-router-dom';

// project import
import { MpGuestGuard } from 'utils/route-guard/medipanda';

// ==============================|| LAYOUT - AUTH ||============================== //

export default function AuthLayout() {
  return (
    <MpGuestGuard>
      <Outlet />
    </MpGuestGuard>
  );
}
