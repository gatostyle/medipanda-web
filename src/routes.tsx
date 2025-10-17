import { AdminPermission } from '@/backend';
import { Base64ErrorBoundary } from '@/lib/components/Base64ErrorBoundary';
import { FixedLinearProgress } from '@/lib/components/FixedLinearProgress';
import { MpAdminGuard, MpGuestGuard } from './guards';
import { type ElementType, lazy, Suspense } from 'react';
import { Outlet, Navigate, type RouteObject } from 'react-router-dom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any,react/display-name
const Loadable = (Component: ElementType) => (props: any) => (
  <Suspense fallback={<FixedLinearProgress />}>
    <Component {...props} />
  </Suspense>
);

const DashboardLayout = Loadable(lazy(() => import('./layouts/DashboardLayout')));

const MpLogin = Loadable(lazy(() => import('@/pages/MpLogin')));
const MpLogout = Loadable(lazy(() => import('@/pages/MpLogout')));

const MpAdminMain = Loadable(lazy(() => import('@/pages/MpAdminMain')));
const MpAdminMemberList = Loadable(lazy(() => import('@/pages/MpAdminMemberList')));
const MpAdminMemberEdit = Loadable(lazy(() => import('@/pages/MpAdminMemberEdit')));
const MpAdminSalesAgencyProductList = Loadable(lazy(() => import('@/pages/MpAdminSalesAgencyProductList')));
const MpAdminSalesAgencyProductDetail = Loadable(lazy(() => import('@/pages/MpAdminSalesAgencyProductDetail')));
const MpAdminSalesAgencyProductEdit = Loadable(lazy(() => import('@/pages/MpAdminSalesAgencyProductEdit')));
const MpAdminPartnerList = Loadable(lazy(() => import('@/pages/MpAdminPartnerList')));
const MpAdminPartnerEdit = Loadable(lazy(() => import('@/pages/MpAdminPartnerEdit')));
const MpAdminProductList = Loadable(lazy(() => import('@/pages/MpAdminProductList')));
const MpAdminProductDetail = Loadable(lazy(() => import('@/pages/MpAdminProductDetail')));
const MpAdminProductEdit = Loadable(lazy(() => import('@/pages/MpAdminProductEdit')));
const MpAdminPrescriptionReceptionList = Loadable(lazy(() => import('@/pages/MpAdminPrescriptionReceptionList')));
const MpAdminPrescriptionFormList = Loadable(lazy(() => import('@/pages/MpAdminPrescriptionFormList')));
const MpAdminPrescriptionFormEdit = Loadable(lazy(() => import('@/pages/MpAdminPrescriptionFormEdit')));
const MpAdminSettlementPartnerDetail = Loadable(lazy(() => import('@/pages/MpAdminSettlementPartnerDetail')));
const MpAdminSettlementList = Loadable(lazy(() => import('@/pages/MpAdminSettlementList')));
const MpAdminSettlementDetail = Loadable(lazy(() => import('@/pages/MpAdminSettlementDetail')));
const MpAdminStatisticsList = Loadable(lazy(() => import('@/pages/MpAdminStatisticsList')));
const MpAdminExpenseReportList = Loadable(lazy(() => import('@/pages/MpAdminExpenseReportList')));
const MpAdminCommunityPostList = Loadable(lazy(() => import('@/pages/MpAdminCommunityPostList')));
const MpAdminCommunityCommentList = Loadable(lazy(() => import('@/pages/MpAdminCommunityCommentList')));
const MpAdminCommunityBlindList = Loadable(lazy(() => import('@/pages/MpAdminCommunityBlindList')));
const MpAdminHospitalList = Loadable(lazy(() => import('@/pages/MpAdminHospitalList')));
const MpAdminAtoZList = Loadable(lazy(() => import('@/pages/MpAdminAtoZList')));
const MpAdminAtoZDetail = Loadable(lazy(() => import('@/pages/MpAdminAtoZDetail')));
const MpAdminAtoZEdit = Loadable(lazy(() => import('@/pages/MpAdminAtoZEdit')));
const MpAdminNoticeList = Loadable(lazy(() => import('@/pages/MpAdminNoticeList')));
const MpAdminNoticeDetail = Loadable(lazy(() => import('@/pages/MpAdminNoticeDetail')));
const MpAdminNoticeEdit = Loadable(lazy(() => import('@/pages/MpAdminNoticeEdit')));
const MpAdminFaqList = Loadable(lazy(() => import('@/pages/MpAdminFaqList')));
const MpAdminFaqDetail = Loadable(lazy(() => import('@/pages/MpAdminFaqDetail')));
const MpAdminFaqEdit = Loadable(lazy(() => import('@/pages/MpAdminFaqEdit')));
const MpAdminInquiryList = Loadable(lazy(() => import('@/pages/MpAdminInquiryList')));
const MpAdminInquiryDetail = Loadable(lazy(() => import('@/pages/MpAdminInquiryDetail')));
const MpAdminBannerList = Loadable(lazy(() => import('@/pages/MpAdminBannerList')));
const MpAdminBannerEdit = Loadable(lazy(() => import('@/pages/MpAdminBannerEdit')));
const MpAdminAdminList = Loadable(lazy(() => import('@/pages/MpAdminAdminList')));
const MpAdminAdminEdit = Loadable(lazy(() => import('@/pages/MpAdminAdminEdit')));
const MpAdminEventList = Loadable(lazy(() => import('@/pages/MpAdminEventList')));
const MpAdminEventDetail = Loadable(lazy(() => import('@/pages/MpAdminEventDetail')));
const MpAdminEventEdit = Loadable(lazy(() => import('@/pages/MpAdminEventEdit')));

const Error404 = Loadable(lazy(() => import('@/pages/Error404')));

const MpAdminCommunityUserList = Loadable(lazy(() => import('@/pages/MpAdminCommunityUserList')));
const MpAdminCommunityPostDetail = Loadable(lazy(() => import('@/pages/MpAdminCommunityPostDetail')));

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
      path: 'prescription-forms/:prescriptionPartnerId/edit',
      element: (
        <MpAdminGuard requiredPermission={AdminPermission.PRESCRIPTION_MANAGEMENT}>
          <MpAdminPrescriptionFormEdit />
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

export const routes: RouteObject = {
  path: '/',
  children: [...authRoutes, adminRoute, { path: '*', element: <Error404 /> }],
  errorElement: <Base64ErrorBoundary />,
};
