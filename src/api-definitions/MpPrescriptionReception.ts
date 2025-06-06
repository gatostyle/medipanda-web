import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockPrescriptionReceptions } from 'api-mock-data/MpPrescriptionReceptionMock';

export interface MpPrescriptionReception {
  id: number;
  memberNumber: string;
  userId: string;
  memberName: string;
  phoneNumber: string;
  doctor: string;
  hospital: string;
  receptionDate: string;
  applicationDate: string;
  governmentDelegate: string;
  receptionStatus: string;
  receptionConfirm: boolean;
  processStatus: string;
  status: string;
  sequence: number;
}

export interface MpPrescriptionReceptionSearchRequest extends MpPagedRequest<MpPrescriptionReception> {
  searchKeyword?: string;
  memberName?: string;
  receptionStatus?: string;
  startDate?: string;
  endDate?: string;
}

export const mpFetchPrescriptionReceptions = async (
  request: MpPrescriptionReceptionSearchRequest
): Promise<MpPagedResponse<MpPrescriptionReception>> => {
  await delay(500);

  let filteredReceptions = Object.values(mockPrescriptionReceptions);

  if (request.searchKeyword) {
    filteredReceptions = filteredReceptions.filter(
      (item) =>
        item.userId.toLowerCase().includes(request.searchKeyword!.toLowerCase()) ||
        item.memberName.toLowerCase().includes(request.searchKeyword!.toLowerCase())
    );
  }

  if (request.memberName && request.memberName !== '회원명') {
    filteredReceptions = filteredReceptions.filter((item) => item.memberName === request.memberName);
  }

  if (request.receptionStatus && request.receptionStatus !== '접수상태') {
    filteredReceptions = filteredReceptions.filter((item) => item.receptionStatus === request.receptionStatus);
  }

  const contentWithSequence: MpWithSequence<MpPrescriptionReception>[] = filteredReceptions
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: filteredReceptions.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: {
      pageNumber: request.page
    },
    totalPages: Math.ceil(filteredReceptions.length / request.size),
    totalElements: filteredReceptions.length
  };
};
