import { logout } from '@/backend';
import { LinearProgress } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

export default function Logout() {
  const navigate = useNavigate();

  useEffect(() => {
    doLogout();
  }, []);

  const doLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      navigate(`/`, { replace: true });
    }
  };

  return <LinearProgress />;
}
