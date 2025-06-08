import { MpMemberRole } from 'api-definitions/MpMemberRole';

export interface MpSession {
  userId: string;
  name: string;
  role: MpMemberRole;
  permissions: string[];
}
