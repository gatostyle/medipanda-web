import type { MpMember } from 'api-definitions/MpMember';
import type { MpBanner } from 'api-definitions/MpBanner';
import type { MpAdmin } from 'api-definitions/MpAdmin';
import { MpPartnershipType } from 'api-definitions/MpPartnershipType';
import { MpMemberPermissionResponse } from 'api-definitions/MpPermission';

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
      appPush: false
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
      appPush: true
    }
  }
};

export const mockAdmins: Record<number, MpAdmin> = {
  1: {
    id: 1,
    userId: 'ADMIN 1',
    name: '홍길동',
    email: 'ADMIN3@KEYMEDI.COM',
    phone: '010-XXXX-XXXX',
    role: '최고관리자',
    state: true,
    createdAt: '2025-04-05 14:00'
  },
  2: {
    id: 2,
    userId: 'ADMIN 2',
    name: '홍길동임',
    email: 'ADMIN3@KEYMEDI.COM',
    phone: '010-XXXX-XXXX',
    role: '운영자',
    state: false,
    createdAt: '2025-04-05 14:00'
  },
  3: {
    id: 3,
    userId: 'ADMIN 3',
    name: '홍길동아님',
    email: 'ADMIN3@KEYMEDI.COM',
    phone: '010-XXXX-XXXX',
    role: '운영자',
    state: false,
    createdAt: '2025-04-05 14:00'
  }
};

export const mockBanners: Record<number, MpBanner> = {
  1: {
    id: 1,
    position: '메인 상단',
    title: '신규 회원 가입 이벤트',
    state: true,
    scope: {
      contracted: true,
      nonContracted: true
    },
    startAt: '2024-04-01',
    endAt: '2024-04-30',
    createdAt: '2024-03-25',
    order: 1,
    impressions: 15000,
    views: 3000,
    ctr: 20,
    imageUrl: '/images/banners/signup-event.jpg',
    linkUrl: '/events/signup'
  },
  2: {
    id: 2,
    position: '메인 중단',
    title: '파트너사 전용 프로모션',
    state: true,
    scope: {
      contracted: true,
      nonContracted: false
    },
    startAt: '2024-04-01',
    endAt: '2024-05-31',
    createdAt: '2024-03-26',
    order: 2,
    impressions: 12000,
    views: 2400,
    ctr: 20,
    imageUrl: '/images/banners/partner-promo.jpg',
    linkUrl: '/promotions/partner'
  },
  3: {
    id: 3,
    position: '메인 하단',
    title: '의료기기 신제품 소개',
    state: false,
    scope: {
      contracted: false,
      nonContracted: true
    },
    startAt: '2024-05-01',
    endAt: '2024-05-31',
    createdAt: '2024-03-27',
    order: 3,
    impressions: 0,
    views: 0,
    ctr: 0,
    imageUrl: '/images/banners/new-product.jpg',
    linkUrl: '/products/new'
  },
  4: {
    id: 4,
    position: '리스트 상단',
    title: '봄맞이 특별 할인',
    state: true,
    scope: {
      contracted: true,
      nonContracted: true
    },
    startAt: '2024-04-15',
    endAt: '2024-05-15',
    createdAt: '2024-03-28',
    order: 4,
    impressions: 8000,
    views: 1200,
    ctr: 15,
    imageUrl: '/images/banners/spring-sale.jpg',
    linkUrl: '/events/spring-sale'
  }
};

export const mockMemberPermission: MpMemberPermissionResponse = {
  permissions: [
    {
      category: 'CSO A TO Z',
      feature: '댓글',
      permissions: { Contracted: true, NonContracted: false }
    },
    {
      category: 'CSO A TO Z',
      feature: '좋아요',
      permissions: { Contracted: true, NonContracted: true }
    },
    {
      category: '제품검색',
      feature: '첨부파일 업로드',
      permissions: { Contracted: false, NonContracted: true }
    }
  ]
};
