import type { MpStatisticsItem } from 'api-definitions/MpStatistics';

export const mockStatistics: MpStatisticsItem[] = [
  {
    id: 1,
    accountId: '케이엔메디지',
    memberName: '홍길동',
    prescriptionCode: '312312312',
    businessPartnerName: '4병원',
    prescriptionDate: '2025-04',
    prescriptionAmount: 1000000,
    approvedAmount: 1000000,
    commissionAmount: 300000,
    commissionRate: 30
  },
  {
    id: 2,
    accountId: 'kdmeq',
    memberName: 'Cso 회사',
    prescriptionCode: '12312314',
    businessPartnerName: 'a병원',
    prescriptionDate: '2025-04',
    prescriptionAmount: 2000000,
    approvedAmount: 2000000,
    commissionAmount: 200000,
    commissionRate: 20
  }
];
