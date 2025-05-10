import { NavItemType } from 'types/menu';

export const csoMemberMenu: NavItemType[] = [
  {
    id: 'products',
    title: '제품검색',
    type: 'item',
    url: '/products'
  },
  {
    id: 'prescription',
    title: '처방',
    type: 'item',
    url: '/prescriptions'
  },
  {
    id: 'adjustment',
    title: '정산',
    type: 'item',
    url: '/adjustments'
  },
  {
    id: 'community',
    title: '커뮤니티',
    type: 'item',
    url: '/community'
  }
];
