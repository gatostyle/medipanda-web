import { delay } from 'utils/medipanda/delay';
import { mockProductDetail, mockComparisonDrugs } from 'api-mock-data/MpProductDetailMock';

export interface MpProductDetail {
  id: number;
  manufacturer: string;
  state: string;
  name: string;
  ingredient: string;
  code: string;
  price: string;
  baseFee: string;
  sectionFee: string;
  note: string;
  generics: string[];
  sameIngredient: string[];
}

export interface MpComparisonDrug {
  id: number;
  manufacturer: string;
  state: string;
  name: string;
  ingredient: string;
}

export interface MpProductDetailSearchRequest {
  productId?: number;
}

export const mpFetchProductDetail = async (request: MpProductDetailSearchRequest = {}): Promise<MpProductDetail> => {
  await delay(300);

  return mockProductDetail;
};

export const mpFetchComparisonDrugs = async (request: MpProductDetailSearchRequest = {}): Promise<MpComparisonDrug[]> => {
  await delay(300);

  return Object.values(mockComparisonDrugs);
};
