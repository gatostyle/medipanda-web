import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockExpenditureReports } from 'api-mock-data/MpExpenditureReportMock';

export interface MpExpenditureReportItem {
  id: number;
  memberId: string;
  memberName: string;
  phoneNumber: string;
  hospitalName: string;
  hospitalPhoneNumber: string;
  doctorName: string;
  procedureDate: string;
  prescriptionNumber: string;
  procedureClassification: string;
  procedureName: string;
  prescriptionCode: string;
  amount: number;
  deductibleAmount: number;
  copaymentAmount: number;
  benefitRatio: number;
  userId: string;
  businessPartnerName: string;
  reportStatus: string;
  productName: string;
  category: string;
  institution: string;
  type: string;
  usageDate: string;
  medicalPersonCount: number;
  supportAmount: number;
}

export interface MpExpenditureReportSearchRequest extends MpPagedRequest<MpExpenditureReportItem> {
  memberId?: string;
  memberName?: string;
  phoneNumber?: string;
  hospitalName?: string;
  reportStatus?: string;
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export const mpFetchExpenditureReportList = async (
  request: MpExpenditureReportSearchRequest
): Promise<MpPagedResponse<MpExpenditureReportItem>> => {
  await delay(500);

  let filteredData = mockExpenditureReports;

  if (request.reportStatus && request.reportStatus !== '전체') {
    filteredData = filteredData.filter((item) => item.reportStatus === request.reportStatus);
  }

  if (request.searchType && request.searchKeyword) {
    filteredData = filteredData.filter((item) => {
      switch (request.searchType) {
        case '아이디':
          return item.userId.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '딜러명':
          return item.memberName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '거래처명':
          return item.businessPartnerName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        default:
          return true;
      }
    });
  }

  const contentWithSequence: MpWithSequence<MpExpenditureReportItem>[] = filteredData
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
  // TODO
  const axiosResponse = await axios.request<MpPagedResponse<MpExpenditureReportItem>>({
    url: `/v1/expenditure-reports`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};
