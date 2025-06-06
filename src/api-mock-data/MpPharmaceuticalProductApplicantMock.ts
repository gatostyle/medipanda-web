import type { MpPharmaceuticalProductApplicant } from 'api-definitions/MpPharmaceuticalProductApplicant';

export const mockPharmaceuticalProductApplicants: Record<number, MpPharmaceuticalProductApplicant> = {
  1: {
    id: 1,
    memberNumber: '20230',
    userId: 'Keymed11',
    memberName: '키메디',
    phoneNumber: '010-3333-3231',
    applicationDate: '2025-04-10',
    partnerContract: 'Y',
    salesQuantity: 3
  },
  2: {
    id: 2,
    memberNumber: '20231',
    userId: 'Keydi12',
    memberName: '키메디32',
    phoneNumber: '010-3333-1111',
    applicationDate: '2025-04-10',
    partnerContract: 'N',
    salesQuantity: 4
  },
  3: {
    id: 3,
    memberNumber: '20232',
    userId: 'medipanda',
    memberName: '메디판다',
    phoneNumber: '010-1234-5678',
    applicationDate: '2025-04-11',
    partnerContract: 'Y',
    salesQuantity: 5
  },
  4: {
    id: 4,
    memberNumber: '20233',
    userId: 'testuser',
    memberName: '테스트유저',
    phoneNumber: '010-9876-5432',
    applicationDate: '2025-04-12',
    partnerContract: 'N',
    salesQuantity: 2
  },
  5: {
    id: 5,
    memberNumber: '20234',
    userId: 'healthcare',
    memberName: '헬스케어',
    phoneNumber: '010-5555-7777',
    applicationDate: '2025-04-13',
    partnerContract: 'Y',
    salesQuantity: 8
  }
};
