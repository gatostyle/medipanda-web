import { delay } from 'utils/medipanda/delay';
import { mockPermissionCategories, mockPermissionFeatures } from 'api-mock-data/MpPermissionCategoriesMock';

export interface MpPermissionCategory {
  id: number;
  name: string;
  description?: string;
}

export interface MpPermissionFeature {
  id: number;
  name: string;
  description?: string;
}

export interface MpPermissionCategoriesResponse {
  categories: MpPermissionCategory[];
}

export interface MpPermissionFeaturesResponse {
  features: MpPermissionFeature[];
}

export async function mpFetchPermissionCategories(): Promise<MpPermissionCategoriesResponse> {
  await delay(500);
  return mockPermissionCategories;

  /*
  // TODO
  const axiosResponse = await axios.request<MpPermissionCategoriesResponse>({
    url: `/v1/permissions/categories`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
}

export async function mpFetchPermissionFeatures(): Promise<MpPermissionFeaturesResponse> {
  await delay(500);
  return mockPermissionFeatures;

  /*
  // TODO
  const axiosResponse = await axios.request<MpPermissionFeaturesResponse>({
    url: `/v1/permissions/features`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
}
