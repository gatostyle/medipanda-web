import { AdminPermission } from '@/backend';

interface BaseMenuItem {
  icon?: string;
  label: string;
  matchingPaths?: string[];
  permission?: string;
}

export interface LeafMenuItem extends BaseMenuItem {
  path: string;
}

export interface NestedMenuItem extends BaseMenuItem {
  children: MenuItem[];
}

export type MenuItem = LeafMenuItem | NestedMenuItem;

export function isLeafMenuItem(item: MenuItem): item is LeafMenuItem {
  return (item as LeafMenuItem).path !== undefined;
}

export function isNestedMenuItem(item: MenuItem): item is NestedMenuItem {
  return (item as NestedMenuItem).children !== undefined;
}

export function filterMenuByPermissions(menu: MenuItem[], userPermissions: string[]): MenuItem[] {
  return menu
    .map(item => {
      const filteredItem = { ...item };

      if (isNestedMenuItem(filteredItem)) {
        const filteredChildren = filterMenuByPermissions(filteredItem.children, userPermissions);

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
    .filter((item): item is MenuItem => item !== null);
}

export const menuItems: MenuItem[] = [
  {
    label: '회원관리',
    path: '/admin/members',
    permission: AdminPermission.MEMBER_MANAGEMENT,
  },
  {
    label: '제품관리',
    path: '/admin/products',
    permission: AdminPermission.PRODUCT_MANAGEMENT,
  },
  {
    label: '거래선관리',
    path: '/admin/partners',
    permission: AdminPermission.TRANSACTION_MANAGEMENT,
  },
  {
    label: '계약관리',
    permission: AdminPermission.CONTRACT_MANAGEMENT,
    children: [
      {
        label: '영업대행상품',
        path: '/admin/sales-agency-products',
        permission: AdminPermission.PRODUCT_MANAGEMENT,
      },
    ],
  },
  {
    label: '처방관리',
    permission: AdminPermission.PRESCRIPTION_MANAGEMENT,
    children: [
      {
        label: '처방접수',
        path: '/admin/prescription-receptions',
        permission: AdminPermission.PRESCRIPTION_MANAGEMENT,
      },
      {
        label: '처방입력',
        path: '/admin/prescription-forms',
        permission: AdminPermission.PRESCRIPTION_MANAGEMENT,
      },
    ],
  },
  {
    label: '정산관리',
    permission: AdminPermission.SETTLEMENT_MANAGEMENT,
    children: [
      {
        label: '정산내역',
        path: '/admin/settlements',
        permission: AdminPermission.SETTLEMENT_MANAGEMENT,
      },
      {
        label: '실적통계',
        path: '/admin/settlement-statistics',
        permission: AdminPermission.SETTLEMENT_MANAGEMENT,
      },
    ],
  },
  {
    label: '지출보고관리',
    path: '/admin/expense-reports',
    permission: AdminPermission.EXPENSE_REPORT_MANAGEMENT,
  },
  {
    label: '커뮤니티',
    permission: AdminPermission.COMMUNITY_MANAGEMENT,
    children: [
      {
        label: '이용자 관리',
        path: '/admin/community-users',
        permission: AdminPermission.COMMUNITY_MANAGEMENT,
      },
      {
        label: '포스트 관리',
        path: '/admin/community-posts',
        permission: AdminPermission.COMMUNITY_MANAGEMENT,
      },
      {
        label: '댓글 관리',
        path: '/admin/community-comments',
        permission: AdminPermission.COMMUNITY_MANAGEMENT,
      },
      {
        label: '블라인드 관리',
        path: '/admin/community-blinds',
        permission: AdminPermission.COMMUNITY_MANAGEMENT,
      },
    ],
  },
  {
    label: '콘텐츠 관리',
    permission: AdminPermission.CONTENT_MANAGEMENT,
    children: [
      {
        label: '개원병원페이지',
        path: '/admin/hospitals',
        permission: AdminPermission.CONTENT_MANAGEMENT,
      },
      {
        label: 'CSO A to Z',
        path: '/admin/atoz',
        permission: AdminPermission.CONTENT_MANAGEMENT,
      },
      {
        label: '이벤트 관리',
        path: '/admin/events',
        permission: AdminPermission.CONTENT_MANAGEMENT,
      },
    ],
  },
  {
    label: '고객센터',
    permission: AdminPermission.CUSTOMER_SERVICE,
    children: [
      {
        label: '공지사항',
        path: '/admin/notices',
        permission: AdminPermission.CUSTOMER_SERVICE,
      },
      {
        label: 'FAQ',
        path: '/admin/faqs',
        permission: AdminPermission.CUSTOMER_SERVICE,
      },
      {
        label: '1:1 문의',
        path: '/admin/inquiries',
        permission: AdminPermission.CUSTOMER_SERVICE,
      },
    ],
  },
  {
    label: '배너관리',
    path: '/admin/banners',
    permission: AdminPermission.BANNER_MANAGEMENT,
  },
  {
    label: '권한관리',
    permission: 'NEVER',
    children: [
      {
        label: '관리자 권한',
        path: '/admin/admins',
        permission: 'NEVER',
      },
    ],
  },
];
