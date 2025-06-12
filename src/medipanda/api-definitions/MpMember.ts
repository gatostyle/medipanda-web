import { NotImplementedError } from 'medipanda/api-definitions/NotImplementedError';
import { MemberUpdateRequest } from 'medipanda/backend';
import { mockString } from 'medipanda/mockup';

export const mpUpdateMemberFile = async (userId: string, data: MemberUpdateRequest, file?: File): Promise<void> => {
  throw new NotImplementedError(mockString('파일 변경'));
};
