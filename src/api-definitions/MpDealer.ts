import { delay } from 'utils/medipanda/delay';
import { mockDealers } from 'api-mock-data/MpDealerMock';

export interface MpDealer {
  id: number;
  dealerNumber: string;
  dealerName: string;
  userId: string;
  userName: string;
  managerName: string;
}

export interface MpDealerSearchRequest {
  searchType?: string;
  searchKeyword?: string;
}

export const mpFetchDealers = async (request: MpDealerSearchRequest = {}): Promise<MpDealer[]> => {
  await delay(300);

  let filteredDealers = Object.values(mockDealers);

  if (request.searchType && request.searchKeyword) {
    filteredDealers = filteredDealers.filter((dealer) => {
      switch (request.searchType) {
        case '딜러번호':
          return dealer.dealerNumber.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '딜러명':
          return dealer.dealerName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '아이디':
          return dealer.userId.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        default:
          return true;
      }
    });
  }

  return filteredDealers;
};
