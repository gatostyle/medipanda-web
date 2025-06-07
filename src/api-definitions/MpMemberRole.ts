export enum MpMemberRole {
  SuperAdmin = 'SUPER_ADMIN',
  Admin = 'ADMIN',
  Individual = 'INDIVIDUAL',
  Organization = 'ORGANIZATION',
  None = 'NONE'
}

export function isAdmin(user: { role: string }): boolean {
  return user.role === MpMemberRole.SuperAdmin || user.role === MpMemberRole.Admin;
}
