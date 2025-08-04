// material-ui
import Box from '@mui/material/Box';

import { useMpSession } from 'medipanda/hooks/useMpSession';
import IconButton from 'components/@extended/IconButton';
import { Logout } from 'iconsax-react';
import { useNavigate } from 'react-router';

// ==============================|| HEADER - CONTENT ||============================== //

export default function HeaderContent() {
  const navigate = useNavigate();
  const { logout } = useMpSession();

  const handleLogout = async () => {
    try {
      await logout();
      navigate(`/login`, {
        state: {
          from: ''
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Box sx={{ width: '100%', ml: 1 }} />

      <IconButton size="large" color="error" sx={{ p: 1 }} onClick={handleLogout}>
        <Logout variant="Bulk" />
      </IconButton>
    </>
  );
}
