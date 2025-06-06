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
  // TODO
  const axiosResponse = await axios.request<MpMemberPermissionResponse>({
    url: `/v1/members/permissions`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
}

export async function mpCreateMemberPermission(permission: MpMemberPermission): Promise<void> {
  await delay(500);
  mockMemberPermission.permissions.push(permission);
  return;

  /*
  // TODO
  await axios.request({
    url: `/v1/members/permissions`,
    method: 'POST',
    data: permission
  });
  */
}

export async function mpUpdateMemberPermission(
  category: string,
  feature: string,
  permission: Partial<MpMemberPermission['permissions']>
): Promise<void> {
  await delay(500);
  const permissionIndex = mockMemberPermission.permissions.findIndex((p) => p.category === category && p.feature === feature);
  if (permissionIndex !== -1) {
    mockMemberPermission.permissions[permissionIndex].permissions = {
      ...mockMemberPermission.permissions[permissionIndex].permissions,
      ...permission
    };
    return;
  }
  throw new Error('Permission not found');

  /*
  // TODO
  await axios.request({
    url: `/v1/members/permissions/${category}/${feature}`,
    method: 'PUT',
    data: permission
  });
  */
}

export async function mpDeleteMemberPermission(category: string, feature: string): Promise<void> {
  await delay(500);
  const permissionIndex = mockMemberPermission.permissions.findIndex((p) => p.category === category && p.feature === feature);
  if (permissionIndex !== -1) {
    mockMemberPermission.permissions.splice(permissionIndex, 1);
    return;
  }
  throw new Error('Permission not found');

  /*
  // TODO
  await axios.request({
    url: `/v1/members/permissions/${category}/${feature}`,
    method: 'DELETE'
  });
  */
}
