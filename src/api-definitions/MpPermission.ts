import { mockMemberPermission } from 'api-mock-data/MpPermissionMock';
import { delay } from 'utils/medipanda/delay';

export interface MpMemberPermission {
  category: string;
  feature: string;
  permissions: {
    Contracted: boolean;
    NonContracted: boolean;
  };
}

export interface MpMemberPermissionResponse {
  permissions: MpMemberPermission[];
}

export async function mpFetchMemberPermissions(): Promise<MpMemberPermissionResponse> {
  await delay(500);
  return mockMemberPermission;

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpMemberPermissionResponse>({
    url: `/v1/members/permissions`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
}
