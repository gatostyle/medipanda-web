import { MpSession } from 'api-definitions/MpSession';

export enum MpMemberRole {
  SuperAdmin = 'SUPER_ADMIN',
  Admin = 'ADMIN',
  Individual = 'INDIVIDUAL',
  Organization = 'ORGANIZATION',
  None = 'NONE'
}

export function isMpAdmin(session: MpSession) {
  return session.role === MpMemberRole.SuperAdmin || session.role === MpMemberRole.Admin;
}

export function isMpSuperAdmin(session: MpSession) {
  return session.role === MpMemberRole.SuperAdmin;
}
