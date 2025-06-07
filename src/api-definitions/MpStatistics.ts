import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockStatistics } from 'api-mock-data/MpStatisticsMock';

export interface MpStatisticsItem {
  id: number;
  accountId: string;
  memberName: string;
  prescriptionCode: string;
  businessPartnerName: string;
  prescriptionDate: string;
  prescriptionAmount: number;
  approvedAmount: number;
  commissionAmount: number;
  commissionRate: number;
}

export interface MpStatisticsSearchRequest extends MpPagedRequest<MpStatisticsItem> {
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export const mpFetchStatisticsList = async (request: MpStatisticsSearchRequest): Promise<MpPagedResponse<MpStatisticsItem>> => {
  await delay(500);

  let filteredData = mockStatistics;

  if (request.searchType && request.searchKeyword) {
    filteredData = mockStatistics.filter((item) => {
      switch (request.searchType) {
        case '아이디':
          return item.accountId.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '딜러명':
          return item.memberName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '거래처명':
          return item.businessPartnerName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        default:
          return true;
      }
    });
  }

  const contentWithSequence: MpWithSequence<MpStatisticsItem>[] = filteredData
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: filteredData.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: {
      pageNumber: request.page
    },
    totalPages: Math.ceil(filteredData.length / request.size),
    totalElements: filteredData.length
  };

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpPagedResponse<MpStatisticsItem>>({
    url: `/v1/statistics`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};
