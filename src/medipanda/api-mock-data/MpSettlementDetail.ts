import { MpSettlementPartnerDetail, MpSettlementProduct } from 'medipanda/api-definitions/MpSettlementDetail';

export const mockSettlementBusinessPartnerDetail: MpSettlementPartnerDetail = {
  id: 1,
  sequence: 1,
  dealerName: '제갈암',
  institutionCode: '3115615',
  institutionName: 'D병원',
  businessNumber: '521-123124',
  prescriptionMonth: '2025-04',
  settlementMonth: '2025-04',
  prescriptionAmount: 1123300
};

export const mockSettlementBusinessPartnerProducts: MpSettlementProduct[] = [
  {
    id: 1,
    sequence: 1,
    productName: '순페린서방정',
    manufacturer: '동구바이오제약',
    productCode: 'PROD-001',
    insuranceCode: '660703900',
    quantity: 12,
    unitPrice: 21500,
    totalAmount: 258000,
    settlementAmount: 6480
  }
];
