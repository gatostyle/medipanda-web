import { FixedLinearProgress } from '@/lib/react/FixedLinearProgress';
import { AdminPermission, getPermissions } from '@/backend';
import { isSuperAdmin, useSession } from '@/medipanda/hooks/useSession';
import { type ReactNode, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveRedirectTo } from '../redirectTo';

interface MpAdminGuardProps {
  children: ReactNode;
  requiredPermission?: keyof typeof AdminPermission;
}

export function MpAdminGuard({ children, requiredPermission }: MpAdminGuardProps) {
  const { session, isLoading } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const checkPermission = async () => {
      if (isLoading) {
        return;
      }

      if (!session) {
        navigate(saveRedirectTo(location.pathname + location.search), { replace: true });
        return;
      }

      if (requiredPermission) {
        if (isSuperAdmin(session)) {
          setHasPermission(true);
        } else {
          try {
            const userId = session.userId;

            const userPermissions = (await getPermissions(userId)).permissions;
            const hasRequiredPermission = userPermissions.includes(requiredPermission);
            setHasPermission(hasRequiredPermission);

            if (!hasRequiredPermission) {
              navigate('/admin', { replace: true });
            }
          } catch (error) {
            console.error('권한 확인 실패:', error);
            setHasPermission(false);
            window.history.back();
          }
        }
      } else {
        setHasPermission(true);
      }
    };

    checkPermission();
  }, [session, isLoading, location, requiredPermission]);

  if (isLoading || (requiredPermission && hasPermission === null)) {
    return <FixedLinearProgress />;
  }

  if (!session || (requiredPermission && hasPermission === false)) {
    return <FixedLinearProgress />;
  }

  return children;
}
