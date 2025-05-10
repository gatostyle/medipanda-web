import { GuardProps } from 'types/auth';
import useAuth from 'hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { restoreRedirectTo } from 'utils/cso-link/redirectTo';

export function CsoGuestGuard({ children }: GuardProps) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoggedIn) {
      navigate(restoreRedirectTo(location));
    }
  }, [isLoggedIn, navigate, location]);

  return children;
}
