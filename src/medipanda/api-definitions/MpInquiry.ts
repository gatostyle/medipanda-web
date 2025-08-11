import { NotImplementedError } from './NotImplementedError';

export enum InquiryResponseStatus {
  WAITING = 'waiting',
  COMPLETED = 'completed'
}

export enum InquiryResponseStatusFilter {
  ALL = 'all',
  WAITING = 'waiting',
  COMPLETED = 'completed'
}

export enum InquirySearchType {
  MEMBER_NAME = 'memberName',
  COMPANY_NAME = 'companyName',
  USER_ID = 'userId'
}

export interface MpInquiry {
  id: number;
  memberNumber: string;
  boardType: 'ANONYMOUS' | 'MR_CSO_MATCHING' | 'NOTICE' | 'INQUIRY' | 'FAQ' | 'CSO_A_TO_Z' | 'EVENT' | 'SALES_AGENCY' | 'PRODUCT';
  userId: string;
  nickname: string;
  name: string;
  companyName?: string;
  phoneNumber: string;
  title: string;
  content: string;
  category: string;
  responseStatus: InquiryResponseStatus;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  responseContent?: string;
  responseCreatedAt?: string;
  notes?: string;
  attachmentFiles?: Array<{
    id: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>;
}
export interface MpInquiryResponseRequest {
  responseContent: string;
  notes?: string;
}

export const mpCreateInquiryResponse = async (id: number, data: MpInquiryResponseRequest): Promise<MpInquiry> => {
  throw new NotImplementedError('답변 작성');
};

export const mpUpdateInquiryResponse = async (id: number, data: MpInquiryResponseRequest): Promise<MpInquiry> => {
  throw new NotImplementedError('답변 수정');
};
