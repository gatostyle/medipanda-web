import { delay } from 'medipanda/utils/mock-helpers';

export interface MpSettlementPartnerDetail {
  id: number;
  sequence?: number;
  dealerName: string;
  institutionCode: string;
  institutionName: string;
  businessNumber: string;
  prescriptionMonth: string;
  settlementMonth: string;
  prescriptionAmount: number;
}

export interface MpSettlementProduct {
  id: number;
  sequence?: number;
  productName: string;
  manufacturer: string;
  productCode: string;
  insuranceCode: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  settlementAmount: number;
}

export const mpGetSettlementBusinessPartnerDetail = async (): Promise<MpSettlementPartnerDetail> => {
  await delay(300);
  const module = await import('medipanda/api-mock-data/MpSettlementDetail');
  return module.mockSettlementBusinessPartnerDetail;

  /*
  // Real API implementation
  const { data } = await axios.get<MpSettlementPartnerDetail>('/v1/settlements/business-partner-detail');
  return data;
  */
};

export const mpGetSettlementBusinessPartnerProducts = async (): Promise<MpSettlementProduct[]> => {
  await delay(300);
  const module = await import('medipanda/api-mock-data/MpSettlementDetail');
  return module.mockSettlementBusinessPartnerProducts;

  /*
  // Real API implementation
  const { data } = await axios.get<MpSettlementProduct[]>('/v1/settlements/business-partner-products');
  return data;
  */
};
