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
        url: 'members',
        permission: 'MEMBER_MANAGEMENT',
      },
      {
        id: 'products',
        title: '제품관리',
        type: 'item',
        url: 'products',
        permission: 'PRODUCT_MANAGEMENT',
      },
      {
        id: 'partners',
        title: '거래선관리',
        type: 'item',
        url: 'partners',
        permission: 'PARTNER_MANAGEMENT',
      },
      {
        id: 'contracts',
        title: '계약관리',
        type: 'collapse',
        permission: 'CONTRACT_MANAGEMENT',
        children: [
          {
            id: 'sales-agency-products',
            title: '영업대행상품',
            type: 'item',
            url: 'sales-agency-products',
            permission: 'PRODUCT_MANAGEMENT',
          },
        ],
      },
      {
        id: 'prescription',
        title: '처방관리',
        type: 'collapse',
        permission: 'PRESCRIPTION_MANAGEMENT',
        children: [
          {
            id: 'receptions',
            title: '처방접수',
            type: 'item',
            url: 'prescription-receptions',
            permission: 'PRESCRIPTION_RECEPTION_MANAGEMENT',
          },
          {
            id: 'forms',
            title: '처방입력',
            type: 'item',
            url: 'prescription-forms',
            permission: 'PRESCRIPTION_FORM_MANAGEMENT',
          },
        ],
      },
      {
        id: 'settlement',
        title: '정산관리',
        type: 'collapse',
        permission: 'SETTLEMENT_MANAGEMENT',
        children: [
          {
            id: 'settlements',
            title: '정산내역',
            type: 'item',
            url: 'settlements',
            permission: 'SETTLEMENT_SETTLEMENT_MANAGEMENT',
          },
          {
            id: 'stats',
            title: '실적통계',
            type: 'item',
            url: 'settlement-statistics',
            permission: 'SETTLEMENT_STATS_MANAGEMENT',
          },
        ],
      },
      {
        id: 'expense-reports',
        title: '지출보고관리',
        type: 'item',
        url: 'expense-reports',
        permission: 'EXPENSE_REPORT_MANAGEMENT',
      },
      {
        id: 'community',
        title: '커뮤니티',
        type: 'collapse',
        permission: 'COMMUNITY_MANAGEMENT',
        children: [
          {
            id: 'members',
            title: '이용자 관리',
            type: 'item',
            url: 'community-users',
            permission: 'COMMUNITY_MEMBER_MANAGEMENT',
          },
          {
            id: 'posts',
            title: '포스트 관리',
            type: 'item',
            url: 'community-posts',
            permission: 'COMMUNITY_POST_MANAGEMENT',
          },
          {
            id: 'comments',
            title: '댓글 관리',
            type: 'item',
            url: 'community-comments',
            permission: 'COMMUNITY_COMMENT_MANAGEMENT',
          },
          {
            id: 'blinds',
            title: '블라인드 관리',
            type: 'item',
            url: 'community-blinds',
            permission: 'COMMUNITY_BLIND_MANAGEMENT',
          },
        ],
      },
      {
        id: 'content-management',
        title: '콘텐츠 관리',
        type: 'collapse',
        permission: 'CONTENT_MANAGEMENT',
        children: [
          {
            id: 'hospitals',
            title: '개원병원페이지',
            type: 'item',
            url: 'hospitals',
            permission: 'CONTENT_HOSPITAL_MANAGEMENT',
          },
          {
            id: 'atoz',
            title: 'CSO A to Z',
            type: 'item',
            url: 'atoz',
            permission: 'CONTENT_ATOZ_MANAGEMENT',
          },
          {
            id: 'events',
            title: '이벤트 관리',
            type: 'item',
            url: 'events',
            permission: 'CONTENT_EVENT_MANAGEMENT',
          },
        ],
      },
      {
        id: 'customer-center',
        title: '고객센터',
        type: 'collapse',
        permission: 'CUSTOMER_CENTER_MANAGEMENT',
        children: [
          {
            id: 'notices',
            title: '공지사항',
            type: 'item',
            url: 'notices',
            permission: 'CUSTOMER_CENTER_NOTICE_MANAGEMENT',
          },
          {
            id: 'faqs',
            title: 'FAQ',
            type: 'item',
            url: 'faqs',
            permission: 'CUSTOMER_CENTER_FAQ_MANAGEMENT',
          },
          {
            id: 'inquiries',
            title: '1:1 문의',
            type: 'item',
            url: 'inquiries',
            permission: 'CUSTOMER_CENTER_INQUIRY_MANAGEMENT',
          },
        ],
      },
      {
        id: 'banners',
        title: '배너관리',
        type: 'item',
        url: 'banners',
        permission: 'BANNER_MANAGEMENT',
      },
      {
        id: 'permission',
        title: '권한관리',
        type: 'collapse',
        permission: 'PERMISSION_MANAGEMENT',
        children: [
          {
            id: 'admins',
            title: '관리자 권한',
            type: 'item',
            url: 'admins',
            permission: 'PERMISSION_ADMIN_MANAGEMENT',
          },
        ],
      },
    ],
  },
];

export function filterMenuByPermissions(menu: NavItemType[], userPermissions: string[]): NavItemType[] {
  return menu
    .map(item => {
      const filteredItem = { ...item };

      if (item.children) {
        const filteredChildren = filterMenuByPermissions(item.children, userPermissions);

        if (filteredChildren.length > 0) {
          filteredItem.children = filteredChildren;
        } else {
          return null;
        }
      }

      if (item.permission && !userPermissions.includes(item.permission)) {
        return null;
      }

      return filteredItem;
    })
    .filter(item => item !== null) as NavItemType[];
}
