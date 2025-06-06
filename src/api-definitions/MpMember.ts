import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockMembers } from 'api-mock-data/MpMemberMock';
import { MpPartnershipType } from './MpPartnershipType';

export interface MpMember {
  id: number;
  memberNo: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  state: boolean | 'ACTIVE' | 'BLOCKED' | 'WITHDRAWN';
  csoCertification: boolean | string;
  password?: string;
  createdAt: string;
  partnershipType: MpPartnershipType;
  birthDate?: string;
  lastLoginAt?: string;
  referralCode?: string;
  businessInfo?: {
    name: string;
    contractDate: string;
    position: string;
    businessNo: string;
    address: string;
    registrationDate: string;
  };
  marketingConsent?: {
    sms: boolean;
    email: boolean;
    appPush: boolean;
  };
  memo?: string;
}

export interface MpMemberSearchRequest extends MpPagedRequest<MpMember> {
  searchType?: string;
  searchKeyword?: string;
  startAt?: string;
  endAt?: string;
}

export const mpFetchMembers = async (request: MpMemberSearchRequest): Promise<MpPagedResponse<MpMember>> => {
  await delay(500);

  let filteredMembers = Object.values(mockMembers);

  if (request.partnershipType) {
    filteredMembers = filteredMembers.filter((member) => member.partnershipType === request.partnershipType);
  }

  if (request.searchType && request.searchKeyword) {
    filteredMembers = filteredMembers.filter((member) => {
      switch (request.searchType) {
        case '이름':
          return member.name.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '아이디':
          return member.userId.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '휴대폰':
          return member.phone.includes(request.searchKeyword!);
        case '이메일':
          return member.email.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        default:
          return true;
      }
    });
  }

  if (request.startAt || request.endAt) {
    filteredMembers = filteredMembers.filter((member) => {
      const memberDate = new Date(member.createdAt);
      if (request.startAt && memberDate < new Date(request.startAt)) return false;
      if (request.endAt && memberDate > new Date(request.endAt)) return false;
      return true;
    });
  }

  if (request.sortProperty) {
    filteredMembers.sort((a, b) => {
      const aValue = a[request.sortProperty!];
      const bValue = b[request.sortProperty!];
      if (!aValue || !bValue) return 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return request.descending ? bValue.localeCompare(aValue) : aValue.localeCompare(bValue);
      }
      return request.descending ? (bValue > aValue ? 1 : -1) : aValue > bValue ? 1 : -1;
    });
  }

  const startIndex = request.page * request.size;
  const endIndex = startIndex + request.size;
  const paginatedMembers = filteredMembers.slice(startIndex, endIndex);

  const contentWithSequence: MpWithSequence<MpMember>[] = paginatedMembers.map((member, index) => ({
    ...member,
    sequence: filteredMembers.length - startIndex - index
  }));

  return {
    content: contentWithSequence,
    pageable: {
      pageNumber: request.page
    },
    totalPages: Math.ceil(filteredMembers.length / request.size),
    totalElements: filteredMembers.length
  };

  /*
  // TODO
  const axiosResponse = await axios.request<MpPagedResponse<MpMember>>({
    url: `/v1/members`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchMember = async (id: number): Promise<MpMember> => {
  await delay(500);

  const member = mockMembers[id];
  if (!member) {
    throw new Error('Member not found');
  }
  return member;

  /*
  // TODO
  const axiosResponse = await axios.request<MpMember>({
    url: `/v1/members/${id}`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
};

export const mpUpdateMember = async (id: number, member: Partial<MpMember>): Promise<void> => {
  await delay(500);

  if (mockMembers[id]) {
    mockMembers[id] = { ...mockMembers[id], ...member };
    return;
  }
  throw new Error('Member not found');

  /*
  // TODO
  await axios.request({
    url: `/v1/members/${id}`,
    method: 'PUT',
    data: member
  });
  */
};

export async function mpCreateMember(payload: Omit<MpMember, 'id'>): Promise<MpMember> {
  await delay(500);
  const newId = Math.max(...Object.keys(mockMembers).map(Number)) + 1;
  const newMember = { id: newId, ...payload };
  mockMembers[newId] = newMember;
  return newMember;

  /*
  // TODO
  const axiosResponse = await axios.request<MpMember>({
    url: `/v1/members`,
    method: 'POST',
    data: payload
  });
  return axiosResponse.data;
  */
}

export async function mpDeleteMember(id: number): Promise<void> {
  await delay(500);
  if (mockMembers[id]) {
    delete mockMembers[id];
    return;
  }
  throw new Error('Member not found');

  /*
  // TODO
  await axios.request({
    url: `/v1/members/${id}`,
    method: 'DELETE'
  });
  */
}

export const mpGetMemberExcelDownloadUrl = async (request: MpMemberSearchRequest): Promise<string> => {
  await delay(500);
  return '/mock/member-export.xlsx';

  /*
  // TODO
  const axiosResponse = await axios.request<{ downloadUrl: string }>({
    url: `/v1/members/export`,
    method: 'POST',
    data: request
  });
  return axiosResponse.data.downloadUrl;
  */
};
