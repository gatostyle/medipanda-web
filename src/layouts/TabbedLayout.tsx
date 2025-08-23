import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '@/custom/components/MedipandaTab';
import { colors } from '@/themes';
import { Typography } from '@mui/material';
import { memo } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router';

interface TabbedLayoutProps {
  title: string;
  tabConfig: { label: string; to: string }[];
}

function TabbedLayout({ title, tabConfig }: TabbedLayoutProps) {
  const location = useLocation();

  return (
    <>
      <Typography variant='heading3M' sx={{ color: colors.gray80 }}>
        {title}
      </Typography>

      <MedipandaTabs
        value={tabConfig.findIndex(({ to }) => location.pathname.startsWith(new URL(to, window.location.origin).pathname))}
        sx={{
          marginTop: '30px',
          marginBottom: '40px',
        }}
      >
        {tabConfig.map(({ label, to }) => (
          <MedipandaTab key={label} label={label} component={RouterLink} to={to} />
        ))}
        <MedipandaTabElse />
      </MedipandaTabs>

      <Outlet />
    </>
  );
}

export default memo(TabbedLayout);
