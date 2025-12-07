import { type MemberDetailsResponse, MemberType } from '@/backend';

export function hasContractMemberPermission(member: MemberDetailsResponse) {
  return member.partnerContractStatus === MemberType.INDIVIDUAL || member.partnerContractStatus === MemberType.ORGANIZATION;
}

export function hasCsoMemberPermission(member: MemberDetailsResponse) {
  return member.partnerContractStatus === MemberType.CSO || hasContractMemberPermission(member);
}
