/**
 * API Definition for Partner Edit
 * 거래선 편집 관련 타입 정의
 */

import { delay } from 'medipanda/utils/mock-helpers';

export interface MpPartnerPharmacyRow {
  id: number;
  pharmacyName: string;
  pharmacyAddress: string;
  state: boolean;
}

export interface MpPartnerPharmaceuticalCompany {
  id: number;
  name: string;
}

export interface MpPartnerCompanySearchResult {
  id: number;
  name: string;
}

export const mpGetPartnerPharmaceuticalCompanies = async (): Promise<MpPartnerPharmaceuticalCompany[]> => {
  await delay(300);
  const { mockPartnerPharmaceuticalCompanies } = await import('medipanda/api-mock-data/MpPartnerEdit');
  return mockPartnerPharmaceuticalCompanies;

  /*
  // Real API implementation
  const { data } = await axios.get<MpPartnerPharmaceuticalCompany[]>('/v1/partners/pharmaceutical-companies');
  return data;
  */
};

export const mpGetPartnerCompanySearchResults = async (): Promise<MpPartnerCompanySearchResult[]> => {
  await delay(300);
  const { mockPartnerCompanySearchResults } = await import('medipanda/api-mock-data/MpPartnerEdit');
  return mockPartnerCompanySearchResults;

  /*
  // Real API implementation
  const { data } = await axios.get<MpPartnerCompanySearchResult[]>('/v1/partners/company-search');
  return data;
  */
};

export const mpGetPartnerEmptyPharmacyRow = async (): Promise<MpPartnerPharmacyRow> => {
  await delay(300);
  const { mockPartnerEmptyPharmacyRow } = await import('medipanda/api-mock-data/MpPartnerEdit');
  return mockPartnerEmptyPharmacyRow;

  /*
  // Real API implementation
  const { data } = await axios.get<MpPartnerPharmacyRow>('/v1/partners/empty-pharmacy-row');
  return data;
  */
};
