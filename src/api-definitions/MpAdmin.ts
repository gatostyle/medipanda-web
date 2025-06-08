import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import axios from 'axios';

export interface MpAdmin {
  id: number;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  state: boolean;
  createdAt: string;
}

export interface MpAdminSearchParams extends MpPagedRequest<MpAdmin> {
  sortProperty?: keyof MpAdmin;
  descending?: boolean;
  userId?: string;
  email?: string;
  phone?: string;
}

export interface AdminResponse {
  id: number;
  userId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  state: boolean;
  createdAt: string;
}

export interface AdminSearchRequest {
  page: number;
  size: number;
  sortProperty?: keyof AdminResponse;
  descending?: boolean;
  userId?: string;
  email?: string;
  phone?: string;
}

export interface MemberResponse {
  id: number;
  userId: string;
  name: string;
  phoneNumber: string;
  birthDate: string;
  email: string;
  partnerContractStatus: string;
  marketingConsent: boolean;
  registrationDate: string;
  lastLoginDate: string;
}

export interface AdminPermissionsResponse {
  role: string;
  state: boolean;
  permissions: string[];
}

const convertAdminResponseToMpAdmin = (admin: AdminResponse): MpAdmin => {
  return {
    id: admin.id,
    userId: admin.userId,
    name: admin.name,
    email: admin.email,
    phone: admin.phone,
    role: admin.role,
    state: admin.state,
    createdAt: admin.createdAt
  };
};

const convertMemberAndPermissionsToMpAdmin = (member: MemberResponse, permissions: AdminPermissionsResponse): MpAdmin => {
  return {
    id: member.id,
    userId: member.userId,
    name: member.name,
    email: member.email,
    phone: member.phoneNumber,
    role: permissions.role,
    state: permissions.state,
    createdAt: member.registrationDate
  };
};

export async function mpFetchAdmins(params: MpAdminSearchParams): Promise<MpPagedResponse<MpAdmin>> {
  if (params.userId || params.email || params.phone) {
    throw new Error('NOT_IMPLEMENTED'); // FIXME Need API Fix
  }

  const searchRequest: AdminSearchRequest = {
    page: params.page,
    size: params.size,
    sortProperty: params.sortProperty,
    descending: params.descending,
    userId: params.userId,
    email: params.email,
    phone: params.phone
  };

  const axiosResponse = await axios.request<MpPagedResponse<AdminResponse>>({
    url: `/v1/members/admins`,
    method: 'GET',
    params: searchRequest
  });

  const contentWithSequence: MpWithSequence<MpAdmin>[] = axiosResponse.data.content
    .map(convertAdminResponseToMpAdmin)
    .map((admin, index) => ({
      ...admin,
      sequence: axiosResponse.data.totalElements - params.page * params.size - index
    }));

  return {
    ...axiosResponse.data,
    content: contentWithSequence
  };
}

export const mpFetchAdminByUserIdFromApi = async (userId: string): Promise<MpAdmin> => {
  const [memberResponse, permissionsResponse] = await Promise.all([
    axios.get<MemberResponse>(`/v1/members/${userId}/details`),
    axios.get<AdminPermissionsResponse>(`/v1/members/admins/${userId}/permissions`)
  ]);

  return convertMemberAndPermissionsToMpAdmin(memberResponse.data, permissionsResponse.data);
};

export const mpFetchAdminByUserId = async (userId: string): Promise<MpAdmin> => {
  return await mpFetchAdminByUserIdFromApi(userId);
};

export const mpFetchCurrentUserPermissions = async (userId: string): Promise<string[]> => {
  const permissionsResponse = await axios.get<AdminPermissionsResponse>(`/v1/members/admins/${userId}/permissions`);
  return permissionsResponse.data.permissions;
};
