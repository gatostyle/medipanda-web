import { Tab, Tabs } from '@mui/material';
import { styled } from '@mui/material/styles';
import { colors, typography } from '../globalStyles.ts';

export const MedipandaTabs = styled(Tabs)({
  '& .MuiTabs-indicator': {
    display: 'none',
  },
}) as typeof Tabs;

export const MedipandaTab = styled(Tab)({
  ...typography.largeTextB,
  color: colors.gray80,
  width: '200px',
  border: `1px solid ${colors.gray40}`,
  borderRadius: '5px 5px 0 0',
  '&:not(.Mui-selected)': {
    backgroundColor: colors.gray20,
    color: colors.gray50,
  },
  '&.Mui-selected': {
    color: colors.gray80,
    borderBottom: 'unset',
  },
}) as typeof Tab;

export const MedipandaTabElse = styled(Tab)({
  pointerEvents: 'none',
  flexGrow: 1,
  maxWidth: 'unset',
  borderBottom: `1px solid ${colors.gray40}`,
}) as typeof Tab;
