import { useSession } from '@/hooks/useSession';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { hasCsoMemberPermission } from '@/utils/member-utils';
import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function CsoMemberGuard({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasCsoMemberPermission(session!)) {
      alert('CSO 회원만 접근할 수 있는 페이지입니다.');
      navigate(-1);
    }
  }, [session]);

  if (!hasCsoMemberPermission(session!)) {
    return <FixedLinearProgress />;
  }

  return children;
}
