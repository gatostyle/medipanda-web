import { GuardProps } from 'types/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { restoreRedirectTo } from 'utils/medipanda/redirectTo';
import { useMpSession } from 'hooks/medipanda/useMpSession';

export function MpGuestGuard({ children }: GuardProps) {
  const { session } = useMpSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (session) {
      navigate(restoreRedirectTo(location));
    }
  }, [session, navigate, location]);

  return children;
}
