import { createTheme } from '@mui/material';
import type { CSSProperties } from 'react';

type MedipandaTypographyKeys =
  | 'heading1.7B'
  | 'heading2B'
  | 'heading2R'
  | 'heading3B'
  | 'heading3M'
  | 'heading3R'
  | 'heading4B'
  | 'heading4M'
  | 'heading4R'
  | 'heading5B'
  | 'heading5M'
  | 'heading5R'
  | 'normalTextB'
  | 'normalTextM'
  | 'normalTextR'
  | 'largeTextB'
  | 'largeTextM'
  | 'largeTextR'
  | 'mediumTextB'
  | 'mediumTextM'
  | 'mediumTextR'
  | 'smallTextB'
  | 'smallTextM'
  | 'smallTextR';

declare module '@mui/material' {
  interface TypographyVariantsOptions extends Record<MedipandaTypographyKeys, CSSProperties> {}

  interface TypographyPropsVariantOverrides extends Record<MedipandaTypographyKeys, true> {}
}

export const medipandaTypographyTheme = createTheme({
  typography: {
    allVariants: {
      fontFamily: 'Pretendard',
      whiteSpace: 'nowrap',
    },
    'heading1.7B': {
      fontSize: '28px',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    heading2B: {
      fontSize: '24px',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    heading2R: {
      fontSize: '24px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    heading3B: {
      fontSize: '36px',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    heading3M: {
      fontSize: '36px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    heading3R: {
      fontSize: '36px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    heading4B: {
      fontSize: '20px',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    heading4M: {
      fontSize: '20px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    heading4R: {
      fontSize: '20px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    heading5B: {
      fontSize: '18px',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    heading5M: {
      fontSize: '18px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    heading5R: {
      fontSize: '18px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    normalTextB: {
      fontSize: '17px',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    normalTextM: {
      fontSize: '17px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    normalTextR: {
      fontSize: '17px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    largeTextB: {
      fontSize: '16px',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    largeTextM: {
      fontSize: '16px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    largeTextR: {
      fontSize: '16px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    mediumTextB: {
      fontSize: '14px',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    mediumTextM: {
      fontSize: '14px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    mediumTextR: {
      fontSize: '14px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    smallTextB: {
      fontSize: '12px',
      fontWeight: 700,
      lineHeight: 1.5,
    },
    smallTextM: {
      fontSize: '12px',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    smallTextR: {
      fontSize: '12px',
      fontWeight: 400,
      lineHeight: 1.5,
    },
  },
});
