import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthLayout from 'layout/Auth';
import { MpAdminGuard } from 'medipanda/utils/route-guard/MpAdminGuard';
import { MpMemberGuard } from 'medipanda/utils/route-guard/MpMemberGuard';
import React from 'react';

const MpLogin = Loadable(lazy(() => import('medipanda/pages/MpLogin')));
const MpLogout = Loadable(lazy(() => import('medipanda/pages/MpLogout')));

const MpMemberMain = Loadable(lazy(() => import('medipanda/pages/MpMemberMain')));
const MpMemberProductList = Loadable(lazy(() => import('medipanda/pages/MpMemberProductList')));
const MpMemberPrescriptionList = Loadable(lazy(() => import('medipanda/pages/MpMemberPrescriptionList')));
const MpMemberSettlementList = Loadable(lazy(() => import('medipanda/pages/MpMemberSettlementList')));
const MpMemberCommunity = Loadable(lazy(() => import('medipanda/pages/MpMemberCommunity')));

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
const MpAdminSettlementBusinessPartnerDetail = Loadable(lazy(() => import('medipanda/pages/MpAdminSettlementBusinessPartnerDetail')));
const MpAdminSettlementList = Loadable(lazy(() => import('medipanda/pages/MpAdminSettlementList')));
const MpAdminSettlementEdit = Loadable(lazy(() => import('medipanda/pages/MpAdminSettlementEdit')));
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
const MpAdminInquiryDetail = Loadable(lazy(() => import('medipanda/pages/MpAdminInquiryDetail')));
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

const authRoute: RouteObject = {
  path: '/',
  element: <AuthLayout />,
  children: [
    {
      path: 'login',
      element: <MpLogin />
    },
    {
      path: 'logout',
      element: <MpLogout />
    }
  ]
};

const userRoute: RouteObject = {
  path: '/',
  element: (
    <MpMemberGuard>
      <DashboardLayout />
    </MpMemberGuard>
  ),
  children: [
    {
      element: <MpMemberMain />,
      index: true
    },
    {
      path: '/products',
      element: <MpMemberProductList />
    },
    {
      path: '/prescriptions',
      element: <MpMemberPrescriptionList />
    },
    {
      path: '/settlements',
      element: <MpMemberSettlementList />
    },
    {
      path: '/community',
      element: <MpMemberCommunity />
    }
  ]
};

