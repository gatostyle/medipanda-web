/**
 * Mock Data for Performance Statistics
 * 실적통계 관련 목 데이터
 */

import { MpPerformanceStatistics } from 'medipanda/api-definitions/MpPerformanceStatistics';

export const mockPerformanceStatistics: MpPerformanceStatistics[] = [
  {
    id: 1,
    drugCompany: '동구바이오',
    companyName: '케이엔메디스',
    dealerName: '홍길동',
    institutionCode: '312312312',
    institutionName: 'A병원',
    settlementMonth: '2025-04',
    prescriptionAmount: 1000000,
    totalAmount: 1000000,
    commissionAmount: 300000,
    basicCommissionRate: 30
  },
  {
    id: 2,
    drugCompany: '마더스제약',
    companyName: 'Cso 회사',
    dealerName: '고길동',
    institutionCode: '123123314',
    institutionName: 'B병원',
    settlementMonth: '2025-04',
    prescriptionAmount: 2000000,
    totalAmount: 2000000,
    commissionAmount: 200000,
    basicCommissionRate: 20
  },
  {
    id: 3,
    drugCompany: '한미약품',
    companyName: '메디팜',
    dealerName: '김영희',
    institutionCode: '987654321',
    institutionName: 'C병원',
    settlementMonth: '2025-05',
    prescriptionAmount: 1500000,
    totalAmount: 1500000,
    commissionAmount: 375000,
    basicCommissionRate: 25
  },
  {
    id: 4,
    drugCompany: '대웅제약',
    companyName: '바이오케어',
    dealerName: '박철수',
    institutionCode: '456789123',
    institutionName: 'D병원',
    settlementMonth: '2025-05',
    prescriptionAmount: 800000,
    totalAmount: 800000,
    commissionAmount: 160000,
    basicCommissionRate: 20
  },
  {
    id: 5,
    drugCompany: '유한양행',
    companyName: '헬스케어',
    dealerName: '이영수',
    institutionCode: '789123456',
    institutionName: 'E병원',
    settlementMonth: '2025-06',
    prescriptionAmount: 2500000,
    totalAmount: 2500000,
    commissionAmount: 625000,
    basicCommissionRate: 25
  }
];
