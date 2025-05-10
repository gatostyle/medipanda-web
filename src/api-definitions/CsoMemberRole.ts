export enum CsoMemberRole {
  Admin = 'ADMIN',
  Individual = 'INDIVIDUAL',
  Organization = 'ORGANIZATION',
  None = 'NONE'
}

export function isAdmin(user: { roles: string[] }): boolean {
  return user.roles.includes(CsoMemberRole.Admin);
}
