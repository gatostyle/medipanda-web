import { FixedLinearProgress } from './FixedLinearProgress';
import { useEffect, useState } from 'react';
import { useRouteError } from 'react-router-dom';

export function Base64ErrorBoundary() {
  const error = useRouteError();
  const [displayError, setDisplayError] = useState<string | null>(null);

  useEffect(() => {
    if (error instanceof TypeError && error.message.startsWith('Failed to fetch dynamically imported module:')) {
      window.location.reload();
    } else if (error instanceof Error) {
      setDisplayError(btoa(error.stack ?? error.message));
    } else {
      setDisplayError(btoa(JSON.stringify(error)));
    }
  }, [error]);

  if (displayError === null) {
    return <FixedLinearProgress />;
  }

  return (
    <>
      <p>페이지를 표시하는 중 오류가 발생했습니다. 문제가 계속되면 관리자에게 문의하세요.</p>
      <p style={{ width: '500px', wordBreak: 'break-all' }}>오류: {displayError}</p>
    </>
  );
}
