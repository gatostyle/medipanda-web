import { Outlet } from 'react-router-dom';

// project import
import { MpGuestGuard } from 'medipanda/utils/route-guard';

// ==============================|| LAYOUT - AUTH ||============================== //

export default function AuthLayout() {
  return (
    <MpGuestGuard>
      <Outlet />
    </MpGuestGuard>
  );
}
