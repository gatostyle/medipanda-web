import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockSettlements, mockSettlementDetails, mockSettlementBusinessPartnerDetail } from 'api-mock-data/MpSettlementMock';

export interface MpSettlementItem {
  id: number;
  assignmentNumber: string;
  settlementMonth: string;
  pharmaceuticalCompany: string;
  memberName: string;
  agentName: string;
  prescriptionAmount: number;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
  approvalStatus: string;
}

export interface MpSettlementSearchRequest extends MpPagedRequest<MpSettlementItem> {
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface MpSettlementDetailItem {
  id: number;
  memberName: string;
  managerName: string;
  businessPartnerName: string;
  businessRegistrationNumber: string;
  prescriptionCode: string;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
  commissionRate: number;
}

export interface MpSettlementDetailSearchRequest extends MpPagedRequest<MpSettlementDetailItem> {
  searchType?: string;
  searchKeyword?: string;
}

export interface MpSettlementProductDetail {
  id: number;
  insuranceCode: string;
  productName: string;
  specification: string;
  quantity: number;
  insurancePrice: number;
  previousUnit: number;
  basicCommissionRate: number;
  commissionAmount: number;
  remarks: string;
}

export interface MpSettlementBusinessPartnerDetail {
  id: number;
  agentName: string;
  prescriptionCode: string;
  businessPartnerName: string;
  businessRegistrationNumber: string;
  prescriptionMonth: string;
  settlementMonth: string;
  prescriptionAmount: number;
  products: MpSettlementProductDetail[];
}

export const mpFetchSettlementList = async (request: MpSettlementSearchRequest): Promise<MpPagedResponse<MpSettlementItem>> => {
  await delay(500);

  let filteredData = mockSettlements;

  if (request.searchType && request.searchKeyword) {
    filteredData = mockSettlements.filter((item) => {
      switch (request.searchType) {
        case '딜러번호':
          return item.assignmentNumber.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '제약사명':
          return item.pharmaceuticalCompany.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '회원명':
          return item.memberName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '딜러명':
          return item.agentName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        default:
          return true;
      }
    });
  }

  const contentWithSequence: MpWithSequence<MpSettlementItem>[] = filteredData
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
  const axiosResponse = await axios.request<MpPagedResponse<MpSettlementItem>>({
    url: `/v1/settlements`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchSettlementDetail = async (
  id: number,
  request: MpSettlementDetailSearchRequest
): Promise<MpPagedResponse<MpSettlementDetailItem>> => {
  await delay(500);

  let filteredData = mockSettlementDetails;

  if (request.searchType && request.searchKeyword) {
    filteredData = mockSettlementDetails.filter((item) => {
      switch (request.searchType) {
        case '거래처명':
          return item.businessPartnerName.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '사업자등록번호':
          return item.businessRegistrationNumber.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        case '처방코드':
          return item.prescriptionCode.toLowerCase().includes(request.searchKeyword!.toLowerCase());
        default:
          return true;
      }
    });
  }

  const contentWithSequence: MpWithSequence<MpSettlementDetailItem>[] = filteredData
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
  const axiosResponse = await axios.request<MpPagedResponse<MpSettlementDetailItem>>({
    url: `/v1/settlements/${id}/details`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchSettlementBusinessPartnerDetail = async (id: number): Promise<MpSettlementBusinessPartnerDetail> => {
  await delay(500);

  return {
    ...mockSettlementBusinessPartnerDetail,
    id: id
  };

  /*
  // TODO
  const axiosResponse = await axios.request<MpSettlementBusinessPartnerDetail>({
    url: `/v1/settlements/${id}/business-partner-details`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
};
