import { FixedLinearProgress } from '@/lib/react/FixedLinearProgress';
import { AdminPermission, getPermissions } from '@/backend';
import { isAdmin, isSuperAdmin, useSession } from '@/medipanda/hooks/useSession';
import { ReactNode, useEffect, useState } from 'react';
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
        navigate(saveRedirectTo(location), { replace: true });
        return;
      }

      if (!isAdmin(session)) {
        navigate('/', { replace: true });
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
            navigate('/admin', { replace: true });
          }
        }
      } else {
        setHasPermission(true);
      }
    };

    checkPermission();
  }, [session, isLoading, navigate, location, requiredPermission]);

  if (isLoading || (requiredPermission && hasPermission === null)) {
    return <FixedLinearProgress />;
  }

  if (!session || !isAdmin(session) || (requiredPermission && hasPermission === false)) {
    return <FixedLinearProgress />;
  }

  return children;
}
