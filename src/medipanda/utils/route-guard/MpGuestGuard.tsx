import Loader from 'components/Loader';
import { isMpAdmin, useMpSession } from '@/medipanda/hooks/useMpSession';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuardProps } from 'types/auth';

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
