import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import {
  mockHospitals,
  mockCsoAtoZItems,
  mockCsoAtoZDetail,
  mockNotices,
  mockNoticeDetail,
  mockFaqs,
  mockFaqDetail,
  mockInquiries,
  mockInquiryDetail
} from 'api-mock-data/MpContentMock';

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

export interface MpCsoAtoZ {
  id: number;
  author: string;
  title: string;
  content: string;
  status: string;
  viewCount: number;
  registrationDate: string;
}

export interface MpCsoAtoZSearchRequest extends MpPagedRequest<MpCsoAtoZ> {
  status?: string;
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface MpCsoAtoZDetail {
  id: number;
  author: string;
  title: string;
  content: string;
  status: string;
  registrationDate: string;
}

export interface MpNotice {
  id: number;
  author: string;
  title: string;
  category: string;
  status: string;
  viewCount: number;
  registrationDate: string;
}

export interface MpNoticeSearchRequest extends MpPagedRequest<MpNotice> {
  category?: string;
  status?: string;
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface MpNoticeDetail {
  id: number;
  author: string;
  title: string;
  content: string;
  category: string;
  status: string;
  registrationDate: string;
}

export interface MpFaq {
  id: number;
  author: string;
  title: string;
  content: string;
  category: string;
  status: string;
  viewCount: number;
  registrationDate: string;
}

export interface MpFaqSearchRequest extends MpPagedRequest<MpFaq> {
  category?: string;
  status?: string;
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface MpFaqDetail {
  id: number;
  author: string;
  title: string;
  content: string;
  category: string;
  status: string;
  registrationDate: string;
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
  // TODO
  const axiosResponse = await axios.request<MpPagedResponse<MpHospital>>({
    url: `/v1/content/hospitals`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchCsoAtoZList = async (request: MpCsoAtoZSearchRequest): Promise<MpPagedResponse<MpCsoAtoZ>> => {
  await delay(500);

  let filteredData = mockCsoAtoZItems;

  if (request.status && request.status !== '전체') {
    filteredData = filteredData.filter((item) => item.status === request.status);
  }

  if (request.searchType && request.searchKeyword) {
    filteredData = filteredData.filter((item) => {
      const keyword = request.searchKeyword!.toLowerCase();
      switch (request.searchType) {
        case '제목':
          return item.title.toLowerCase().includes(keyword);
        case '작성자':
          return item.author.toLowerCase().includes(keyword);
        default:
          return true;
      }
    });
  }

  const contentWithSequence: MpWithSequence<MpCsoAtoZ>[] = filteredData
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
  // TODO
  const axiosResponse = await axios.request<MpPagedResponse<MpCsoAtoZ>>({
    url: `/v1/content/cso-atoz`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchCsoAtoZDetail = async (id: number): Promise<MpCsoAtoZDetail> => {
  await delay(500);

  return mockCsoAtoZDetail;

  /*
  // TODO
  const axiosResponse = await axios.request<MpCsoAtoZDetail>({
    url: `/v1/content/cso-atoz/${id}`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
};

export const mpFetchNoticeList = async (request: MpNoticeSearchRequest): Promise<MpPagedResponse<MpNotice>> => {
  await delay(500);

  const contentWithSequence: MpWithSequence<MpNotice>[] = mockNotices
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: mockNotices.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: { pageNumber: request.page },
    totalPages: Math.ceil(mockNotices.length / request.size),
    totalElements: mockNotices.length
  };

  /*
  // TODO
  const axiosResponse = await axios.request<MpPagedResponse<MpNotice>>({
    url: `/v1/content/notices`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchNoticeDetail = async (id: number): Promise<MpNoticeDetail> => {
  await delay(500);

  return mockNoticeDetail;

  /*
  // TODO
  const axiosResponse = await axios.request<MpNoticeDetail>({
    url: `/v1/content/notices/${id}`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
};

export const mpFetchFaqList = async (request: MpFaqSearchRequest): Promise<MpPagedResponse<MpFaq>> => {
  await delay(500);

  const contentWithSequence: MpWithSequence<MpFaq>[] = mockFaqs
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: mockFaqs.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: { pageNumber: request.page },
    totalPages: Math.ceil(mockFaqs.length / request.size),
    totalElements: mockFaqs.length
  };

  /*
  // TODO
  const axiosResponse = await axios.request<MpPagedResponse<MpFaq>>({
    url: `/v1/content/faqs`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchFaqDetail = async (id: number): Promise<MpFaqDetail> => {
  await delay(500);

  return mockFaqDetail;

  /*
  // TODO
  const axiosResponse = await axios.request<MpFaqDetail>({
    url: `/v1/content/faqs/${id}`,
    method: 'GET'
  });
  return axiosResponse.data;
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
  // TODO
  const axiosResponse = await axios.request<MpPagedResponse<MpInquiry>>({
    url: `/v1/content/inquiries`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchInquiryDetail = async (id: number): Promise<MpInquiryDetail> => {
  await delay(500);

  return mockInquiryDetail;

  /*
  // TODO
  const axiosResponse = await axios.request<MpInquiryDetail>({
    url: `/v1/content/inquiries/${id}`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
};
