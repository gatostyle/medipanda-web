import { AdminPermission } from '@/backend';
import { Base64ErrorBoundary } from '@/lib/react/Base64ErrorBoundary';
import { FixedLinearProgress } from '@/lib/react/FixedLinearProgress';
import { MpGuestGuard } from '@/medipanda/utils/route-guard';
import DashboardLayout from 'layout/Dashboard';
import { MpAdminGuard } from '@/medipanda/utils/route-guard/MpAdminGuard';
import { ElementType, lazy, Suspense } from 'react';
import { Navigate, Outlet, RouteObject } from 'react-router-dom';

const Loadable = (Component: ElementType) => (props: any) => (
  <Suspense fallback={<FixedLinearProgress />}>
    <Component {...props} />
  </Suspense>
);

const MpLogin = Loadable(lazy(() => import('medipanda/pages/MpLogin')));
const MpLogout = Loadable(lazy(() => import('medipanda/pages/MpLogout')));

const MpAdminMain = Loadable(lazy(() => import('medipanda/pages/MpAdminMain')));
const MpAdminMemberList = Loadable(lazy(() => import('medipanda/pages/MpAdminMemberList')));
const MpAdminMemberEdit = Loadable(lazy(() => import('medipanda/pages/MpAdminMemberEdit')));
const MpAdminSalesAgencyProductList = Loadable(lazy(() => import('medipanda/pages/MpAdminSalesAgencyProductList')));
const MpAdminSalesAgencyProductDetail = Loadable(lazy(() => import('medipanda/pages/MpAdminSalesAgencyProductDetail')));
const MpAdminSalesAgencyProductEdit = Loadable(lazy(() => import('medipanda/pages/MpAdminSalesAgencyProductEdit')));
const MpAdminPartnerList = Loadable(lazy(() => import('medipanda/pages/MpAdminPartnerList')));
const MpAdminPartnerEdit = Loadable(lazy(() => import('medipanda/pages/MpAdminPartnerEdit')));
const MpAdminProductList = Loadable(lazy(() => import('medipanda/pages/MpAdminProductList')));
const MpAdminProductDetail = Loadable(lazy(() => import('medipanda/pages/MpAdminProductDetail')));
const MpAdminProductEdit = Loadable(lazy(() => import('medipanda/pages/MpAdminProductEdit')));
const MpAdminPrescriptionReceptionList = Loadable(lazy(() => import('medipanda/pages/MpAdminPrescriptionReceptionList')));
const MpAdminPrescriptionFormList = Loadable(lazy(() => import('medipanda/pages/MpAdminPrescriptionFormList')));
const MpAdminPrescriptionFormProducts = Loadable(lazy(() => import('medipanda/pages/MpAdminPrescriptionFormProducts')));
const MpAdminSettlementPartnerDetail = Loadable(lazy(() => import('@/medipanda/pages/MpAdminSettlementPartnerDetail')));
const MpAdminSettlementList = Loadable(lazy(() => import('medipanda/pages/MpAdminSettlementList')));
const MpAdminSettlementDetail = Loadable(lazy(() => import('@/medipanda/pages/MpAdminSettlementDetail')));
const MpAdminStatisticsList = Loadable(lazy(() => import('medipanda/pages/MpAdminStatisticsList')));
const MpAdminExpenseReportList = Loadable(lazy(() => import('medipanda/pages/MpAdminExpenseReportList')));
const MpAdminCommunityPostList = Loadable(lazy(() => import('medipanda/pages/MpAdminCommunityPostList')));
const MpAdminCommunityCommentList = Loadable(lazy(() => import('medipanda/pages/MpAdminCommunityCommentList')));
const MpAdminCommunityBlindList = Loadable(lazy(() => import('medipanda/pages/MpAdminCommunityBlindList')));
const MpAdminHospitalList = Loadable(lazy(() => import('medipanda/pages/MpAdminHospitalList')));
const MpAdminAtoZList = Loadable(lazy(() => import('medipanda/pages/MpAdminAtoZList')));
const MpAdminAtoZDetail = Loadable(lazy(() => import('medipanda/pages/MpAdminAtoZDetail')));
const MpAdminAtoZEdit = Loadable(lazy(() => import('medipanda/pages/MpAdminAtoZEdit')));
const MpAdminNoticeList = Loadable(lazy(() => import('medipanda/pages/MpAdminNoticeList')));
const MpAdminNoticeDetail = Loadable(lazy(() => import('medipanda/pages/MpAdminNoticeDetail')));
const MpAdminNoticeEdit = Loadable(lazy(() => import('medipanda/pages/MpAdminNoticeEdit')));
const MpAdminFaqList = Loadable(lazy(() => import('medipanda/pages/MpAdminFaqList')));
const MpAdminFaqDetail = Loadable(lazy(() => import('medipanda/pages/MpAdminFaqDetail')));
const MpAdminFaqEdit = Loadable(lazy(() => import('medipanda/pages/MpAdminFaqEdit')));
const MpAdminInquiryList = Loadable(lazy(() => import('medipanda/pages/MpAdminInquiryList')));
const MpAdminInquiryDetail = Loadable(lazy(() => import('@/medipanda/pages/MpAdminInquiryDetail')));
const MpAdminBannerList = Loadable(lazy(() => import('medipanda/pages/MpAdminBannerList')));
const MpAdminBannerEdit = Loadable(lazy(() => import('medipanda/pages/MpAdminBannerEdit')));
const MpAdminAdminList = Loadable(lazy(() => import('medipanda/pages/MpAdminAdminList')));
const MpAdminAdminEdit = Loadable(lazy(() => import('medipanda/pages/MpAdminAdminEdit')));
const MpAdminEventList = Loadable(lazy(() => import('medipanda/pages/MpAdminEventList')));
const MpAdminEventDetail = Loadable(lazy(() => import('medipanda/pages/MpAdminEventDetail')));
const MpAdminEventEdit = Loadable(lazy(() => import('medipanda/pages/MpAdminEventEdit')));

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));

