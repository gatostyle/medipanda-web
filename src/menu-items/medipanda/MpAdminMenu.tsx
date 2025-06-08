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
        permission: 'MEMBER_MANAGEMENT'
      },
      {
        id: 'products',
        title: '제품관리',
        type: 'item',
        url: 'products',
        permission: 'PRODUCT_MANAGEMENT'
      },
      {
        id: 'business-lines',
        title: '거래선관리',
        type: 'item',
        url: 'business-lines',
        permission: 'BUSINESS_LINE_MANAGEMENT'
      },
      {
        id: 'pharmaceutical',
        title: '제약관리',
        type: 'collapse',
        permission: 'PHARMACEUTICAL_MANAGEMENT',
        children: [
          {
            id: 'companies',
            title: '제약사',
            type: 'item',
            url: 'pharmaceutical/companies',
            permission: 'PHARMACEUTICAL_COMPANY_MANAGEMENT'
          },
          {
            id: 'products',
            title: '영업대행상품',
            type: 'item',
            url: 'pharmaceutical/products',
            permission: 'PHARMACEUTICAL_PRODUCT_MANAGEMENT'
          }
        ]
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
            url: 'prescription/receptions',
            permission: 'PRESCRIPTION_RECEPTION_MANAGEMENT'
          },
          {
            id: 'forms',
            title: '처방입력',
            type: 'item',
            url: 'prescription/forms',
            permission: 'PRESCRIPTION_FORM_MANAGEMENT'
          }
        ]
      },
      {
        id: 'adjustment',
        title: '정산관리',
        type: 'collapse',
        permission: 'ADJUSTMENT_MANAGEMENT',
        children: [
          {
            id: 'approved',
            title: '승인내역',
            type: 'item',
            url: 'adjustment/approved',
            permission: 'ADJUSTMENT_APPROVED_MANAGEMENT'
          },
          {
            id: 'adjustments',
            title: '정산내역',
            type: 'item',
            url: 'adjustment/adjustments',
            permission: 'ADJUSTMENT_ADJUSTMENT_MANAGEMENT'
          },
          {
            id: 'stats',
            title: '실적통계',
            type: 'item',
            url: 'adjustment/stats',
            permission: 'ADJUSTMENT_STATS_MANAGEMENT'
          }
        ]
      },
      {
        id: 'expenditure-reports',
        title: '지출보고관리',
        type: 'item',
        url: 'expenditure-reports',
        permission: 'EXPENDITURE_REPORT_MANAGEMENT'
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
            url: 'community/members',
            permission: 'COMMUNITY_MEMBER_MANAGEMENT'
          },
          {
            id: 'posts',
            title: '포스트 관리',
            type: 'item',
            url: 'community/posts',
            permission: 'COMMUNITY_POST_MANAGEMENT'
          },
          {
            id: 'comments',
            title: '댓글관리',
            type: 'item',
            url: 'community/comments',
            permission: 'COMMUNITY_COMMENT_MANAGEMENT'
          },
          {
            id: 'blinds',
            title: '블라인드 관리',
            type: 'item',
            url: 'community/blinds',
            permission: 'COMMUNITY_BLIND_MANAGEMENT'
          }
        ]
      },
      {
        id: 'content-management',
        title: '콘텐츠관리',
        type: 'collapse',
        permission: 'CONTENT_MANAGEMENT',
        children: [
          {
            id: 'hospitals',
            title: '개원병원페이지',
            type: 'item',
            url: 'content-management/hospitals',
            permission: 'CONTENT_HOSPITAL_MANAGEMENT'
          },
          {
            id: 'atoz',
            title: 'CSO A to Z',
            type: 'item',
            url: 'content-management/atoz',
            permission: 'CONTENT_ATOZ_MANAGEMENT'
          }
        ]
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
            url: 'customer-center/notices',
            permission: 'CUSTOMER_CENTER_NOTICE_MANAGEMENT'
          },
          {
            id: 'faqs',
            title: 'FAQ',
            type: 'item',
            url: 'customer-center/faqs',
            permission: 'CUSTOMER_CENTER_FAQ_MANAGEMENT'
          },
          {
            id: 'inquiries',
            title: '1:1 문의',
            type: 'item',
            url: 'customer-center/inquiries',
            permission: 'CUSTOMER_CENTER_INQUIRY_MANAGEMENT'
          }
        ]
      },
      {
        id: 'banners',
        title: '배너관리',
        type: 'item',
        url: 'banners',
        permission: 'BANNER_MANAGEMENT'
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
            url: 'permission/admins',
            permission: 'PERMISSION_ADMIN_MANAGEMENT'
          },
          {
            id: 'members',
            title: '사용자 권한',
            type: 'item',
            url: 'permission/members',
            permission: 'PERMISSION_MEMBER_MANAGEMENT'
          }
        ]
      }
    ]
  }
];

export function filterMenuByPermissions(menu: NavItemType[], userPermissions: string[]): NavItemType[] {
  return menu
    .map((item) => {
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
    .filter((item) => item !== null) as NavItemType[];
}
