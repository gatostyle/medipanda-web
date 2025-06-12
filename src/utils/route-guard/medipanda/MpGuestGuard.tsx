import { GuardProps } from 'types/auth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useMpSession } from 'hooks/medipanda/useMpSession';
import { isMpAdmin } from 'api-definitions/MpMemberRole';
import Loader from 'components/Loader';

export function MpGuestGuard({ children }: GuardProps) {
  const { session, isLoading } = useMpSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && session) {
      if (isMpAdmin(session)) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  return session ? <Loader /> : children;
}
