import { GuardProps } from 'types/auth';
import useAuth from 'hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { restoreRedirectTo } from 'utils/medipanda/redirectTo';

export function MpGuestGuard({ children }: GuardProps) {
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
