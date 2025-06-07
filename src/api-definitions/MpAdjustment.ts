import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockApprovedItems, mockApprovedDetails, mockBusinessPartnerDetail } from 'api-mock-data/MpAdjustmentMock';

export interface MpApprovedItem {
  id: number;
  assignmentNumber: string;
  settlementMonth: string;
  pharmaceuticalCompany: string;
  memberName: string;
  agentName: string;
  prescriptionAmount: number;
  approvedAmount: number;
  difference: number;
  userConfirmed: boolean;
  approval: string;
}

export interface MpApprovedSearchRequest extends MpPagedRequest<MpApprovedItem> {
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface MpApprovedDetailItem {
  id: number;
  memberName: string;
  agentName: string;
  prescriptionCode: string;
  businessPartnerName: string;
  businessRegistrationNumber: string;
  prescriptionAmount: number;
  approvedAmount: number;
  difference: number;
}

export interface MpApprovedDetailSearchRequest extends MpPagedRequest<MpApprovedDetailItem> {
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface MpAdjustmentProductDetail {
  id: number;
  insuranceCode: string;
  productName: string;
  specification: string;
  quantity: number;
  unitPrice: number;
  insurancePrice: number;
  previousUnit: number;
  basicCommissionRate: number;
  commissionAmount: number;
  totalAmount: number;
  remarks: string;
  memo?: string;
}

export interface MpBusinessPartnerDetail {
  id: number;
  agentName: string;
  prescriptionCode: string;
  businessPartnerName: string;
  businessRegistrationNumber: string;
  representative: string;
  contactNumber: string;
  prescriptionMonth: string;
  settlementMonth: string;
  prescriptionAmount: number;
  products: MpAdjustmentProductDetail[];
}

export const mpFetchApprovedList = async (request: MpApprovedSearchRequest): Promise<MpPagedResponse<MpApprovedItem>> => {
  await delay(500);

  const contentWithSequence: MpWithSequence<MpApprovedItem>[] = mockApprovedItems
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: mockApprovedItems.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: {
      pageNumber: request.page
    },
    totalPages: Math.ceil(mockApprovedItems.length / request.size),
    totalElements: mockApprovedItems.length
  };

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpPagedResponse<MpApprovedItem>>({
    url: `/v1/adjustments/approved`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchApprovedDetail = async (
  id: number,
  request: MpApprovedDetailSearchRequest
): Promise<MpPagedResponse<MpApprovedDetailItem>> => {
  await delay(500);

  const contentWithSequence: MpWithSequence<MpApprovedDetailItem>[] = mockApprovedDetails
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: mockApprovedDetails.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: {
      pageNumber: request.page
    },
    totalPages: Math.ceil(mockApprovedDetails.length / request.size),
    totalElements: mockApprovedDetails.length
  };

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpPagedResponse<MpApprovedDetailItem>>({
    url: `/v1/adjustments/approved/${id}/details`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchBusinessPartnerDetail = async (id: number): Promise<MpBusinessPartnerDetail> => {
  await delay(500);

  return {
    ...mockBusinessPartnerDetail,
    id: id
  };

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpBusinessPartnerDetail>({
    url: `/v1/adjustments/approved/${id}/business-partner-details`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
};
