import axios from 'axios';
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

export interface BoardPostResponse {
  id: number;
  boardType: 'ANONYMOUS' | 'MR_CSO_MATCHING' | 'NOTICE' | 'INQUIRY' | 'FAQ' | 'CSO_A_TO_Z';
  title: string;
  nickname: string;
  isBlind: boolean;
  likesCount: number;
  viewsCount: number;
  commentCount: number;
  createdAt: string;
}

export interface BoardSearchRequest {
  page?: number;
  size?: number;
  boardType?: 'ANONYMOUS' | 'MR_CSO_MATCHING' | 'NOTICE' | 'INQUIRY' | 'FAQ' | 'CSO_A_TO_Z';
  userId?: string;
  name?: string;
  nickname?: string;
  startAt?: string;
  endAt?: string;
  filterBlind?: boolean;
  boardTitle?: string;
  filterDeleted?: boolean;
}

export interface BoardReportResponse {
  id: number;
  userId: string;
  memberName: string;
  nickname: string;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  reportType: 'SPAM' | 'ABUSE' | 'ILLEGAL_CONTENT' | 'PERSONAL_INFORMATION' | 'OTHER';
  reportContent: string;
  reportDateTime: string;
}

export interface CommentResponse {
  id: number;
  content: string;
  nickname: string;
  likesCount: number;
  isBlind: boolean;
  contractStatus: 'CONTRACT' | 'NON_CONTRACT';
  parentId?: number;
  createdAt: string;
  modifiedAt: string;
}

