import Loader from 'components/Loader';
import { isAdmin, useSession } from '@/medipanda/hooks/useSession';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuardProps } from 'types/auth';

export function MpGuestGuard({ children }: GuardProps) {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && session) {
      if (isAdmin(session)) {
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
