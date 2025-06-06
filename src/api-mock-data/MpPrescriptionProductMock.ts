import type { MpPrescriptionProduct } from 'api-definitions/MpPrescriptionProduct';

export const mockPrescriptionProducts: Record<number, MpPrescriptionProduct> = {
  1: {
    id: 1,
    brandCode: 'BC001',
    productName: '타이레놀정 500mg',
    standard: '500mg',
    unit: '정',
    guarantee: '보험적용',
    unitPrice: 100,
    quantity: 30,
    amount: 3000,
    note: ''
  },
  2: {
    id: 2,
    brandCode: 'BC002',
    productName: '게보린정',
    standard: '250mg',
    unit: '정',
    guarantee: '보험적용',
    unitPrice: 80,
    quantity: 20,
    amount: 1600,
    note: '1일 3회 복용'
  },
  3: {
    id: 3,
    brandCode: 'BC003',
    productName: '훼스탈정',
    standard: '40mg',
    unit: '정',
    guarantee: '보험적용',
    unitPrice: 150,
    quantity: 15,
    amount: 2250,
    note: '식후 복용'
  }
};
