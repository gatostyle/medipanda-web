import { MemberDetailsResponse } from 'medipanda/backend';

export function isMpAdmin(member: MemberDetailsResponse) {
  return member.role === 'SUPER_ADMIN' || member.role === 'ADMIN';
}

export function isMpSuperAdmin(member: MemberDetailsResponse) {
  return member.role === 'SUPER_ADMIN';
}