const adminRoute: RouteObject = {
  path: 'admin',
  element: <DashboardLayout />,
  children: [
    {
      element: <MpAdminMain />,
      index: true
    },
    {
      path: 'members',
      element: (
        <MpAdminGuard requiredPermission={'MEMBER_MANAGEMENT'}>
          <MpAdminMemberList />
        </MpAdminGuard>
      )
    },
    {
      path: 'members/new',
      element: (
        <MpAdminGuard requiredPermission={'MEMBER_MANAGEMENT'}>
          <MpAdminMemberEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'members/:userId/edit',
      element: (
        <MpAdminGuard requiredPermission={'MEMBER_MANAGEMENT'}>
          <MpAdminMemberEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'sales-agency-products',
      element: (
        <MpAdminGuard requiredPermission={'CONTRACT_MANAGEMENT'}>
          <MpAdminSalesAgencyProductList />
        </MpAdminGuard>
      )
    },
    {
      path: 'sales-agency-products/new',
      element: (
        <MpAdminGuard requiredPermission={'CONTRACT_MANAGEMENT'}>
          <MpAdminSalesAgencyProductEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'sales-agency-products/:id/edit',
      element: (
        <MpAdminGuard requiredPermission={'CONTRACT_MANAGEMENT'}>
          <MpAdminSalesAgencyProductEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'sales-agency-products/:id',
      element: (
        <MpAdminGuard requiredPermission={'CONTRACT_MANAGEMENT'}>
          <MpAdminSalesAgencyProductDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'partners',
      element: (
        <MpAdminGuard requiredPermission={'TRANSACTION_MANAGEMENT'}>
          <MpAdminPartnerList />
        </MpAdminGuard>
      )
    },
    {
      path: 'partners/new',
      element: (
        <MpAdminGuard requiredPermission={'TRANSACTION_MANAGEMENT'}>
          <MpAdminPartnerEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'partners/:id/edit',
      element: (
        <MpAdminGuard requiredPermission={'TRANSACTION_MANAGEMENT'}>
          <MpAdminPartnerEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'products',
      element: (
        <MpAdminGuard requiredPermission={'PRODUCT_MANAGEMENT'}>
          <MpAdminProductList />
        </MpAdminGuard>
      )
    },
    {
      path: 'products/new',
      element: (
        <MpAdminGuard requiredPermission={'PRODUCT_MANAGEMENT'}>
          <MpAdminProductEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'products/:id/edit',
      element: (
        <MpAdminGuard requiredPermission={'PRODUCT_MANAGEMENT'}>
          <MpAdminProductEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'products/:id',
      element: (
        <MpAdminGuard requiredPermission={'PRODUCT_MANAGEMENT'}>
          <MpAdminProductDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'prescription-receptions',
      element: (
        <MpAdminGuard requiredPermission={'PRESCRIPTION_MANAGEMENT'}>
          <MpAdminPrescriptionReceptionList />
        </MpAdminGuard>
      )
    },
    {
      path: 'prescription-forms',
      element: (
        <MpAdminGuard requiredPermission={'PRESCRIPTION_MANAGEMENT'}>
          <MpAdminPrescriptionFormList />
        </MpAdminGuard>
      )
    },
    {
      path: 'prescription-forms/new',
      element: (
        <MpAdminGuard requiredPermission={'PRESCRIPTION_MANAGEMENT'}>
          <MpAdminPrescriptionFormProducts />
        </MpAdminGuard>
      )
    },
    {
      path: 'prescription-forms/:id/products',
      element: (
        <MpAdminGuard requiredPermission={'PRESCRIPTION_MANAGEMENT'}>
          <MpAdminPrescriptionFormProducts />
        </MpAdminGuard>
      )
    },
    {
      path: 'settlements',
      element: (
        <MpAdminGuard requiredPermission={'SETTLEMENT_MANAGEMENT'}>
          <MpAdminSettlementList />
        </MpAdminGuard>
      )
    },
    {
      path: 'settlements/new',
      element: (
        <MpAdminGuard requiredPermission={'SETTLEMENT_MANAGEMENT'}>
          <MpAdminSettlementEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'settlements/:id',
      element: (
        <MpAdminGuard requiredPermission={'SETTLEMENT_MANAGEMENT'}>
          <MpAdminSettlementEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'settlements/business-partners/:id',
      element: (
        <MpAdminGuard requiredPermission={'SETTLEMENT_MANAGEMENT'}>
          <MpAdminSettlementBusinessPartnerDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'settlement-statistics',
      element: (
        <MpAdminGuard requiredPermission={'SETTLEMENT_MANAGEMENT'}>
          <MpAdminStatisticsList />
        </MpAdminGuard>
      )
    },
    {
      path: 'expense-reports',
      element: (
        <MpAdminGuard requiredPermission={'EXPENSE_REPORT_MANAGEMENT'}>
          <MpAdminExpenseReportList />
        </MpAdminGuard>
      )
    },
    {
      path: 'community-users',
      element: (
        <MpAdminGuard requiredPermission={'COMMUNITY_MANAGEMENT'}>
          <MpAdminCommunityUserList />
        </MpAdminGuard>
      )
    },
    {
      path: 'community-posts',
      element: (
        <MpAdminGuard requiredPermission={'COMMUNITY_MANAGEMENT'}>
          <MpAdminCommunityPostList />
        </MpAdminGuard>
      )
    },
    {
      path: 'community-posts/:id',
      element: (
        <MpAdminGuard requiredPermission={'COMMUNITY_MANAGEMENT'}>
          <MpAdminCommunityPostDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'community-comments',
      element: (
        <MpAdminGuard requiredPermission={'COMMUNITY_MANAGEMENT'}>
          <MpAdminCommunityCommentList />
        </MpAdminGuard>
      )
    },
    {
      path: 'community-blinds',
      element: (
        <MpAdminGuard requiredPermission={'COMMUNITY_MANAGEMENT'}>
          <MpAdminCommunityBlindList />
        </MpAdminGuard>
      )
    },
    {
      path: 'hospitals',
      element: (
        <MpAdminGuard requiredPermission={'CONTENT_MANAGEMENT'}>
          <MpAdminHospitalList />
        </MpAdminGuard>
      )
    },
    {
      path: 'atoz',
      element: (
        <MpAdminGuard requiredPermission={'CONTENT_MANAGEMENT'}>
          <MpAdminAtoZList />
        </MpAdminGuard>
      )
    },
    {
      path: 'atoz/new',
      element: (
        <MpAdminGuard requiredPermission={'CONTENT_MANAGEMENT'}>
          <MpAdminAtoZEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'atoz/:id/edit',
      element: (
        <MpAdminGuard requiredPermission={'CONTENT_MANAGEMENT'}>
          <MpAdminAtoZEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'atoz/:id',
      element: (
        <MpAdminGuard requiredPermission={'CONTENT_MANAGEMENT'}>
          <MpAdminAtoZDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'notices',
      element: (
        <MpAdminGuard requiredPermission={'CUSTOMER_SERVICE'}>
          <MpAdminNoticeList />
        </MpAdminGuard>
      )
    },
    {
      path: 'notices/new',
      element: (
        <MpAdminGuard requiredPermission={'CUSTOMER_SERVICE'}>
          <MpAdminNoticeEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'notices/:id/edit',
      element: (
        <MpAdminGuard requiredPermission={'CUSTOMER_SERVICE'}>
          <MpAdminNoticeEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'notices/:id',
      element: (
        <MpAdminGuard requiredPermission={'CUSTOMER_SERVICE'}>
          <MpAdminNoticeDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'faqs',
      element: (
        <MpAdminGuard requiredPermission={'CUSTOMER_SERVICE'}>
          <MpAdminFaqList />
        </MpAdminGuard>
      )
    },
    {
      path: 'faqs/new',
      element: (
        <MpAdminGuard requiredPermission={'CUSTOMER_SERVICE'}>
          <MpAdminFaqEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'faqs/:id/edit',
      element: (
        <MpAdminGuard requiredPermission={'CUSTOMER_SERVICE'}>
          <MpAdminFaqEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'faqs/:id',
      element: (
        <MpAdminGuard requiredPermission={'CUSTOMER_SERVICE'}>
          <MpAdminFaqDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'inquiries',
      element: (
        <MpAdminGuard requiredPermission={'CUSTOMER_SERVICE'}>
          <MpAdminInquiryList />
        </MpAdminGuard>
      )
    },
    {
      path: 'inquiries/:id',
      element: (
        <MpAdminGuard requiredPermission={'CUSTOMER_SERVICE'}>
          <MpAdminInquiryDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'events',
      element: (
        <MpAdminGuard requiredPermission={'CONTENT_MANAGEMENT'}>
          <MpAdminEventList />
        </MpAdminGuard>
      )
    },
    {
      path: 'events/new',
      element: (
        <MpAdminGuard requiredPermission={'CONTENT_MANAGEMENT'}>
          <MpAdminEventEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'events/:id/edit',
      element: (
        <MpAdminGuard requiredPermission={'CONTENT_MANAGEMENT'}>
          <MpAdminEventEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'events/:id',
      element: (
        <MpAdminGuard requiredPermission={'CONTENT_MANAGEMENT'}>
          <MpAdminEventDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'banners',
      element: (
        <MpAdminGuard requiredPermission={'BANNER_MANAGEMENT'}>
          <MpAdminBannerList />
        </MpAdminGuard>
      )
    },
    {
      path: 'banners/new',
      element: (
        <MpAdminGuard requiredPermission={'BANNER_MANAGEMENT'}>
          <MpAdminBannerEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'banners/:id/edit',
      element: (
        <MpAdminGuard requiredPermission={'BANNER_MANAGEMENT'}>
          <MpAdminBannerEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'admins',
      element: (
        <MpAdminGuard requiredPermission={'PERMISSION_MANAGEMENT'}>
          <MpAdminAdminList />
        </MpAdminGuard>
      )
    },
    {
      path: 'admins/new',
      element: (
        <MpAdminGuard requiredPermission={'PERMISSION_MANAGEMENT'}>
          <MpAdminAdminEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'admins/:userId/edit',
      element: (
        <MpAdminGuard requiredPermission={'PERMISSION_MANAGEMENT'}>
          <MpAdminAdminEdit />
        </MpAdminGuard>
      )
    },
    { path: '*', element: <MaintenanceError /> }
  ]
};

export const MpRoutes: RouteObject = {
  path: '/',
  children: [authRoute, userRoute, adminRoute, { path: '*', element: <MaintenanceError /> }]
};
