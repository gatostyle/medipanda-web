import { AdminPermission } from '@/backend';
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
        permission: AdminPermission.MEMBER_MANAGEMENT,
      },
      {
        id: 'products',
        title: '제품관리',
        type: 'item',
        url: 'products',
        permission: AdminPermission.PRODUCT_MANAGEMENT,
      },
      {
        id: 'partners',
        title: '거래선관리',
        type: 'item',
        url: 'partners',
        permission: AdminPermission.TRANSACTION_MANAGEMENT,
      },
      {
        id: 'contracts',
        title: '계약관리',
        type: 'collapse',
        permission: AdminPermission.CONTRACT_MANAGEMENT,
        children: [
          {
            id: 'sales-agency-products',
            title: '영업대행상품',
            type: 'item',
            url: 'sales-agency-products',
            permission: AdminPermission.PRODUCT_MANAGEMENT,
          },
        ],
      },
      {
        id: 'prescription',
        title: '처방관리',
        type: 'collapse',
        permission: AdminPermission.PRESCRIPTION_MANAGEMENT,
        children: [
          {
            id: 'receptions',
            title: '처방접수',
            type: 'item',
            url: 'prescription-receptions',
            permission: AdminPermission.PRESCRIPTION_MANAGEMENT,
          },
          {
            id: 'forms',
            title: '처방입력',
            type: 'item',
            url: 'prescription-forms',
            permission: AdminPermission.PRESCRIPTION_MANAGEMENT,
          },
        ],
      },
      {
        id: 'settlement',
        title: '정산관리',
        type: 'collapse',
        permission: AdminPermission.SETTLEMENT_MANAGEMENT,
        children: [
          {
            id: 'settlements',
            title: '정산내역',
            type: 'item',
            url: 'settlements',
            permission: AdminPermission.SETTLEMENT_MANAGEMENT,
          },
          {
            id: 'stats',
            title: '실적통계',
            type: 'item',
            url: 'settlement-statistics',
            permission: AdminPermission.SETTLEMENT_MANAGEMENT,
          },
        ],
      },
      {
        id: 'expense-reports',
        title: '지출보고관리',
        type: 'item',
        url: 'expense-reports',
        permission: AdminPermission.EXPENSE_REPORT_MANAGEMENT,
      },
      {
        id: 'community',
        title: '커뮤니티',
        type: 'collapse',
        permission: AdminPermission.COMMUNITY_MANAGEMENT,
        children: [
          {
            id: 'members',
            title: '이용자 관리',
            type: 'item',
            url: 'community-users',
            permission: AdminPermission.COMMUNITY_MANAGEMENT,
          },
          {
            id: 'posts',
            title: '포스트 관리',
            type: 'item',
            url: 'community-posts',
            permission: AdminPermission.COMMUNITY_MANAGEMENT,
          },
          {
            id: 'comments',
            title: '댓글 관리',
            type: 'item',
            url: 'community-comments',
            permission: AdminPermission.COMMUNITY_MANAGEMENT,
          },
          {
            id: 'blinds',
            title: '블라인드 관리',
            type: 'item',
            url: 'community-blinds',
            permission: AdminPermission.COMMUNITY_MANAGEMENT,
          },
        ],
      },
      {
        id: 'content-management',
        title: '콘텐츠 관리',
        type: 'collapse',
        permission: AdminPermission.CONTENT_MANAGEMENT,
        children: [
          {
            id: 'hospitals',
            title: '개원병원페이지',
            type: 'item',
            url: 'hospitals',
            permission: AdminPermission.CONTENT_MANAGEMENT,
          },
          {
            id: 'atoz',
            title: 'CSO A to Z',
            type: 'item',
            url: 'atoz',
            permission: AdminPermission.CONTENT_MANAGEMENT,
          },
          {
            id: 'events',
            title: '이벤트 관리',
            type: 'item',
            url: 'events',
            permission: AdminPermission.CONTENT_MANAGEMENT,
          },
        ],
      },
      {
        id: 'customer-center',
        title: '고객센터',
        type: 'collapse',
        permission: AdminPermission.CUSTOMER_SERVICE,
        children: [
          {
            id: 'notices',
            title: '공지사항',
            type: 'item',
            url: 'notices',
            permission: AdminPermission.CUSTOMER_SERVICE,
          },
          {
            id: 'faqs',
            title: 'FAQ',
            type: 'item',
            url: 'faqs',
            permission: AdminPermission.CUSTOMER_SERVICE,
          },
          {
            id: 'inquiries',
            title: '1:1 문의',
            type: 'item',
            url: 'inquiries',
            permission: AdminPermission.CUSTOMER_SERVICE,
          },
        ],
      },
      {
        id: 'banners',
        title: '배너관리',
        type: 'item',
        url: 'banners',
        permission: AdminPermission.BANNER_MANAGEMENT,
      },
      {
        id: 'permission',
        title: '권한관리',
        type: 'collapse',
        permission: AdminPermission.PERMISSION_MANAGEMENT,
        children: [
          {
            id: 'admins',
            title: '관리자 권한',
            type: 'item',
            url: 'admins',
            permission: AdminPermission.PERMISSION_MANAGEMENT,
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
