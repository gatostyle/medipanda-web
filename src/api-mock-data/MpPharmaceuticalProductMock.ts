import type { MpPharmaceuticalProduct } from 'api-definitions/MpPharmaceuticalProduct';

export const mockPharmaceuticalProducts: Record<number, MpPharmaceuticalProduct> = {
  1: {
    id: 1,
    thumbnail: '썸네일',
    company: '진일바이오팜',
    productName: '실플린다, 성폭린아호',
    price: 1000,
    commission: '20%',
    contractDate: '2025-04-09',
    contractPeriod: '2025-04-09 ~ 2025-04-20',
    applicantCount: 30,
    salesCount: 10,
    sequence: 1
  },
  2: {
    id: 2,
    thumbnail: '썸네일',
    company: '진양제약(주)',
    productName: '영어, 성폭 2번',
    price: 2000,
    commission: '10%',
    contractDate: '2025-04-09',
    contractPeriod: '2025-04-09 ~ 2025-04-20',
    applicantCount: 100,
    salesCount: 100,
    sequence: 2
  },
  3: {
    id: 3,
    thumbnail: '썸네일',
    company: '대한제약',
    productName: '항생제 시리즈',
    price: 1500,
    commission: '15%',
    contractDate: '2025-04-10',
    contractPeriod: '2025-04-10 ~ 2025-05-10',
    applicantCount: 50,
    salesCount: 25,
    sequence: 3
  },
  4: {
    id: 4,
    thumbnail: '썸네일',
    company: '유한제약',
    productName: '비타민 복합제',
    price: 800,
    commission: '25%',
    contractDate: '2025-04-11',
    contractPeriod: '2025-04-11 ~ 2025-05-11',
    applicantCount: 75,
    salesCount: 60,
    sequence: 4
  },
  5: {
    id: 5,
    thumbnail: '썸네일',
    company: '동아제약',
    productName: '해열진통제',
    price: 1200,
    commission: '18%',
    contractDate: '2025-04-12',
    contractPeriod: '2025-04-12 ~ 2025-05-12',
    applicantCount: 40,
    salesCount: 30,
    sequence: 5
  }
};
