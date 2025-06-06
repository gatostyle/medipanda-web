import { MpSettlementItem, MpSettlementDetailItem, MpSettlementBusinessPartnerDetail } from 'api-definitions/MpSettlement';

export const mockSettlements: MpSettlementItem[] = [
  {
    id: 1,
    assignmentNumber: '1235',
    settlementMonth: '2025-04',
    pharmaceuticalCompany: '동구바이오',
    memberName: '고길동',
    agentName: '케이엔메디스',
    prescriptionAmount: 220753209,
    supplyAmount: 200000000,
    taxAmount: 20000000,
    totalAmount: 220000000,
    approvalStatus: '승인'
  },
  {
    id: 2,
    assignmentNumber: '3491',
    settlementMonth: '2025-04',
    pharmaceuticalCompany: '동구바이오',
    memberName: '제갈량',
    agentName: '케이엔메디스',
    prescriptionAmount: 220733209,
    supplyAmount: 200000000,
    taxAmount: 20000000,
    totalAmount: 220000000,
    approvalStatus: '승인'
  }
];

export const mockSettlementDetails: MpSettlementDetailItem[] = [
  {
    id: 1,
    memberName: '케이엔메디스',
    managerName: '제갈량',
    businessPartnerName: 'D병원',
    businessRegistrationNumber: '321231-123124',
    prescriptionCode: '31313123',
    supplyAmount: 110366605,
    taxAmount: 11036660,
    totalAmount: 121403265,
    commissionRate: 30
  },
  {
    id: 2,
    memberName: '케이엔메디스',
    managerName: '제갈량',
    businessPartnerName: 'D병원',
    businessRegistrationNumber: '521-123124',
    prescriptionCode: '123143',
    supplyAmount: 110366604,
    taxAmount: 11036660,
    totalAmount: 121403264,
    commissionRate: 25
  }
];

export const mockSettlementBusinessPartnerDetail: MpSettlementBusinessPartnerDetail = {
  id: 1,
  agentName: '제갈량',
  prescriptionCode: '31155615',
  businessPartnerName: 'D병원',
  businessRegistrationNumber: '521-123124',
  prescriptionMonth: '2025-04',
  settlementMonth: '2025-04',
  prescriptionAmount: 1123300,
  products: [
    {
      id: 1,
      insuranceCode: '',
      productName: '',
      specification: '',
      quantity: 0,
      insurancePrice: 0,
      previousUnit: 0,
      basicCommissionRate: 0,
      commissionAmount: 0,
      remarks: ''
    }
  ]
};
