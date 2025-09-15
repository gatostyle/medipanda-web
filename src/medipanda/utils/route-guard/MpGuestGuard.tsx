import { FixedLinearProgress } from '@/lib/react/FixedLinearProgress';
import { isAdmin, useSession } from '@/medipanda/hooks/useSession';
import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface MpGuestGuardProps {
  children: ReactNode;
}

export function MpGuestGuard({ children }: MpGuestGuardProps) {
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
    return <FixedLinearProgress />;
  }

  return session ? <FixedLinearProgress /> : children;
}
