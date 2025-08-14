import { LinearProgress } from '@mui/material';
import { type ElementType, Suspense } from 'react';

export function Loadable(Component: ElementType) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,react/display-name
  return (props: any) => (
    <Suspense fallback={<LinearProgress />}>
      <Component {...props} />
    </Suspense>
  );
}
