import { type MemberDetailsResponse, Role } from '@/backend';

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
