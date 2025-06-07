import type { MpMember } from 'api-definitions/MpMember';
import { MpPartnershipType } from 'api-definitions/MpPartnershipType';

export const mockMembers: Record<number, MpMember> = {
  10000: {
    id: 10000,
    memberNo: '20230',
    userId: 'Keymedi11',
    name: '케이메디컬스',
    email: 'kkkkk@keymedi.com',
    phone: '010-3333-3231',
    state: true,
    csoCertification: true,
    createdAt: '2025-04-10',
    partnershipType: MpPartnershipType.CORPORATE,
    birthDate: '1999-10-10',
    lastLoginAt: '2025-04-10',
    referralCode: 'ABC123',
    businessInfo: {
      name: '케이메디컬스',
      contractDate: '2025-04-23',
      position: '계약중',
      businessNo: '465-86-03299',
      address: '우리은행 1005-123-45845',
      registrationDate: '2025-04-23'
    },
    marketingConsent: {
      sms: true,
      email: true,
      push: false
    },
    memo: '테스트 메모입니다.'
  },
  9999: {
    id: 9999,
    memberNo: '20231',
    userId: 'Keydl12',
    name: '키메디',
    email: 'fjsd325gksdaf@keymedi.com',
    phone: '010-3333-1111',
    state: false,
    csoCertification: false,
    createdAt: '2025-04-05',
    partnershipType: MpPartnershipType.NONE,
    birthDate: '1999-10-10',
    lastLoginAt: '2025-04-05',
    referralCode: 'XYZ789',
    businessInfo: {
      name: '키메디',
      contractDate: '2025-04-05',
      position: '미계약',
      businessNo: '465-86-03300',
      address: '국민은행 1005-123-45846',
      registrationDate: '2025-04-05'
    },
    marketingConsent: {
      sms: false,
      email: true,
      push: true
    }
  }
};
