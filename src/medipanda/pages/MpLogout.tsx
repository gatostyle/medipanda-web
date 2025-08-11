import Loader from 'components/Loader';
import { useSnackbar } from 'notistack';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { logout } from '../backend';

export default function MpLogout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const performLogout = async () => {
      const params = new URLSearchParams(location.search);
      const isAuthError = params.get('authError') === 'true';

      if (isAuthError) {
        enqueueSnackbar('인증이 만료되었습니다. 다시 로그인해주세요.', {
          variant: 'warning',
          autoHideDuration: 4000,
          preventDuplicate: true
        });
      }

      try {
        await logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        const redirectTo = params.get('redirectTo') ?? '/login';
        const authErrorParam = isAuthError ? '&authError=true' : '';
        navigate(`/login?redirectTo=${encodeURIComponent(redirectTo)}${authErrorParam}`, { replace: true });
      }
    };

    performLogout();
  }, [navigate, location, enqueueSnackbar]);

  return <Loader />;
}
