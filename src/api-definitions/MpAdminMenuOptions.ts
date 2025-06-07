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

export async function mpUpdateAdminMenuOption(id: number, updates: Partial<Omit<MpAdminMenuOption, 'id'>>): Promise<void> {
  await delay(500);
  const option = mockAdminMenuOptions.menuOptions.find((opt) => opt.id === id);
  if (option) {
    Object.assign(option, updates);
    return;
  }
  throw new Error('Menu option not found');

  /*
  // FIXME Use API Instead of mockup data
  await axios.request({
    url: `/v1/admin/menu-options/${id}`,
    method: 'PUT',
    data: updates
  });
  */
}
