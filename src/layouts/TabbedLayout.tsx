import { Typography } from '@mui/material';
import { memo } from 'react';
import { Link as RouterLink, Outlet, useLocation } from 'react-router';
import { MedipandaTab, MedipandaTabElse, MedipandaTabs } from '../components/MedipandaTab.tsx';
import { colors, typography } from '../globalStyles.ts';

interface TabbedLayoutProps {
  title: string;
  tabConfig: { label: string; to: string }[];
}

function TabbedLayout({ title, tabConfig }: TabbedLayoutProps) {
  const location = useLocation();

  return (
    <>
      <Typography
        sx={{
          ...typography.heading3M,
          color: colors.gray80,
        }}
      >
        {title}
      </Typography>

      <MedipandaTabs
        value={tabConfig.findIndex(({ to }) => location.pathname.startsWith(new URL(to, window.location.origin).pathname))}
        sx={{
          width: '100%',
          marginTop: '30px',
          marginBottom: '40px',
        }}
      >
        {tabConfig.map(({ label, to }) => (
          <MedipandaTab label={label} component={RouterLink} to={to} />
        ))}
        <MedipandaTabElse />
      </MedipandaTabs>

      <Outlet />
    </>
  );
}

export default memo(TabbedLayout);
