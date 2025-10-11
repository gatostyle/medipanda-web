import { typography } from '@/themes';
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
  | 'headingPc1T'
  | 'headingPc2B'
  | 'headingPc3B'
  | 'headingPc3M'
  | 'headingPc4B'
  | 'headingPc4R'
  | 'normalTextB'
  | 'normalTextM'
  | 'normalTextR'
  | 'normalPcB'
  | 'normalPcR'
  | 'largeTextEB'
  | 'largeTextB'
  | 'largeTextM'
  | 'largeTextR'
  | 'mediumTextB'
  | 'mediumTextM'
  | 'mediumTextR'
  | 'mediumTextL'
  | 'smallTextB'
  | 'smallTextM'
  | 'smallTextR'
  | 'smallPcR';

declare module '@mui/material' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TypographyVariantsOptions extends Record<MedipandaTypographyKeys, CSSProperties> {}

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface TypographyPropsVariantOverrides extends Record<MedipandaTypographyKeys, true> {}
}

export const medipandaTypographyTheme = createTheme({
  typography: {
    allVariants: {
      fontFamily: 'Pretendard',
      whiteSpace: 'nowrap',
    },
    'heading1.7B': typography['heading1.7B'],
    heading2B: typography.heading2B,
    heading2R: typography.heading2R,
    heading3B: typography.heading3B,
    heading3M: typography.heading3M,
    heading3R: typography.heading3R,
    heading4B: typography.heading4B,
    heading4M: typography.heading4M,
    heading4R: typography.heading4R,
    heading5B: typography.heading5B,
    heading5M: typography.heading5M,
    heading5R: typography.heading5R,
    headingPc1T: typography.headingPc1T,
    headingPc2B: typography.headingPc2B,
    headingPc3B: typography.headingPc3B,
    headingPc3M: typography.headingPc3M,
    headingPc4B: typography.headingPc4B,
    headingPc4R: typography.headingPc4R,
    normalTextB: typography.normalTextB,
    normalTextM: typography.normalTextM,
    normalTextR: typography.normalTextR,
    normalPcB: typography.normalPcB,
    normalPcR: typography.normalPcR,
    largeTextEB: typography.largeTextEB,
    largeTextB: typography.largeTextB,
    largeTextM: typography.largeTextM,
    largeTextR: typography.largeTextR,
    mediumTextB: typography.mediumTextB,
    mediumTextM: typography.mediumTextM,
    mediumTextR: typography.mediumTextR,
    mediumTextL: typography.mediumTextL,
    smallTextB: typography.smallTextB,
    smallTextM: typography.smallTextM,
    smallTextR: typography.smallTextR,
    smallPcR: typography.smallPcR,
  },
});
