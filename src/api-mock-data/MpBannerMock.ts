import type { MpBanner } from 'api-definitions/MpBanner';

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
