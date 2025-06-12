/**
 * Mock Data for Partner Edit
 * 거래선 편집 관련 목 데이터
 */

import {
  MpPartnerPharmaceuticalCompany,
  MpPartnerCompanySearchResult,
  MpPartnerPharmacyRow
} from 'medipanda/api-definitions/MpPartnerEdit';

export const mockPartnerPharmaceuticalCompanies: MpPartnerPharmaceuticalCompany[] = [
  { id: 1, name: '동구바이오 제약' },
  { id: 2, name: '한미약품' },
  { id: 3, name: '대웅제약' }
];

export const mockPartnerCompanySearchResults: MpPartnerCompanySearchResult[] = [
  { id: 1, name: '케이엔메디스' },
  { id: 2, name: 'yy메디칼' }
];

export const mockPartnerEmptyPharmacyRow: MpPartnerPharmacyRow = {
  id: 0,
  pharmacyName: '',
  pharmacyAddress: '',
  state: true
};