const MpAdminCommunityUserList = Loadable(lazy(() => import('medipanda/pages/MpAdminCommunityUserList')));
const MpAdminCommunityPostDetail = Loadable(lazy(() => import('medipanda/pages/MpAdminCommunityPostDetail')));

const authRoutes: RouteObject[] = [
  {
    element: (
      <MpGuestGuard>
        <Outlet />
      </MpGuestGuard>
    ),
    children: [
      {
        path: 'login',
        element: <MpLogin />,
      },
      { path: '', element: <Navigate to='/login' /> },
    ],
  },
  {
    path: 'logout',
    element: <MpLogout />,
  },
];

const adminRoute: RouteObject = {
  path: 'admin',
  element: (
    <MpAdminGuard>
      <DashboardLayout />
    </MpAdminGuard>
  ),
  children: [
    {
      element: <MpAdminMain />,
      index: true,
    },
    {
      path: 'members',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.MEMBER_MANAGEMENT}>
          <MpAdminMemberList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'members/new',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.MEMBER_MANAGEMENT}>
          <MpAdminMemberEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'members/:userId/edit',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.MEMBER_MANAGEMENT}>
          <MpAdminMemberEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'sales-agency-products',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTRACT_MANAGEMENT}>
          <MpAdminSalesAgencyProductList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'sales-agency-products/new',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTRACT_MANAGEMENT}>
          <MpAdminSalesAgencyProductEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'sales-agency-products/:salesAgencyProductId',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTRACT_MANAGEMENT}>
          <MpAdminSalesAgencyProductDetail />
        </MpAdminGuard>
      ),
    },
    {
      path: 'sales-agency-products/:salesAgencyProductId/edit',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTRACT_MANAGEMENT}>
          <MpAdminSalesAgencyProductEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'partners',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.TRANSACTION_MANAGEMENT}>
          <MpAdminPartnerList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'partners/new',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.TRANSACTION_MANAGEMENT}>
          <MpAdminPartnerEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'partners/:partnerId/edit',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.TRANSACTION_MANAGEMENT}>
          <MpAdminPartnerEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'products',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.PRODUCT_MANAGEMENT}>
          <MpAdminProductList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'products/new',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.PRODUCT_MANAGEMENT}>
          <MpAdminProductEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'products/:productId',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.PRODUCT_MANAGEMENT}>
          <MpAdminProductDetail />
        </MpAdminGuard>
      ),
    },
    {
      path: 'products/:productId/edit',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.PRODUCT_MANAGEMENT}>
          <MpAdminProductEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'prescription-receptions',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.PRESCRIPTION_MANAGEMENT}>
          <MpAdminPrescriptionReceptionList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'prescription-forms',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.PRESCRIPTION_MANAGEMENT}>
          <MpAdminPrescriptionFormList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'prescription-forms/:prescriptionPartnerId/products',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.PRESCRIPTION_MANAGEMENT}>
          <MpAdminPrescriptionFormProducts />
        </MpAdminGuard>
      ),
    },
    {
      path: 'settlements',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.SETTLEMENT_MANAGEMENT}>
          <MpAdminSettlementList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'settlements/:settlementId',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.SETTLEMENT_MANAGEMENT}>
          <MpAdminSettlementDetail />
        </MpAdminGuard>
      ),
    },
    {
      path: 'settlements/:settlementId/partners/:settlementPartnerId',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.SETTLEMENT_MANAGEMENT}>
          <MpAdminSettlementPartnerDetail />
        </MpAdminGuard>
      ),
    },
    {
      path: 'settlement-statistics',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.SETTLEMENT_MANAGEMENT}>
          <MpAdminStatisticsList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'expense-reports',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.EXPENSE_REPORT_MANAGEMENT}>
          <MpAdminExpenseReportList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'community-users',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.COMMUNITY_MANAGEMENT}>
          <MpAdminCommunityUserList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'community-posts',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.COMMUNITY_MANAGEMENT}>
          <MpAdminCommunityPostList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'community-posts/:boardId',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.COMMUNITY_MANAGEMENT}>
          <MpAdminCommunityPostDetail />
        </MpAdminGuard>
      ),
    },
    {
      path: 'community-comments',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.COMMUNITY_MANAGEMENT}>
          <MpAdminCommunityCommentList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'community-blinds',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.COMMUNITY_MANAGEMENT}>
          <MpAdminCommunityBlindList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'hospitals',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTENT_MANAGEMENT}>
          <MpAdminHospitalList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'atoz',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTENT_MANAGEMENT}>
          <MpAdminAtoZList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'atoz/new',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTENT_MANAGEMENT}>
          <MpAdminAtoZEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'atoz/:boardId',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTENT_MANAGEMENT}>
          <MpAdminAtoZDetail />
        </MpAdminGuard>
      ),
    },
    {
      path: 'atoz/:boardId/edit',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTENT_MANAGEMENT}>
          <MpAdminAtoZEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'notices',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CUSTOMER_SERVICE}>
          <MpAdminNoticeList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'notices/new',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CUSTOMER_SERVICE}>
          <MpAdminNoticeEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'notices/:boardId',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CUSTOMER_SERVICE}>
          <MpAdminNoticeDetail />
        </MpAdminGuard>
      ),
    },
    {
      path: 'notices/:boardId/edit',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CUSTOMER_SERVICE}>
          <MpAdminNoticeEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'faqs',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CUSTOMER_SERVICE}>
          <MpAdminFaqList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'faqs/new',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CUSTOMER_SERVICE}>
          <MpAdminFaqEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'faqs/:boardId',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CUSTOMER_SERVICE}>
          <MpAdminFaqDetail />
        </MpAdminGuard>
      ),
    },
    {
      path: 'faqs/:boardId/edit',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CUSTOMER_SERVICE}>
          <MpAdminFaqEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'inquiries',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CUSTOMER_SERVICE}>
          <MpAdminInquiryList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'inquiries/:boardId',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CUSTOMER_SERVICE}>
          <MpAdminInquiryDetail />
        </MpAdminGuard>
      ),
    },
    {
      path: 'events',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTENT_MANAGEMENT}>
          <MpAdminEventList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'events/new',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTENT_MANAGEMENT}>
          <MpAdminEventEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'events/:eventId',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTENT_MANAGEMENT}>
          <MpAdminEventDetail />
        </MpAdminGuard>
      ),
    },
    {
      path: 'events/:eventId/edit',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.CONTENT_MANAGEMENT}>
          <MpAdminEventEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'banners',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.BANNER_MANAGEMENT}>
          <MpAdminBannerList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'banners/new',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.BANNER_MANAGEMENT}>
          <MpAdminBannerEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'banners/:bannerId/edit',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.BANNER_MANAGEMENT}>
          <MpAdminBannerEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'admins',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.PERMISSION_MANAGEMENT}>
          <MpAdminAdminList />
        </MpAdminGuard>
      ),
    },
    {
      path: 'admins/new',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.PERMISSION_MANAGEMENT}>
          <MpAdminAdminEdit />
        </MpAdminGuard>
      ),
    },
    {
      path: 'admins/:userId/edit',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.PERMISSION_MANAGEMENT}>
          <MpAdminAdminEdit />
        </MpAdminGuard>
      ),
    },
  ],
};

export const MpRoutes: RouteObject = {
  path: '/',
  children: [...authRoutes, adminRoute, { path: '*', element: <MaintenanceError /> }],
  errorElement: <Base64ErrorBoundary />,
};
