import { logout } from '@/backend';
import { LinearProgress } from '@mui/material';
import { useEffect } from 'react';

export default function Logout() {
  useEffect(() => {
    doLogout();
  }, []);

  const doLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      location.replace('/');
    }
  };

  return <LinearProgress />;
}
