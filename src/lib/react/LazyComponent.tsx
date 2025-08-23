import { type ElementType, Suspense } from 'react';
import { FixedLinearLoader } from './FixedLinearLoader';

export function LazyComponent(Component: ElementType) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,react/display-name
  return (props: any) => {
    return (
      <Suspense fallback={<FixedLinearLoader />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
