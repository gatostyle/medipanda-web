import { GuardProps } from 'types/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { saveRedirectTo } from 'medipanda/utils/redirectTo';
import { isMpAdmin } from 'medipanda/utils/MpMemberRole';
import { useMpSession } from 'medipanda/hooks/useMpSession';
import Loader from 'components/Loader';

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
