import { delay } from 'utils/medipanda/delay';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';
import { mockCommunityUsers, mockCommunityPosts, mockCommunityComments, mockBlindItems } from 'api-mock-data/MpCommunityMock';

export interface MpCommunityUser {
  id: number;
  memberNumber: string;
  userId: string;
  memberName: string;
  nickname: string;
  phoneNumber: string;
  email: string;
  hasContract: boolean;
  postCount: number;
  commentCount: number;
  likeCount: number;
  blindPostCount: number;
}

export interface MpCommunityUserSearchRequest extends MpPagedRequest<MpCommunityUser> {
  contractStatus?: string;
  searchType?: string;
  searchKeyword?: string;
}

export interface MpCommunityPost {
  id: number;
  accountType: string;
  userId: string;
  memberName: string;
  nickname: string;
  hasContract: boolean;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isBlind: boolean;
  registrationDate: string;
}

export interface MpCommunityPostSearchRequest extends MpPagedRequest<MpCommunityPost> {
  accountType?: string;
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface MpCommunityPostDetail {
  id: number;
  accountType: string;
  nickname: string;
  title: string;
  content: string;
  likeCount: number;
  commentCount: number;
  viewCount: number;
  isBlind: boolean;
  registrationDate: string;
}

export interface MpPostReport {
  id: number;
  userId: string;
  memberName: string;
  nickname: string;
  hasContract: boolean;
  reportType: string;
  reportContent: string;
  reportDate: string;
}

export interface MpCommunityComment {
  id: number;
  postId: number;
  userId: string;
  memberName: string;
  nickname: string;
  hasContract: boolean;
  type: string;
  content: string;
  likeCount: number;
  registrationDate: string;
}

export interface MpCommunityCommentSearchRequest extends MpPagedRequest<MpCommunityComment> {
  commentType?: string;
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export interface MpBlindItem {
  id: number;
  userId: string;
  memberName: string;
  nickname: string;
  hasContract: boolean;
  contentType: string;
  content: string;
  reportType: string;
  likeCount: number;
  blindProcessDate: string;
}

export interface MpBlindSearchRequest extends MpPagedRequest<MpBlindItem> {
  contentType?: string;
  searchType?: string;
  searchKeyword?: string;
  startDate?: string;
  endDate?: string;
}

export const mpFetchCommunityUserList = async (request: MpCommunityUserSearchRequest): Promise<MpPagedResponse<MpCommunityUser>> => {
  await delay(500);

  let filteredData = mockCommunityUsers;

  if (request.contractStatus && request.contractStatus !== '전체') {
    const hasContract = request.contractStatus === '계약';
    filteredData = filteredData.filter((item) => item.hasContract === hasContract);
  }

  if (request.searchType && request.searchKeyword) {
    filteredData = filteredData.filter((item) => {
      const keyword = request.searchKeyword!.toLowerCase();
      switch (request.searchType) {
        case '회원명':
          return item.memberName.toLowerCase().includes(keyword);
        case '아이디':
          return item.userId.toLowerCase().includes(keyword);
        case '닉네임':
          return item.nickname.toLowerCase().includes(keyword);
        case '휴대폰번호':
          return item.phoneNumber.includes(keyword);
        default:
          return true;
      }
    });
  }

  const contentWithSequence: MpWithSequence<MpCommunityUser>[] = filteredData
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
  const axiosResponse = await axios.request<MpPagedResponse<MpCommunityUser>>({
    url: `/v1/community/users`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchCommunityPostList = async (request: MpCommunityPostSearchRequest): Promise<MpPagedResponse<MpCommunityPost>> => {
  await delay(500);

  let filteredData = mockCommunityPosts;

  if (request.accountType && request.accountType !== '전체') {
    filteredData = filteredData.filter((item) => item.accountType === request.accountType);
  }

  if (request.searchType && request.searchKeyword) {
    filteredData = filteredData.filter((item) => {
      const keyword = request.searchKeyword!.toLowerCase();
      switch (request.searchType) {
        case '아이디':
          return item.userId.toLowerCase().includes(keyword);
        case '회원명':
          return item.memberName.toLowerCase().includes(keyword);
        case '닉네임':
          return item.nickname.toLowerCase().includes(keyword);
        default:
          return true;
      }
    });
  }

  const contentWithSequence: MpWithSequence<MpCommunityPost>[] = filteredData
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
  const axiosResponse = await axios.request<MpPagedResponse<MpCommunityPost>>({
    url: `/v1/community/posts`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchPostDetail = async (id: number): Promise<MpCommunityPostDetail> => {
  await delay(500);

  return {
    id: id,
    accountType: 'asdf',
    nickname: 'asdf',
    title: 'asdf',
    content: `asdf`,
    likeCount: 10,
    commentCount: 100,
    viewCount: 1000,
    isBlind: false,
    registrationDate: '2025-04-10 13:10'
  };

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpCommunityPostDetail>({
    url: `/v1/community/posts/${id}`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
};

export const mpFetchPostReports = async (postId: number): Promise<MpPostReport[]> => {
  await delay(500);

  return [];

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpPostReport[]>({
    url: `/v1/community/posts/${postId}/reports`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
};

export const mpFetchPostComments = async (postId: number): Promise<MpCommunityComment[]> => {
  await delay(500);

  return [];

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpCommunityComment[]>({
    url: `/v1/community/posts/${postId}/comments`,
    method: 'GET'
  });
  return axiosResponse.data;
  */
};

export const mpFetchCommunityCommentList = async (
  request: MpCommunityCommentSearchRequest
): Promise<MpPagedResponse<MpCommunityComment>> => {
  await delay(500);

  let filteredData = mockCommunityComments;

  if (request.commentType && request.commentType !== '전체') {
    filteredData = filteredData.filter((item) => item.type === request.commentType);
  }

  const contentWithSequence: MpWithSequence<MpCommunityComment>[] = filteredData
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
  const axiosResponse = await axios.request<MpPagedResponse<MpCommunityComment>>({
    url: `/v1/community/comments`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};

export const mpFetchBlindList = async (request: MpBlindSearchRequest): Promise<MpPagedResponse<MpBlindItem>> => {
  await delay(500);

  const contentWithSequence: MpWithSequence<MpBlindItem>[] = mockBlindItems
    .slice(request.page * request.size, (request.page + 1) * request.size)
    .map((item, index) => ({
      ...item,
      sequence: mockBlindItems.length - request.page * request.size - index
    }));

  return {
    content: contentWithSequence,
    pageable: { pageNumber: request.page },
    totalPages: Math.ceil(mockBlindItems.length / request.size),
    totalElements: mockBlindItems.length
  };

  /*
  // FIXME Use API Instead of mockup data
  const axiosResponse = await axios.request<MpPagedResponse<MpBlindItem>>({
    url: `/v1/community/blind`,
    method: 'GET',
    params: request
  });
  return mpSetSequence(request, axiosResponse.data);
  */
};
