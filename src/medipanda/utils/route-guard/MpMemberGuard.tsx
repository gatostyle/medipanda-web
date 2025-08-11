import Loader from 'components/Loader';
import { isMpAdmin, useMpSession } from 'medipanda/hooks/useMpSession';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GuardProps } from 'types/auth';
import { saveRedirectTo } from '../redirectTo';

export function MpMemberGuard({ children }: GuardProps) {
  const { session, isLoading } = useMpSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!session) {
        navigate(saveRedirectTo(location), { replace: true });
      } else if (isMpAdmin(session)) {
        navigate('/admin', { replace: true });
      }
    }
  }, [session, isLoading, navigate, location]);

  if (isLoading || !session || isMpAdmin(session)) {
    return <Loader />;
  }

  return children;
}
