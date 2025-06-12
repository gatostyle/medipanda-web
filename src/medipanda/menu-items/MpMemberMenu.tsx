import { NavItemType } from 'types/menu';

export const mpMemberMenu: NavItemType[] = [
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
    id: 'settlement',
    title: '정산',
    type: 'item',
    url: '/settlements'
  },
  {
    id: 'community',
    title: '커뮤니티',
    type: 'item',
    url: '/community'
  }
];