export interface BoardDetailsResponse {
  id: number;
  boardType: string;
  title: string;
  content: string;
  nickname: string;
  isBlind: boolean;
  likesCount: number;
  viewsCount: number;
  commentCount: number;
  createdAt: string;
  children: BoardDetailsResponse[];
  reports: BoardReportResponse[];
  comments: CommentResponse[];
  attachments: string[];
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

const convertBoardPostResponseToMpCsoAtoZ = (board: BoardPostResponse): MpCsoAtoZ => {
  return {
    id: board.id,
    author: board.nickname,
    title: board.title,
    content: '', // FIXME Need API fix
    status: board.isBlind ? '미노출' : '노출',
    viewCount: board.viewsCount,
    registrationDate: board.createdAt
  };
};

export const mpFetchCsoAtoZListFromApi = async (request: MpCsoAtoZSearchRequest): Promise<MpPagedResponse<MpCsoAtoZ>> => {
  const hasSearchFilters = request.status || request.searchKeyword || request.startDate || request.endDate;

  if (hasSearchFilters) {
    throw new Error('NOT_IMPLEMENTED'); // FIXME Need API Fix
  }

  const boardRequest: BoardSearchRequest = {
    page: request.page,
    size: request.size,
    boardType: 'CSO_A_TO_Z',
    filterDeleted: true
  };

  const axiosResponse = await axios.request<MpPagedResponse<BoardPostResponse>>({
    url: `/v1/boards`,
    method: 'GET',
    params: boardRequest
  });

  const convertedContent: MpWithSequence<MpCsoAtoZ>[] = axiosResponse.data.content.map((board, index) => ({
    ...convertBoardPostResponseToMpCsoAtoZ(board),
    sequence: axiosResponse.data.totalElements - request.page * request.size - index
  }));

  return {
    ...axiosResponse.data,
    content: convertedContent
  };
};

export const mpFetchCsoAtoZList = async (request: MpCsoAtoZSearchRequest): Promise<MpPagedResponse<MpCsoAtoZ>> => {
  return mpFetchCsoAtoZListFromApi(request);
};

const convertBoardDetailsResponseToMpCsoAtoZDetail = (board: BoardDetailsResponse): MpCsoAtoZDetail => {
  return {
    id: board.id,
    author: board.nickname,
    title: board.title,
    content: board.content,
    status: board.isBlind ? '미노출' : '노출',
    registrationDate: board.createdAt
  };
};

export const mpFetchCsoAtoZDetailFromApi = async (id: number): Promise<MpCsoAtoZDetail> => {
  const axiosResponse = await axios.request<BoardDetailsResponse>({
    url: `/v1/boards/${id}`,
    method: 'GET',
    params: {
      filterBlind: null,
      filterDeleted: null
    }
  });

  return convertBoardDetailsResponseToMpCsoAtoZDetail(axiosResponse.data);
};

export const mpFetchCsoAtoZDetail = async (id: number): Promise<MpCsoAtoZDetail> => {
  return mpFetchCsoAtoZDetailFromApi(id);
};

const convertBoardPostResponseToMpNotice = (board: BoardPostResponse): MpNotice => {
  return {
    id: board.id,
    author: board.nickname,
    title: board.title,
    category: '', // FIXME Need API fix
    status: board.isBlind ? '미노출' : '노출',
    viewCount: board.viewsCount,
    registrationDate: board.createdAt
  };
};

export const mpFetchNoticeListFromApi = async (request: MpNoticeSearchRequest): Promise<MpPagedResponse<MpNotice>> => {
  const hasSearchFilters = request.category || request.status || request.searchKeyword || request.startDate || request.endDate;

  if (hasSearchFilters) {
    throw new Error('NOT_IMPLEMENTED'); // FIXME Need API Fix
  }

  const boardRequest: BoardSearchRequest = {
    page: request.page,
    size: request.size,
    boardType: 'NOTICE',
    filterDeleted: true
  };

  const axiosResponse = await axios.request<MpPagedResponse<BoardPostResponse>>({
    url: `/v1/boards`,
    method: 'GET',
    params: boardRequest
  });

  const convertedContent: MpWithSequence<MpNotice>[] = axiosResponse.data.content.map((board, index) => ({
    ...convertBoardPostResponseToMpNotice(board),
    sequence: axiosResponse.data.totalElements - request.page * request.size - index
  }));

  return {
    ...axiosResponse.data,
    content: convertedContent
  };
};

export const mpFetchNoticeList = async (request: MpNoticeSearchRequest): Promise<MpPagedResponse<MpNotice>> => {
  return mpFetchNoticeListFromApi(request);
};

const convertBoardDetailsResponseToMpNoticeDetail = (board: BoardDetailsResponse): MpNoticeDetail => {
  return {
    id: board.id,
    author: board.nickname,
    title: board.title,
    content: board.content,
    category: '', // FIXME Need API fix
    status: board.isBlind ? '미노출' : '노출',
    registrationDate: board.createdAt
  };
};

export const mpFetchNoticeDetailFromApi = async (id: number): Promise<MpNoticeDetail> => {
  const axiosResponse = await axios.request<BoardDetailsResponse>({
    url: `/v1/boards/${id}`,
    method: 'GET',
    params: {
      filterBlind: null,
      filterDeleted: null
    }
  });

  return convertBoardDetailsResponseToMpNoticeDetail(axiosResponse.data);
};

export const mpFetchNoticeDetail = async (id: number): Promise<MpNoticeDetail> => {
  return mpFetchNoticeDetailFromApi(id);
};

const convertBoardPostResponseToMpFaq = (board: BoardPostResponse): MpFaq => {
  return {
    id: board.id,
    author: board.nickname,
    title: board.title,
    content: '', // FIXME Need API fix
    category: '', // FIXME Need API fix
    status: board.isBlind ? '미노출' : '노출',
    viewCount: board.viewsCount,
    registrationDate: board.createdAt
  };
};

export const mpFetchFaqListFromApi = async (request: MpFaqSearchRequest): Promise<MpPagedResponse<MpFaq>> => {
  const hasSearchFilters = request.category || request.status || request.searchKeyword || request.startDate || request.endDate;

  if (hasSearchFilters) {
    throw new Error('NOT_IMPLEMENTED'); // FIXME Need API Fix
  }

  const boardRequest: BoardSearchRequest = {
    page: request.page,
    size: request.size,
    boardType: 'FAQ',
    filterDeleted: true
  };

  const axiosResponse = await axios.request<MpPagedResponse<BoardPostResponse>>({
    url: `/v1/boards`,
    method: 'GET',
    params: boardRequest
  });

  const convertedContent: MpWithSequence<MpFaq>[] = axiosResponse.data.content.map((board, index) => ({
    ...convertBoardPostResponseToMpFaq(board),
    sequence: axiosResponse.data.totalElements - request.page * request.size - index
  }));

  return {
    ...axiosResponse.data,
    content: convertedContent
  };
};

export const mpFetchFaqList = async (request: MpFaqSearchRequest): Promise<MpPagedResponse<MpFaq>> => {
  return mpFetchFaqListFromApi(request);
};

const convertBoardDetailsResponseToMpFaqDetail = (board: BoardDetailsResponse): MpFaqDetail => {
  return {
    id: board.id,
    author: board.nickname,
    title: board.title,
    content: board.content,
    category: '', // FIXME Need API fix
    status: board.isBlind ? '미노출' : '노출',
    registrationDate: board.createdAt
  };
};

export const mpFetchFaqDetailFromApi = async (id: number): Promise<MpFaqDetail> => {
  const axiosResponse = await axios.request<BoardDetailsResponse>({
    url: `/v1/boards/${id}`,
    method: 'GET',
    params: {
      filterBlind: null,
      filterDeleted: null
    }
  });

  return convertBoardDetailsResponseToMpFaqDetail(axiosResponse.data);
};

export const mpFetchFaqDetail = async (id: number): Promise<MpFaqDetail> => {
  return mpFetchFaqDetailFromApi(id);
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
