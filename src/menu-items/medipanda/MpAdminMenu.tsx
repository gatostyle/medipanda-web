import { NavItemType } from 'types/menu';

export const mpAdminMenu: NavItemType[] = [
  {
    id: 'admin',
    title: 'MENU',
    type: 'item',
    url: '/admin',
    children: [
      {
        id: 'members',
        title: '회원관리',
        type: 'item',
        url: ''
      },
      {
        id: 'products',
        title: '제품관리',
        type: 'item',
        url: 'products'
      },
      {
        id: 'business-lines',
        title: '거래선관리',
        type: 'item',
        url: 'business-lines'
      },
      {
        id: 'pharmaceutical',
        title: '제약관리',
        type: 'collapse',
        children: [
          {
            id: 'companies',
            title: '제약사',
            type: 'item',
            url: 'pharmaceutical/companies'
          },
          {
            id: 'products',
            title: '영업대행상품',
            type: 'item',
            url: 'pharmaceutical/products'
          }
        ]
      },
      {
        id: 'prescription',
        title: '처방관리',
        type: 'collapse',
        children: [
          {
            id: 'receptions',
            title: '처방접수',
            type: 'item',
            url: 'prescription/receptions'
          },
          {
            id: 'forms',
            title: '처방입력',
            type: 'item',
            url: 'prescription/forms'
          }
        ]
      },
      {
        id: 'adjustment',
        title: '정산관리',
        type: 'collapse',
        children: [
          {
            id: 'approved',
            title: '승인내역',
            type: 'item',
            url: 'adjustment/approved'
          },
          {
            id: 'adjustments',
            title: '정산내역',
            type: 'item',
            url: 'adjustment/adjustments'
          },
          {
            id: 'stats',
            title: '실적통계',
            type: 'item',
            url: 'adjustment/stats'
          }
        ]
      },
      {
        id: 'expenditure-reports',
        title: '지출보고관리',
        type: 'item',
        url: 'expenditure-reports'
      },
      {
        id: 'community',
        title: '커뮤니티',
        type: 'collapse',
        children: [
          {
            id: 'members',
            title: '이용자 관리',
            type: 'item',
            url: 'community/members'
          },
          {
            id: 'posts',
            title: '포스트 관리',
            type: 'item',
            url: 'community/posts'
          },
          {
            id: 'comments',
            title: '댓글관리',
            type: 'item',
            url: 'community/comments'
          },
          {
            id: 'blinds',
            title: '블라인드 관리',
            type: 'item',
            url: 'community/blinds'
          }
        ]
      },
      {
        id: 'content-management',
        title: '콘텐츠관리',
        type: 'collapse',
        children: [
          {
            id: 'hospitals',
            title: '개원병원페이지',
            type: 'item',
            url: 'content-management/hospitals'
          },
          {
            id: 'atoz',
            title: 'CSO A to Z',
            type: 'item',
            url: 'content-management/atoz'
          }
        ]
      },
      {
        id: 'customer-service',
        title: '고객센터',
        type: 'collapse',
        children: [
          {
            id: 'notices',
            title: '공지사항',
            type: 'item',
            url: 'customer-service/notices'
          },
          {
            id: 'faqs',
            title: 'FAQ',
            type: 'item',
            url: 'customer-service/faqs'
          },
          {
            id: 'inquiries',
            title: '1:1 문의',
            type: 'item',
            url: 'customer-service/inquiries'
          }
        ]
      },
      {
        id: 'banners',
        title: '배너관리',
        type: 'item',
        url: 'banners'
      },
      {
        id: 'permission',
        title: '권한관리',
        type: 'collapse',
        children: [
          {
            id: 'admins',
            title: '관리자 권한',
            type: 'item',
            url: 'permission/admins'
          },
          {
            id: 'members',
            title: '사용자 권한',
            type: 'item',
            url: 'permission/members'
          }
        ]
      }
    ]
  }
];
