export enum MpMemberRole {
  Admin = 'ADMIN',
  Individual = 'INDIVIDUAL',
  Organization = 'ORGANIZATION',
  None = 'NONE'
}

export function isAdmin(user: { roles: string[] }): boolean {
  return user.roles.includes(MpMemberRole.Admin);
}
