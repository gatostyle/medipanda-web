import { GuardProps } from 'types/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { saveRedirectTo } from 'utils/medipanda/redirectTo';
import { isMpAdmin, isMpSuperAdmin } from 'api-definitions/MpMemberRole';
import { mpFetchCurrentUserPermissions } from 'api-definitions/MpAdmin';
import Loader from 'components/Loader';
import { useMpSession } from 'hooks/medipanda/useMpSession';

interface MpAdminGuardProps extends GuardProps {
  requiredPermission?: string;
}

export function MpAdminGuard({ children, requiredPermission }: MpAdminGuardProps) {
  const { session } = useMpSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      if (!session) {
        navigate(saveRedirectTo(location));
        return;
      }

      if (!isMpAdmin(session)) {
        navigate('/');
        return;
      }

      if (requiredPermission) {
        if (isMpSuperAdmin(session)) {
          setHasPermission(true);
        } else {
          try {
            const userId = session.userId;

            const userPermissions = await mpFetchCurrentUserPermissions(userId);
            const hasRequiredPermission = userPermissions.includes(requiredPermission);
            setHasPermission(hasRequiredPermission);

            if (!hasRequiredPermission) {
              navigate('/admin');
            }
          } catch (error) {
            console.error('권한 확인 실패:', error);
            setHasPermission(false);
            navigate('/admin');
          }
        }
      } else {
        setHasPermission(true);
      }
    };

    checkPermission();
  }, [session, navigate, location, requiredPermission]);

  if (requiredPermission && hasPermission === null) {
    return <Loader />;
  }

  if (requiredPermission && hasPermission === false) {
    return <Loader />;
  }

  return children;
}
