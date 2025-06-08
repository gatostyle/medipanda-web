import axios from 'axios';
import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockMembers } from 'api-mock-data/MpMemberMock';
import { MpPartnershipType } from './MpPartnershipType';

export interface MemberResponse {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string;
  birthDate: string;
  email: string;
  partnerContractStatus: 'NONE' | 'INDIVIDUAL' | 'ORGANIZATION';
  marketingConsent: boolean;
  registrationDate: string;
  lastLoginDate: string;
}

export interface MarketingAgreements {
  sms: boolean;
  email: boolean;
  push: boolean;
}

export interface MemberDetailsResponse {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string;
  birthDate: string;
  email: string;
  partnerContractStatus: 'NONE' | 'INDIVIDUAL' | 'ORGANIZATION';
  marketingAgreements: MarketingAgreements;
  referralCode?: string;
  csoCertUrl?: string;
  registrationDate: string;
  lastLoginDate: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface MpMember {
  id: number;
  memberNo?: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  state?: boolean | 'ACTIVE' | 'BLOCKED' | 'WITHDRAWN' | null;
  csoCertification?: boolean | string | null;
  password?: string;
  createdAt: string;
  partnershipType: MpPartnershipType;
  birthDate?: string;
  lastLoginAt?: string;
  referralCode?: string | null;
  businessInfo?: {
    name: string;
    contractDate: string;
    position: string;
    businessNo: string;
    address: string;
    registrationDate: string;
  };
  marketingConsent?: boolean | MarketingAgreements;
  memo?: string;
}

export interface MpMemberSearchRequest extends MpPagedRequest<MpMember> {
  searchType?: string;
  searchKeyword?: string;
  startAt?: string;
  endAt?: string;
  partnershipType?: MpPartnershipType;
}

const convertMemberResponseToMpMember = (apiMember: MemberResponse): MpMember => {
  const partnershipTypeMap: Record<string, MpPartnershipType> = {
    NONE: MpPartnershipType.NONE,
    INDIVIDUAL: MpPartnershipType.INDIVIDUAL,
    ORGANIZATION: MpPartnershipType.CORPORATE
  };

  return {
    id: apiMember.id,
    userId: apiMember.userId,
    name: apiMember.name,
    email: apiMember.email,
    phone: apiMember.phoneNumber,
    createdAt: apiMember.registrationDate,
    partnershipType: partnershipTypeMap[apiMember.partnerContractStatus] || MpPartnershipType.NONE,
    birthDate: apiMember.birthDate,
    lastLoginAt: apiMember.lastLoginDate,
    marketingConsent: apiMember.marketingConsent,
    memberNo: apiMember.id.toString(), // FIXME Need API fix
    state: null, // FIXME Need API fix
    csoCertification: null, // FIXME Need API fix
    referralCode: null // FIXME Need API fix
  };
};

const convertMemberDetailsResponseToMpMember = (apiMember: MemberDetailsResponse): MpMember => {
  const partnershipTypeMap: Record<string, MpPartnershipType> = {
    NONE: MpPartnershipType.NONE,
    INDIVIDUAL: MpPartnershipType.INDIVIDUAL,
    ORGANIZATION: MpPartnershipType.CORPORATE
  };

  return {
    id: apiMember.id,
    userId: apiMember.userId,
    name: apiMember.name,
    email: apiMember.email,
    phone: apiMember.phoneNumber,
    createdAt: apiMember.registrationDate,
    partnershipType: partnershipTypeMap[apiMember.partnerContractStatus] || MpPartnershipType.NONE,
    birthDate: apiMember.birthDate,
    lastLoginAt: apiMember.lastLoginDate,
    marketingConsent: {
      sms: apiMember.marketingAgreements.sms,
      email: apiMember.marketingAgreements.email,
      push: apiMember.marketingAgreements.push
    },
    memberNo: apiMember.id.toString(), // FIXME Need API fix
    state: null, // FIXME Need API fix
    csoCertification: apiMember.csoCertUrl ? true : null,
    referralCode: apiMember.referralCode || null,
    businessInfo: undefined, // FIXME Need API fix
    memo: undefined // FIXME Need API fix
  };
};

export const mpFetchMembers = async (request: MpMemberSearchRequest): Promise<MpPagedResponse<MpMember>> => {
  const hasSearchFilters = request.partnershipType || request.searchKeyword || request.startAt || request.endAt;

  if (hasSearchFilters) {
    throw new Error('NOT_IMPLEMENTED'); // FIXME Need API Fix
  }

  const axiosResponse = await axios.request<MpPagedResponse<MemberResponse>>({
    url: `/v1/members`,
    method: 'GET',
    params: {
      page: request.page,
      size: request.size
    }
  });

  const convertedContent: MpWithSequence<MpMember>[] = axiosResponse.data.content.map((member, index) => ({
    ...convertMemberResponseToMpMember(member),
    sequence: axiosResponse.data.totalElements - request.page * request.size - index
  }));

  return {
    ...axiosResponse.data,
    content: convertedContent
  };
};

export const mpFetchMember = async (userId: string): Promise<MpMember> => {
  const axiosResponse = await axios.request<MemberDetailsResponse>({
    url: `/v1/members/${userId}/details`,
    method: 'GET'
  });

  return convertMemberDetailsResponseToMpMember(axiosResponse.data);
};

export const mpUpdateMember = async (userId: string, member: Partial<MpMember>): Promise<void> => {
  await delay(500);

  const memberEntry = Object.values(mockMembers).find((m) => m.userId === userId);
  if (memberEntry) {
    Object.assign(memberEntry, member);
    return;
  }
  throw new Error('Member not found');

  /*
  // FIXME Use API Instead of mockup data
  await axios.request({
    url: `/v1/members/${userId}`,
    method: 'PATCH',
    data: member
  });
  */
};

export const mpGetMemberExcelDownloadUrl = async (request: MpMemberSearchRequest): Promise<string> => {
  await delay(500);
  return '/mock/member-export.xlsx';

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<{ downloadUrl: string }>({
    url: `/v1/members/export`,
    method: 'POST',
    data: request
  });
  return axiosResponse.data.downloadUrl;
  */
};
