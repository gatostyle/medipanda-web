import { type ElementType, Suspense } from 'react';
import { FixedLoader } from './FixedLoader.tsx';

export function Loadable(Component: ElementType) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,react/display-name
  return (props: any) => {
    return (
      <Suspense fallback={<FixedLoader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
