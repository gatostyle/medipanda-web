import { MpApprovedItem, MpApprovedDetailItem, MpBusinessPartnerDetail } from 'api-definitions/MpAdjustment';

export const mockApprovedItems: MpApprovedItem[] = [
  {
    id: 1,
    assignmentNumber: '1235',
    settlementMonth: '2025-04',
    pharmaceuticalCompany: '동구바이오',
    memberName: '고길동',
    agentName: '고길동',
    prescriptionAmount: 220753209,
    approvedAmount: 220753209,
    difference: 0,
    userConfirmed: true,
    approval: '승인'
  },
  {
    id: 2,
    assignmentNumber: '3491',
    settlementMonth: '2025-04',
    pharmaceuticalCompany: '킨미',
    memberName: '제길동',
    agentName: '제길동',
    prescriptionAmount: 220733209,
    approvedAmount: 220733209,
    difference: 0,
    userConfirmed: false,
    approval: '승인'
  },
  {
    id: 3,
    assignmentNumber: '21312',
    settlementMonth: '2025-04',
    pharmaceuticalCompany: '킨미',
    memberName: '조조',
    agentName: '조조',
    prescriptionAmount: 220733209,
    approvedAmount: 220733209,
    difference: 0,
    userConfirmed: false,
    approval: '승인'
  }
];

export const mockApprovedDetails: MpApprovedDetailItem[] = [
  {
    id: 1,
    memberName: '케이엔메디스',
    agentName: 'C탈당',
    prescriptionCode: '31313123',
    businessPartnerName: '케이엔메디스',
    businessRegistrationNumber: '321231-123124',
    prescriptionAmount: 110366605,
    approvedAmount: 11036660,
    difference: 0
  },
  {
    id: 2,
    memberName: '케이엔메디스',
    agentName: 'D탈당',
    prescriptionCode: '123143',
    businessPartnerName: '케이엔메디스',
    businessRegistrationNumber: '521-123124',
    prescriptionAmount: 110366604,
    approvedAmount: 11036660,
    difference: 0
  }
];

export const mockBusinessPartnerDetail: MpBusinessPartnerDetail = {
  id: 1,
  agentName: '제길동',
  prescriptionCode: '3115615',
  businessPartnerName: 'D병원',
  businessRegistrationNumber: '521-123124',
  representative: '',
  contactNumber: '',
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
      unitPrice: 0,
      insurancePrice: 0,
      previousUnit: 0,
      basicCommissionRate: 0,
      commissionAmount: 0,
      totalAmount: 0,
      remarks: '',
      memo: ''
    }
  ]
};
