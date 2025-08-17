import { LinearProgress } from '@mui/material';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { logout } from '../backend';

export default function Logout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        navigate(`/`, { replace: true });
      }
    })();
  }, [navigate, location]);

  return <LinearProgress />;
}
