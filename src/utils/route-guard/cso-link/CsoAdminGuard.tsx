import { GuardProps } from 'types/auth';
import useAuth from 'hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { saveRedirectTo } from 'utils/cso-link/redirectTo';
import { isAdmin } from 'api-definitions/CsoMemberRole';

export function CsoAdminGuard({ children }: GuardProps) {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate(saveRedirectTo(location));
    } else if (!isAdmin(user!!)) {
      navigate('/');
    }
  }, [user, isLoggedIn, navigate, location]);

  return children;
}
