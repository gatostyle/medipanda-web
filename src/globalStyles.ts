import { styled } from '@mui/material/styles';
import { Button, Chip, Pagination, TableCell, TableHead } from '@mui/material';

export const colors = {
  primary: '#6B3AA0',
  primaryDark: '#5a2d8a',
  primaryLight: 'rgba(107, 58, 160, 0.04)',
  primaryDarkLight: 'rgba(90, 45, 138, 0.08)',
  secondary: '#1E1B4B',
  success: '#10B981',
  error: '#f44336',
  errorDark: '#d32f2f',
  warning: '#ff9800',
  warningLight: 'rgba(255, 152, 0, 0.1)',
  gray100: '#f8f9fa',
  gray200: '#f0f0f0',
  gray300: '#e0e0e0',
  gray400: '#999',
  gray500: '#666',
  gray600: '#4B5563',
  gray700: '#333',

  gray10: '#f7f7f7',
  gray20: '#eeeeee',
  gray30: '#dddddd',
  gray40: '#cccccc',
  gray50: '#999999',
  gray70: '#333333',
  gray80: '#111111',
  white: '#FFFFFF',
  black: '#000000',
  blackOpacity10: 'rgba(0,0,0,0.1)',
  red: '#EF4444',
  orange: '#F97316',
  vividViolet: '#4D12EE',
  navy: '#0e2148',
  blue: '#005efe',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
};

export const typography = {
  heading2B: {
    fontSize: '24px',
    fontWeight: 700,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  heading3B: {
    fontSize: '36px',
    fontWeight: 700,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  heading3M: {
    fontSize: '36px',
    fontWeight: 500,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  heading3R: {
    fontSize: '36px',
    fontWeight: 400,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  heading4B: {
    fontSize: '20px',
    fontWeight: 700,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  heading4M: {
    fontSize: '20px',
    fontWeight: 500,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  heading4R: {
    fontSize: '20px',
    fontWeight: 400,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  heading5B: {
    fontSize: '18px',
    fontWeight: 700,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  heading5M: {
    fontSize: '18px',
    fontWeight: 500,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  heading5R: {
    fontSize: '18px',
    fontWeight: 400,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  normalTextB: {
    fontSize: '17px',
    fontWeight: 700,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  normalTextM: {
    fontSize: '17px',
    fontWeight: 500,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  normalTextR: {
    fontSize: '17px',
    fontWeight: 400,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  largeTextB: {
    fontSize: '16px',
    fontWeight: 700,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  largeTextM: {
    fontSize: '16px',
    fontWeight: 500,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  largeTextR: {
    fontSize: '16px',
    fontWeight: 400,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  mediumTextB: {
    fontSize: '14px',
    fontWeight: 700,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  mediumTextM: {
    fontSize: '14px',
    fontWeight: 500,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  mediumTextR: {
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  smallTextB: {
    fontSize: '12px',
    fontWeight: 700,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  smallTextM: {
    fontSize: '12px',
    fontWeight: 500,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
  smallTextR: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.5,
    whiteSpace: 'nowrap',
  },
};

export const StyledTableHead = styled(TableHead)({
  backgroundColor: colors.gray100,
  '& .MuiTableCell-head': {
    fontWeight: 600,
    color: colors.gray600,
    borderBottom: `1px solid ${colors.gray300}`,
    fontSize: '14px',
    padding: spacing.md,
  },
});

export const StyledTableCell = styled(TableCell)({
  padding: spacing.md,
  borderBottom: `1px solid ${colors.gray200}`,
  fontSize: '14px',
  color: colors.gray600,
});
