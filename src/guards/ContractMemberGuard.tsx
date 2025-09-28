import { hasContractMemberPermission, useSession } from '@/hooks/useSession';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function ContractMemberGuard({ children }: { children: ReactNode }) {
  const { session } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hasContractMemberPermission(session!)) {
      alert('계약회원만 접근할 수 있는 페이지입니다.');
      navigate(-1);
    }
  }, [session]);

  if (!hasContractMemberPermission(session!)) {
    return <FixedLinearProgress />;
  }

  return children;
}
