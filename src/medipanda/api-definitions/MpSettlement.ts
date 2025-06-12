import { MpPagedRequest, MpPagedResponse } from './MpPaged';
import { mockPaginate, mockCRUD, delay } from 'medipanda/utils/mock-helpers';
import { NotImplementedError } from './NotImplementedError';
import { DateString } from 'medipanda/backend';

export enum SettlementStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface MpSettlement {
  id: number;
  dealerNumber: string;
  settlementMonth: string;
  companyName: string;
  businessPartnerName: string;
  dealerName: string;
  prescriptionAmount: number;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
  userConfirmation: boolean;
  status: SettlementStatus;
  createdAt: string;
}

export interface MpSettlementDetail {
  id: number;
  companyName: string;
  dealerName: string;
  institutionCode: string;
  institutionName: string;
  businessNumber: string;
  supplyAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface MpSettlementSearchRequest extends MpPagedRequest<MpSettlement> {
  userConfirmation?: boolean;
  searchType?: 'dealerNumber' | 'companyName' | 'businessPartnerName';
  startDate?: DateString;
  endDate?: DateString;
  searchKeyword?: string;
}

let settlementCRUD: ReturnType<typeof mockCRUD<MpSettlement>> | null = null;
let settlementCRUDPromise: Promise<ReturnType<typeof mockCRUD<MpSettlement>>> | null = null;

const getSettlementCRUD = async () => {
  if (settlementCRUD) return settlementCRUD;

  if (!settlementCRUDPromise) {
    settlementCRUDPromise = import('medipanda/api-mock-data/MpSettlement').then((module) => {
      settlementCRUD = mockCRUD<MpSettlement>(module.mockSettlements);
      return settlementCRUD;
    });
  }

  return settlementCRUDPromise;
};

export const mpFetchSettlementList = async (request: MpSettlementSearchRequest): Promise<MpPagedResponse<MpSettlement>> => {
  await delay(300);
  const crud = await getSettlementCRUD();
  return mockPaginate(crud.getData(), request);

  // const { data } = await axios.get<MpPagedResponse<MpSettlement>>('/v1/settlements', { params: request });
  // return data;
};

export const mpGetSettlementDetails = async (): Promise<MpSettlementDetail[]> => {
  await delay(300);
  const { mockSettlementDetails } = await import('medipanda/api-mock-data/MpSettlement');
  return mockSettlementDetails;

  // const { data } = await axios.get<MpSettlementDetail[]>('/v1/settlements/settlement-details');
  // return data;
};

export const mpDownloadSettlementDetailsExcel = async (): Promise<void> => {
  await delay(300);
  throw new NotImplementedError('Excel 다운로드');

  // const response = await axios.get('/v1/settlements/details/excel', { responseType: 'blob' });
  // const url = window.URL.createObjectURL(new Blob([response.data]));
  // const link = document.createElement('a');
  // link.href = url;
  // link.download = 'settlement-details.xlsx';
  // link.click();
};

export const mpDownloadSettlementExcel = async (): Promise<void> => {
  await delay(300);
  throw new NotImplementedError('Excel 다운로드');

  // const response = await axios.get('/v1/settlements/excel', { responseType: 'blob' });
  // const url = window.URL.createObjectURL(new Blob([response.data]));
  // const link = document.createElement('a');
  // link.href = url;
  // link.download = 'settlements.xlsx';
  // link.click();
};

export const mpUploadSettlementFile = async (file: File): Promise<void> => {
  await delay(300);
  throw new NotImplementedError('파일 업로드');

  // const formData = new FormData();
  // formData.append('file', file);
  // await axios.post('/v1/settlements/upload', formData);
};

export const mpDownloadSettlementEDI = async (): Promise<void> => {
  await delay(300);
  throw new NotImplementedError('EDI 다운로드');

  // const response = await axios.get('/v1/settlements/edi', { responseType: 'blob' });
  // const url = window.URL.createObjectURL(new Blob([response.data]));
  // const link = document.createElement('a');
  // link.href = url;
  // link.download = 'settlements.edi';
  // link.click();
};

export const mpPrintSettlementEDI = async (): Promise<void> => {
  await delay(300);
  throw new NotImplementedError('EDI 인쇄');

  // await axios.post('/v1/settlements/edi/print');
};
