import { useSession } from '@/hooks/useSession';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { type ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function LoginMemberGuard({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (session === null) {
      navigate(`/login?redirectTo=${encodeURIComponent(location.pathname + location.search)}`, { replace: true });
    }
  }, [session]);

  if (session === null) {
    return <FixedLinearProgress />;
  }

  return children;
}
