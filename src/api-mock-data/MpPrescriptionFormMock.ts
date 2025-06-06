import type { MpPrescriptionForm } from 'api-definitions/MpPrescriptionForm';

export const mockPrescriptionForms: Record<number, MpPrescriptionForm> = {
  1: {
    id: 1,
    dealerNumber: '1235',
    userId: 'kdqmeq',
    userName: '케이엠퍼시스',
    managerCode: '31313',
    businessName: 'A병원',
    businessNumber: '101-1010010',
    prescriptionDate: '2025-04',
    settlementDate: '2025-04',
    registrationDate: '2025-04-10',
    prescriptionAmount: 1234567,
    inputStatus: '입력완료',
    sequence: 1
  },
  2: {
    id: 2,
    dealerNumber: '1235',
    userId: 'kdqmeq',
    userName: '케이엠퍼시스',
    managerCode: '415155',
    businessName: 'B병원',
    businessNumber: '321-123124',
    prescriptionDate: '2025-04',
    settlementDate: '2025-04',
    registrationDate: '2025-04-10',
    prescriptionAmount: 2345678,
    inputStatus: '입력완료',
    sequence: 2
  },
  3: {
    id: 3,
    dealerNumber: '3491',
    userId: 'kdqmeq',
    userName: '케이엠퍼시스',
    managerCode: '4125215',
    businessName: 'C병원',
    businessNumber: '321231-123124',
    prescriptionDate: '2025-03',
    settlementDate: '2025-04',
    registrationDate: '2025-04-10',
    prescriptionAmount: 3456789,
    inputStatus: '입력완료',
    sequence: 3
  },
  4: {
    id: 4,
    dealerNumber: '3491',
    userId: 'kdqmeq',
    userName: '케이엠퍼시스',
    managerCode: '3115615',
    businessName: 'D병원',
    businessNumber: '521-123124',
    prescriptionDate: '2025-03',
    settlementDate: '2025-04',
    registrationDate: '2025-04-10',
    prescriptionAmount: 4567890,
    inputStatus: '입력완료',
    sequence: 4
  },
  5: {
    id: 5,
    dealerNumber: '5678',
    userId: 'test01',
    userName: '테스트회원',
    managerCode: '7890123',
    businessName: 'E병원',
    businessNumber: '456-789012',
    prescriptionDate: '2025-04',
    settlementDate: '2025-04',
    registrationDate: '2025-04-11',
    prescriptionAmount: 5678901,
    inputStatus: '입력대기',
    sequence: 5
  }
};
