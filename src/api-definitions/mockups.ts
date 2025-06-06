import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockMembers, mockAdmins, mockBanners, mockMemberPermission } from 'api-mock-data/MpMockups';

export { mockMembers, mockAdmins, mockBanners, mockMemberPermission };

export function mockPagedResponse<T>(request: MpPagedRequest<T>, data: T[]): MpPagedResponse<T> {
  const { page, size } = request;
  const start = page * size;
  const end = Math.min(start + size, data.length);

  return {
    content: data.slice(start, end).map((item, idx) => ({
      ...item,
      sequence: data.length - start - idx
    })) as MpWithSequence<T>[],
    totalElements: data.length,
    totalPages: Math.ceil(data.length / size),
    pageable: {
      pageNumber: page
    }
  };
}
