import { delay } from 'utils/medipanda/delay';
import { mockAdminMenuOptions } from 'api-mock-data/MpAdminMenuOptionsMock';

export interface MpAdminMenuOption {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface MpAdminMenuOptionsResponse {
  menuOptions: MpAdminMenuOption[];
}

export async function mpFetchAdminMenuOptions(): Promise<MpAdminMenuOptionsResponse> {
  await delay(500);
  return mockAdminMenuOptions;

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpAdminMenuOptionsResponse>({
    url: `/v1/admin/menu-options`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
}
