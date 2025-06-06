import type { MpPharmaceuticalCompany } from 'api-definitions/MpPharmaceuticalCompany';

export const mockPharmaceuticalCompanies: Record<number, MpPharmaceuticalCompany> = {
  1: {
    id: 1,
    companyName: '진일바이오팜',
    totalQuantity: 30,
    soldQuantity: 10,
    manager: '매담 15일',
    managerName: '홍길동',
    contractDate: '2025-04-09',
    sequence: 1
  },
  2: {
    id: 2,
    companyName: '진양제약㈜',
    totalQuantity: 100,
    soldQuantity: 0,
    manager: '매담 20일',
    managerName: '박길동',
    contractDate: '2025-03-01',
    sequence: 2
  },
  3: {
    id: 3,
    companyName: '대한제약',
    totalQuantity: 45,
    soldQuantity: 20,
    manager: '매담 25일',
    managerName: '김철수',
    contractDate: '2025-03-15',
    sequence: 3
  },
  4: {
    id: 4,
    companyName: '유한제약',
    totalQuantity: 60,
    soldQuantity: 35,
    manager: '매담 10일',
    managerName: '이영희',
    contractDate: '2025-04-01',
    sequence: 4
  },
  5: {
    id: 5,
    companyName: '동아제약',
    totalQuantity: 25,
    soldQuantity: 15,
    manager: '매담 30일',
    managerName: '정민수',
    contractDate: '2025-04-05',
    sequence: 5
  }
};
