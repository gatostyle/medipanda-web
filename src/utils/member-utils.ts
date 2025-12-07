import { type MemberDetailsResponse, MemberType, Role } from '@/backend';

export function isAdmin(member: MemberDetailsResponse) {
  return member.role === Role.SUPER_ADMIN || member.role === Role.ADMIN;
}

export function isSuperAdmin(member: MemberDetailsResponse) {
  return member.role === Role.SUPER_ADMIN;
}

export class NotAdminError extends Error {
  constructor() {
    super('Access denied. Admins only.');
    this.name = 'NotAdminError';
  }
}

export function hasContractMemberPermission(member: MemberDetailsResponse) {
  return member.partnerContractStatus === MemberType.INDIVIDUAL || member.partnerContractStatus === MemberType.ORGANIZATION;
}

export function hasCsoMemberPermission(member: MemberDetailsResponse) {
  return member.partnerContractStatus === MemberType.CSO || hasContractMemberPermission(member);
}
