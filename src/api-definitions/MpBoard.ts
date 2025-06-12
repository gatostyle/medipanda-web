import axios from 'utils/axios';
import { MpPagedRequest, MpPagedResponse, MpWithSequence } from './MpPaged';

export type BoardType = 'ANONYMOUS' | 'MR_CSO_MATCHING' | 'NOTICE' | 'INQUIRY' | 'FAQ' | 'CSO_A_TO_Z';

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

export interface MpBoard {
  id: number;
  boardType: BoardType;
  title: string;
  nickname: string;
  isBlind: boolean;
  likesCount: number;
  viewsCount: number;
  commentCount: number;
  createdAt: string;
  // FIXME Need API fix for category field (for Notice)
}

export interface MpBoardDetail {
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
  children: MpBoardDetail[];
  reports: BoardReportResponse[];
  comments: CommentResponse[];
  attachments: string[];
  // FIXME Need API fix for category field (for Notice)
}

export interface MpBoardSearchRequest {
  page?: number;
  size?: number;
  boardType?: BoardType;
  userId?: string;
  name?: string;
  nickname?: string;
  startAt?: string;
  endAt?: string;
  filterBlind?: boolean;
  boardTitle?: string;
  filterDeleted?: boolean;
}

export interface MpBoardCreateRequest {
  boardType: BoardType;
  userId: string;
  nickname: string;
  title: string;
  content: string;
  parentId?: number;
}

export interface MpBoardUpdateRequest {
  title?: string;
  content?: string;
  isBlind?: boolean;
  fileIds?: number[];
}

export interface MpBoardCreateRequestExtended extends MpBoardCreateRequest {
  noticeType?: string;
  manufacturerName?: string;
  exposureScope?: string;
  isTopFixed?: boolean;
}

export interface MpBoardUpdateRequestExtended extends MpBoardUpdateRequest {
  noticeType?: string;
  manufacturerName?: string;
  exposureScope?: string;
  isTopFixed?: boolean;
}

export interface MpBoardSearchRequestExtended extends MpPagedRequest<MpBoard> {
  boardType?: BoardType;
  visibility?: boolean;
  category?: string;
  searchType?: string;
  searchKeyword?: string;
  startAt?: string;
  endAt?: string;
}

export const mpFetchBoardList = async (request: MpBoardSearchRequestExtended): Promise<MpPagedResponse<MpBoard>> => {
  const boardRequest: MpBoardSearchRequest = {
    page: request.page,
    size: request.size,
    boardType: request.boardType,
    filterDeleted: true,
    startAt: request.startAt,
    endAt: request.endAt,
    filterBlind: request.visibility !== undefined ? !request.visibility : undefined,
    boardTitle: request.searchKeyword
  };

  const axiosResponse = await axios.request<MpPagedResponse<MpBoard>>({
    url: `/v1/boards`,
    method: 'GET',
    params: boardRequest
  });

  const contentWithSequence: MpWithSequence<MpBoard>[] = axiosResponse.data.content.map((item, index) => ({
    ...item,
    sequence: axiosResponse.data.totalElements - request.page * request.size - index
  }));

  return {
    ...axiosResponse.data,
    content: contentWithSequence
  };
};

export const mpFetchBoardDetail = async (id: number): Promise<MpBoardDetail> => {
  const axiosResponse = await axios.request<MpBoardDetail>({
    url: `/v1/boards/${id}`,
    method: 'GET',
    params: {
      filterBlind: null,
      filterDeleted: null
    }
  });

  return axiosResponse.data;
};

export const mpCreateBoard = async (request: MpBoardCreateRequestExtended, files?: File[]): Promise<string> => {
  const boardRequest: MpBoardCreateRequest = {
    boardType: request.boardType,
    userId: request.userId,
    nickname: request.nickname,
    title: request.title,
    content: request.content,
    parentId: request.parentId
  };

  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(boardRequest)], { type: 'application/json' }));

  if (files && files.length > 0) {
    files.forEach((file) => {
      const blob = new Blob([file], { type: 'application/octet-stream' });
      formData.append('files', blob, file.name);
    });
  }

  const axiosResponse = await axios.request<string>({
    url: '/v1/boards',
    method: 'POST',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return axiosResponse.data;
};

export const mpUpdateBoard = async (
  id: number,
  request: MpBoardUpdateRequestExtended,
  files?: File[],
  existingFiles?: string[]
): Promise<string> => {
  const updateRequest: MpBoardUpdateRequest = {
    title: request.title,
    content: request.content,
    isBlind: request.isBlind || false,
    fileIds: request.fileIds || []
  };

  const formData = new FormData();
  formData.append('updateRequest', new Blob([JSON.stringify(updateRequest)], { type: 'application/json' }));

  if (files && files.length > 0) {
    files.forEach((file) => {
      const blob = new Blob([file], { type: 'application/octet-stream' });
      formData.append('files', blob, file.name);
    });
  }

  // FIXME Need API fix for existFiles handling

  const axiosResponse = await axios.request<string>({
    url: `/v1/boards/${id}`,
    method: 'PUT',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });

  return axiosResponse.data;
};

export const mpDeleteBoard = async (id: number): Promise<void> => {
  await axios.request({
    url: `/v1/boards/${id}`,
    method: 'DELETE'
  });
};
