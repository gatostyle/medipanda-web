import { type ElementType, Suspense } from 'react';
import { FixedLinearProgress } from './FixedLinearProgress';

export function LazyComponent(Component: ElementType) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any,react/display-name
  return (props: any) => {
    return (
      <Suspense fallback={<FixedLinearProgress />}>
        <Component {...props} />
      </Suspense>
    );
  };
}
