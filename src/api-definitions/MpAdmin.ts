import { MpPagedRequest, MpPagedResponse } from './MpPaged';
import { mockPagedResponse } from './mockups';
import { mockAdmins } from 'api-mock-data/MpAdminMock';
import { delay } from 'utils/medipanda/delay';

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

export async function mpFetchAdmins(params: MpAdminSearchParams): Promise<MpPagedResponse<MpAdmin>> {
  await delay(500);
  let admins = Object.values(mockAdmins);

  if (params.userId) {
    admins = admins.filter((admin) => admin.userId.toLowerCase().includes(params.userId!.toLowerCase()));
  }
  if (params.email) {
    admins = admins.filter((admin) => admin.email.toLowerCase().includes(params.email!.toLowerCase()));
  }
  if (params.phone) {
    admins = admins.filter((admin) => admin.phone.includes(params.phone!));
  }
  if (params.sortProperty) {
    admins.sort((a, b) => {
      const valueA = a[params.sortProperty!];
      const valueB = b[params.sortProperty!];
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return params.descending ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB);
      }
      return params.descending ? (valueB > valueA ? 1 : -1) : valueA > valueB ? 1 : -1;
    });
  }

  return mockPagedResponse(params, admins);

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpPagedResponse<MpAdmin>>({
    url: `/v1/admins`,
    method: 'GET',
    params
  });
  return axiosResponse.data;
  */
}

export const mpCreateAdmin = async (admin: Omit<MpAdmin, 'id'>): Promise<MpAdmin> => {
  await delay(500);
  const newId = Math.max(...Object.keys(mockAdmins).map(Number)) + 1;
  const newAdmin = { ...admin, id: newId };
  mockAdmins[newId] = newAdmin;
  return newAdmin;

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.post<MpAdmin>('/v1/admins', admin);
  return axiosResponse.data;
  */
};

export const mpUpdateAdmin = async (id: number, admin: Partial<MpAdmin>): Promise<void> => {
  await delay(500);
  if (mockAdmins[id]) {
    mockAdmins[id] = { ...mockAdmins[id], ...admin };
    return;
  }
  throw new Error('Admin not found');

  /*
  // FIXME Use API Instead of mockup data
  await axios.put(`/v1/admins/${id}`, admin);
  */
};

export const mpFetchAdmin = async (id: number): Promise<MpAdmin> => {
  await delay(500);
  const admin = mockAdmins[id];
  if (admin) {
    return admin;
  }
  throw new Error('Admin not found');

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.get<MpAdmin>(`/v1/admins/${id}`);
  return axiosResponse.data;
  */
};

export const mpDeleteAdmin = async (id: number): Promise<void> => {
  await delay(500);
  if (mockAdmins[id]) {
    delete mockAdmins[id];
    return;
  }
  throw new Error('Admin not found');

  /*
  // FIXME Use API Instead of mockup data
  await axios.delete(`/v1/admins/${id}`);
  */
};
