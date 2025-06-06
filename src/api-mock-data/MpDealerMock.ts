import type { MpDealer } from 'api-definitions/MpDealer';

export const mockDealers: Record<number, MpDealer> = {
  1: {
    id: 1,
    dealerNumber: '1235',
    dealerName: 'A병원',
    userId: 'kdqmeq',
    userName: '케이엠퍼시스',
    managerName: '김담당'
  },
  2: {
    id: 2,
    dealerNumber: '3491',
    dealerName: 'B병원',
    userId: 'test01',
    userName: '테스트회원',
    managerName: '이담당'
  },
  3: {
    id: 3,
    dealerNumber: '5678',
    dealerName: 'C병원',
    userId: 'user02',
    userName: '유저회원',
    managerName: '박담당'
  },
  4: {
    id: 4,
    dealerNumber: '7890',
    dealerName: 'D병원',
    userId: 'admin01',
    userName: '관리자회원',
    managerName: '최담당'
  },
  5: {
    id: 5,
    dealerNumber: '2468',
    dealerName: 'E병원',
    userId: 'medipanda',
    userName: '메디판다',
    managerName: '정담당'
  }
};
