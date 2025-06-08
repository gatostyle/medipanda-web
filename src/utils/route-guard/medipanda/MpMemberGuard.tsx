import { GuardProps } from 'types/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { saveRedirectTo } from 'utils/medipanda/redirectTo';
import { isMpAdmin } from 'api-definitions/MpMemberRole';
import { useMpSession } from 'hooks/medipanda/useMpSession';

export function MpMemberGuard({ children }: GuardProps) {
  const { session } = useMpSession();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!session) {
      navigate(saveRedirectTo(location));
    } else if (isMpAdmin(session)) {
      navigate('/admin');
    }
  }, [session, navigate, location]);

  return children;
}
