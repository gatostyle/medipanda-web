import { useSession } from '@/medipanda/hooks/useSession';
import { LinearProgress } from '@mui/material';
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
      window.location.replace('/');
    }
  };

  return <LinearProgress />;
}
