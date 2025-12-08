import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { useSession } from '@/hooks/useSession';
import { useEffect } from 'react';

export default function MpLogout() {
  const { logout } = useSession();

  useEffect(() => {
    doLogout();
  }, []);

  const doLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.replace(import.meta.env.VITE_APP_BASE_NAME ?? '/');
    }
  };

  return <FixedLinearProgress />;
}
