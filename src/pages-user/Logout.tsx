import { useSession } from '@/hooks/useSession';
import { LinearProgress } from '@mui/material';
import { useEffect } from 'react';

export default function Logout() {
  const { logout } = useSession();

  useEffect(() => {
    doLogout();
  }, []);

  const doLogout = async () => {
    try {
      localStorage.removeItem('autoLogin');
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      window.location.replace('/');
    }
  };

  return <LinearProgress />;
}
