import { delay } from 'utils/medipanda/delay';
import { mockPharmaceuticalCompanyFeeRanges, mockPharmaceuticalCompanyIssues } from 'api-mock-data/MpPharmaceuticalCompanyDetailMock';

export interface MpPharmaceuticalCompanyFeeRange {
  id: number;
  range: string;
  feeRate: string;
  collection: string;
  approval: string;
}

export interface MpPharmaceuticalCompanyIssue {
  id: number;
  author: string;
  companyName: string;
  status: string;
  soldQuantity: number;
  createDate: string;
  updateDate: string;
}

export interface MpPharmaceuticalCompanyDetailSearchRequest {
  companyId?: number;
}

export const mpFetchPharmaceuticalCompanyFeeRanges = async (
  request: MpPharmaceuticalCompanyDetailSearchRequest = {}
): Promise<MpPharmaceuticalCompanyFeeRange[]> => {
  await delay(300);

  return Object.values(mockPharmaceuticalCompanyFeeRanges);
};

export const mpFetchPharmaceuticalCompanyIssues = async (
  request: MpPharmaceuticalCompanyDetailSearchRequest = {}
): Promise<MpPharmaceuticalCompanyIssue[]> => {
  await delay(300);

  return Object.values(mockPharmaceuticalCompanyIssues);
};
