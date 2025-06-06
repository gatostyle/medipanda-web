import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockBusinessLines } from 'api-mock-data/MpBusinessLineMock';

export interface MpBusinessLine {
  id: number;
  memberNo: string;
  userId: string;
  memberName: string;
  classification: string;
  dealerNo: string;
  dealerName: string;
  businessName: string;
  businessRegistrationNo: string;
  dealerRegistrationDate: string;
  sequence: number;
}

export interface MpBusinessLineSearchRequest extends MpPagedRequest<MpBusinessLine> {
  searchType?: string;
  searchKeyword?: string;
  classification?: string;
}

export const mpFetchBusinessLines = async (request: MpBusinessLineSearchRequest): Promise<MpPagedResponse<MpBusinessLine>> => {
  await delay(500);

  let filteredBusinessLines = Object.values(mockBusinessLines);

  if (request.searchType && request.searchKeyword) {
    filteredBusinessLines = filteredBusinessLines.filter((item) => {
      switch (request.searchType) {
        case 'memberNo':
          return item.memberNo.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case 'userId':
          return item.userId.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case 'memberName':
          return item.memberName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case 'dealerName':
          return item.dealerName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case 'businessName':
          return item.businessName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        default:
          return true;
      }
    });
  }

  if (request.classification && request.classification !== '전체') {
    filteredBusinessLines = filteredBusinessLines.filter((item) => item.classification === request.classification);
  }

  const contentWithSequence: MpWithSequence<MpBusinessLine>[] = filteredBusinessLines
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: filteredBusinessLines.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: {
      pageNumber: request.page
    },
    totalPages: Math.ceil(filteredBusinessLines.length / request.size),
    totalElements: filteredBusinessLines.length
  };
};
