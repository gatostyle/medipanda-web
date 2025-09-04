import { MemberUpdateRequest } from '@/backend';
import { mockString } from '@/medipanda/mockup';
import { NotImplementedError } from './NotImplementedError';

export const mpUpdateMemberFile = async (userId: string, data: MemberUpdateRequest, file?: File): Promise<void> => {
  throw new NotImplementedError(mockString('파일 변경'));
};
