import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockHospitals, mockInquiries } from 'api-mock-data/MpContentMock';

export interface MpHospital {
  id: number;
  region: string;
  district: string;
  hospitalName: string;
  address: string;
  registrationDate: string;
  category: string;
}

export interface MpHospitalSearchRequest extends MpPagedRequest<MpHospital> {
  region?: string;
  district?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface MpInquiry {
  id: number;
  inquiryNumber: string;
  memberName: string;
  userId: string;
  phoneNumber: string;
  category: string;
  contractStatus: string;
  title: string;
  content: string;
  response: string;
  inquiryDate: string;
  responseDate: string;
}

export interface MpInquirySearchRequest extends MpPagedRequest<MpInquiry> {
  category?: string;
  contractStatus?: string;
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface MpInquiryDetail {
  id: number;
  inquiryNumber: string;
  memberName: string;
  phoneNumber: string;
  title: string;
  content: string;
  response: string;
  attachmentFile: string;
  inquiryDate: string;
  responseDate: string;
}

export const mpFetchHospitalList = async (request: MpHospitalSearchRequest): Promise<MpPagedResponse<MpHospital>> => {
  await delay(500);

  let filteredData = mockHospitals;

  if (request.region && request.region !== '전체') {
    filteredData = filteredData.filter((item) => item.region === request.region);
  }

  if (request.district && request.district !== '전체') {
    filteredData = filteredData.filter((item) => item.district === request.district);
  }

  if (request.searchKeyword) {
    filteredData = filteredData.filter(
      (item) => item.hospitalName.includes(request.searchKeyword!) || item.address.includes(request.searchKeyword!)
    );
  }

  const contentWithSequence: MpWithSequence<MpHospital>[] = filteredData
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: filteredData.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: { pageNumber: request.page },
    totalPages: Math.ceil(filteredData.length / request.size),
    totalElements: filteredData.length
  };

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpPagedResponse<MpHospital>>({
    url: `/v1/content/hospitals`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchInquiryList = async (request: MpInquirySearchRequest): Promise<MpPagedResponse<MpInquiry>> => {
  await delay(500);

  const contentWithSequence: MpWithSequence<MpInquiry>[] = mockInquiries
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: mockInquiries.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: { pageNumber: request.page },
    totalPages: Math.ceil(mockInquiries.length / request.size),
    totalElements: mockInquiries.length
  };

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpPagedResponse<MpInquiry>>({
    url: `/v1/content/inquiries`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};
