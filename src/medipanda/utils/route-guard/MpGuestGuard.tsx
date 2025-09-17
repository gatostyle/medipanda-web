import { FixedLinearProgress } from '@/lib/react/FixedLinearProgress';
import { useSession } from '@/medipanda/hooks/useSession';
import { type ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { restoreRedirectTo } from '../redirectTo';

interface MpGuestGuardProps {
  children: ReactNode;
}

export function MpGuestGuard({ children }: MpGuestGuardProps) {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && session) {
      navigate(restoreRedirectTo(location.search) ?? '/admin', { replace: true });
    }
  }, [session, isLoading, location.search]);

  if (isLoading) {
    return <FixedLinearProgress />;
  }

  return session ? <FixedLinearProgress /> : children;
}
