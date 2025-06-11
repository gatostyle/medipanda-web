import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthLayout from 'layout/Auth';
import { MpAdminGuard } from 'utils/route-guard/medipanda/MpAdminGuard';
import { MpMemberGuard } from 'utils/route-guard/medipanda/MpMemberGuard';
import React from 'react';

const MpLogin = Loadable(lazy(() => import('pages/medipanda/MpLogin')));

const MpMemberMain = Loadable(lazy(() => import('pages/medipanda/MpMemberMain')));
const MpMemberProductList = Loadable(lazy(() => import('pages/medipanda/MpMemberProductList')));
const MpMemberPrescriptionList = Loadable(lazy(() => import('pages/medipanda/MpMemberPrescriptionList')));
const MpMemberAdjustmentList = Loadable(lazy(() => import('pages/medipanda/MpMemberAdjustmentList')));
const MpMemberCommunity = Loadable(lazy(() => import('pages/medipanda/MpMemberCommunity')));

const MpAdminMain = Loadable(lazy(() => import('pages/medipanda/MpAdminMain')));
const MpAdminMemberList = Loadable(lazy(() => import('pages/medipanda/MpAdminMemberList')));
const MpAdminMemberEdit = Loadable(lazy(() => import('pages/medipanda/MpAdminMemberEdit')));
const MpAdminProductList = Loadable(lazy(() => import('pages/medipanda/MpAdminProductList')));
const MpAdminBusinessLineList = Loadable(lazy(() => import('pages/medipanda/MpAdminBusinessLineList')));
const MpAdminBusinessLineEdit = Loadable(lazy(() => import('pages/medipanda/MpAdminBusinessLineEdit')));
const MpAdminPharmaceuticalCompanyList = Loadable(lazy(() => import('pages/medipanda/MpAdminPharmaceuticalCompanyList')));
const MpAdminPharmaceuticalCompanyDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminPharmaceuticalCompanyDetail')));
const MpAdminPharmaceuticalProductList = Loadable(lazy(() => import('pages/medipanda/MpAdminPharmaceuticalProductList')));
const MpAdminPharmaceuticalProductDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminPharmaceuticalProductDetail')));
const MpAdminPrescriptionReceptionList = Loadable(lazy(() => import('pages/medipanda/MpAdminPrescriptionReceptionList')));
const MpAdminPrescriptionFormList = Loadable(lazy(() => import('pages/medipanda/MpAdminPrescriptionFormList')));
const MpAdminPrescriptionFormRegister = Loadable(lazy(() => import('pages/medipanda/MpAdminPrescriptionFormRegister')));
const MpAdminPrescriptionFormProducts = Loadable(lazy(() => import('pages/medipanda/MpAdminPrescriptionFormProducts')));
const MpAdminAdjustmentApprovedList = Loadable(lazy(() => import('pages/medipanda/MpAdminAdjustmentApprovedList')));
const MpAdminAdjustmentApprovedDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminAdjustmentApprovedDetail')));
const MpAdminAdjustmentBusinessPartnerDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminAdjustmentBusinessPartnerDetail')));
const MpAdminAdjustmentAdjustmentList = Loadable(lazy(() => import('pages/medipanda/MpAdminAdjustmentAdjustmentList')));
const MpAdminStatisticsList = Loadable(lazy(() => import('pages/medipanda/MpAdminStatisticsList')));
const MpAdminExpenditureReportList = Loadable(lazy(() => import('pages/medipanda/MpAdminExpenditureReportList')));
const MpAdminCommunityMemberList = Loadable(lazy(() => import('pages/medipanda/MpAdminCommunityMemberList')));
const MpAdminCommunityPostList = Loadable(lazy(() => import('pages/medipanda/MpAdminCommunityPostList')));
const MpAdminCommunityCommentList = Loadable(lazy(() => import('pages/medipanda/MpAdminCommunityCommentList')));
const MpAdminCommunityBlindList = Loadable(lazy(() => import('pages/medipanda/MpAdminCommunityBlindList')));
const MpAdminContentManagementHospitalList = Loadable(lazy(() => import('pages/medipanda/MpAdminContentManagementHospitalList')));
const MpAdminContentManagementAtoZList = Loadable(lazy(() => import('pages/medipanda/MpAdminContentManagementAtoZList')));
const MpAdminContentManagementAtoZDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminContentManagementAtoZDetail')));
const MpAdminContentManagementAtoZEdit = Loadable(lazy(() => import('pages/medipanda/MpAdminContentManagementAtoZEdit')));
const MpAdminCustomerCenterNoticeList = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerCenterNoticeList')));
const MpAdminCustomerCenterNoticeDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerCenterNoticeDetail')));
const MpAdminCustomerCenterNoticeEdit = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerCenterNoticeEdit')));
const MpAdminCustomerCenterFaqList = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerCenterFaqList')));
const MpAdminCustomerCenterFaqDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerCenterFaqDetail')));
const MpAdminCustomerCenterFaqEdit = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerCenterFaqEdit')));
const MpAdminCustomerCenterInquiryList = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerCenterInquiryList')));
const MpAdminBannerList = Loadable(lazy(() => import('pages/medipanda/MpAdminBannerList')));
const MpAdminBannerEdit = Loadable(lazy(() => import('pages/medipanda/MpAdminBannerEdit')));
const MpAdminPermissionAdminList = Loadable(lazy(() => import('pages/medipanda/MpAdminPermissionAdminList')));
const MpAdminPermissionAdminEdit = Loadable(lazy(() => import('pages/medipanda/MpAdminPermissionAdminEdit')));
const MpAdminPermissionMember = Loadable(lazy(() => import('pages/medipanda/MpAdminPermissionMember')));
const MpAdminProductDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminProductDetail')));

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));

const MpAdminSettlementList = Loadable(lazy(() => import('pages/medipanda/MpAdminSettlementList')));
const MpAdminSettlementDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminSettlementDetail')));
const MpAdminSettlementBusinessPartnerDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminSettlementBusinessPartnerDetail')));

const MpAdminCommunityUserList = Loadable(lazy(() => import('pages/medipanda/MpAdminCommunityUserList')));
const MpAdminCommunityPostDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminCommunityPostDetail')));

const authRoute: RouteObject = {
  path: '/',
  element: <AuthLayout />,
  children: [
    {
      path: 'login',
      element: <MpLogin />
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
      path: '/adjustments',
      element: <MpMemberAdjustmentList />
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
        <MpAdminGuard requiredPermission="MEMBER_MANAGEMENT">
          <MpAdminMemberList />
        </MpAdminGuard>
      )
    },
    {
      path: 'members/edit',
      element: (
        <MpAdminGuard requiredPermission="MEMBER_MANAGEMENT">
          <MpAdminMemberEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'products',
      element: (
        <MpAdminGuard requiredPermission="PRODUCT_MANAGEMENT">
          <MpAdminProductList />
        </MpAdminGuard>
      )
    },
    {
      path: 'products/:id',
      element: (
        <MpAdminGuard requiredPermission="PRODUCT_MANAGEMENT">
          <MpAdminProductDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'business-lines',
      element: (
        <MpAdminGuard requiredPermission="BUSINESS_LINE_MANAGEMENT">
          <MpAdminBusinessLineList />
        </MpAdminGuard>
      )
    },
    {
      path: 'business-lines/edit',
      element: (
        <MpAdminGuard requiredPermission="BUSINESS_LINE_MANAGEMENT">
          <MpAdminBusinessLineEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'business-lines/edit/:id',
      element: (
        <MpAdminGuard requiredPermission="BUSINESS_LINE_MANAGEMENT">
          <MpAdminBusinessLineEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'pharmaceutical/companies',
      element: (
        <MpAdminGuard requiredPermission="PHARMACEUTICAL_MANAGEMENT">
          <MpAdminPharmaceuticalCompanyList />
        </MpAdminGuard>
      )
    },
    {
      path: 'pharmaceutical/companies/:id',
      element: (
        <MpAdminGuard requiredPermission="PHARMACEUTICAL_MANAGEMENT">
          <MpAdminPharmaceuticalCompanyDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'pharmaceutical/products',
      element: (
        <MpAdminGuard requiredPermission="PHARMACEUTICAL_MANAGEMENT">
          <MpAdminPharmaceuticalProductList />
        </MpAdminGuard>
      )
    },
    {
      path: 'pharmaceutical/products/:id',
      element: (
        <MpAdminGuard requiredPermission="PHARMACEUTICAL_MANAGEMENT">
          <MpAdminPharmaceuticalProductDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'prescription/receptions',
      element: (
        <MpAdminGuard requiredPermission="PRESCRIPTION_MANAGEMENT">
          <MpAdminPrescriptionReceptionList />
        </MpAdminGuard>
      )
    },
    {
      path: 'prescription/forms',
      element: (
        <MpAdminGuard requiredPermission="PRESCRIPTION_MANAGEMENT">
          <MpAdminPrescriptionFormList />
        </MpAdminGuard>
      )
    },
    {
      path: 'prescription/forms/register',
      element: (
        <MpAdminGuard requiredPermission="PRESCRIPTION_MANAGEMENT">
          <MpAdminPrescriptionFormRegister />
        </MpAdminGuard>
      )
    },
    {
      path: 'prescription/forms/products/:id',
      element: (
        <MpAdminGuard requiredPermission="PRESCRIPTION_MANAGEMENT">
          <MpAdminPrescriptionFormProducts />
        </MpAdminGuard>
      )
    },
    {
      path: 'adjustment/approved',
      element: (
        <MpAdminGuard requiredPermission="ADJUSTMENT_MANAGEMENT">
          <MpAdminAdjustmentApprovedList />
        </MpAdminGuard>
      )
    },
    {
      path: 'adjustment/approved/:id',
      element: (
        <MpAdminGuard requiredPermission="ADJUSTMENT_MANAGEMENT">
          <MpAdminAdjustmentApprovedDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'adjustment/business-partner/:id',
      element: (
        <MpAdminGuard requiredPermission="ADJUSTMENT_MANAGEMENT">
          <MpAdminAdjustmentBusinessPartnerDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'adjustment/adjustments',
      element: (
        <MpAdminGuard requiredPermission="ADJUSTMENT_MANAGEMENT">
          <MpAdminAdjustmentAdjustmentList />
        </MpAdminGuard>
      )
    },
    {
      path: 'adjustment/stats',
      element: (
        <MpAdminGuard requiredPermission="ADJUSTMENT_MANAGEMENT">
          <MpAdminStatisticsList />
        </MpAdminGuard>
      )
    },
    {
      path: 'settlement',
      element: (
        <MpAdminGuard requiredPermission="SETTLEMENT_MANAGEMENT">
          <MpAdminSettlementList />
        </MpAdminGuard>
      )
    },
    {
      path: 'settlement/:id',
      element: (
        <MpAdminGuard requiredPermission="SETTLEMENT_MANAGEMENT">
          <MpAdminSettlementDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'settlement/business-partner/:id',
      element: (
        <MpAdminGuard requiredPermission="SETTLEMENT_MANAGEMENT">
          <MpAdminSettlementBusinessPartnerDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'expenditure-reports',
      element: (
        <MpAdminGuard requiredPermission="EXPENDITURE_MANAGEMENT">
          <MpAdminExpenditureReportList />
        </MpAdminGuard>
      )
    },
    {
      path: 'community/members',
      element: (
        <MpAdminGuard requiredPermission="COMMUNITY_MANAGEMENT">
          <MpAdminCommunityMemberList />
        </MpAdminGuard>
      )
    },
    {
      path: 'community/users',
      element: (
        <MpAdminGuard requiredPermission="COMMUNITY_MANAGEMENT">
          <MpAdminCommunityUserList />
        </MpAdminGuard>
      )
    },
    {
      path: 'community/posts',
      element: (
        <MpAdminGuard requiredPermission="COMMUNITY_MANAGEMENT">
          <MpAdminCommunityPostList />
        </MpAdminGuard>
      )
    },
    {
      path: 'community/posts/:id',
      element: (
        <MpAdminGuard requiredPermission="COMMUNITY_MANAGEMENT">
          <MpAdminCommunityPostDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'community/comments',
      element: (
        <MpAdminGuard requiredPermission="COMMUNITY_MANAGEMENT">
          <MpAdminCommunityCommentList />
        </MpAdminGuard>
      )
    },
    {
      path: 'community/blinds',
      element: (
        <MpAdminGuard requiredPermission="COMMUNITY_MANAGEMENT">
          <MpAdminCommunityBlindList />
        </MpAdminGuard>
      )
    },
    {
      path: 'content-management/hospitals',
      element: (
        <MpAdminGuard requiredPermission="CONTENT_MANAGEMENT">
          <MpAdminContentManagementHospitalList />
        </MpAdminGuard>
      )
    },
    {
      path: 'content-management/atoz',
      element: (
        <MpAdminGuard requiredPermission="CONTENT_MANAGEMENT">
          <MpAdminContentManagementAtoZList />
        </MpAdminGuard>
      )
    },
    {
      path: 'content-management/atoz/:id',
      element: (
        <MpAdminGuard requiredPermission="CONTENT_MANAGEMENT">
          <MpAdminContentManagementAtoZDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'content-management/atoz/new',
      element: (
        <MpAdminGuard requiredPermission="CONTENT_MANAGEMENT">
          <MpAdminContentManagementAtoZEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'content-management/atoz/edit/:id',
      element: (
        <MpAdminGuard requiredPermission="CONTENT_MANAGEMENT">
          <MpAdminContentManagementAtoZEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'customer-center/notices',
      element: (
        <MpAdminGuard requiredPermission="CUSTOMER_CENTER_MANAGEMENT">
          <MpAdminCustomerCenterNoticeList />
        </MpAdminGuard>
      )
    },
    {
      path: 'customer-center/notice/:id',
      element: (
        <MpAdminGuard requiredPermission="CUSTOMER_CENTER_MANAGEMENT">
          <MpAdminCustomerCenterNoticeDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'customer-center/notice/new',
      element: (
        <MpAdminGuard requiredPermission="CUSTOMER_CENTER_MANAGEMENT">
          <MpAdminCustomerCenterNoticeEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'customer-center/notice/edit/:id',
      element: (
        <MpAdminGuard requiredPermission="CUSTOMER_CENTER_MANAGEMENT">
          <MpAdminCustomerCenterNoticeEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'customer-center/faqs',
      element: (
        <MpAdminGuard requiredPermission="CUSTOMER_CENTER_MANAGEMENT">
          <MpAdminCustomerCenterFaqList />
        </MpAdminGuard>
      )
    },
    {
      path: 'customer-center/faq/:id',
      element: (
        <MpAdminGuard requiredPermission="CUSTOMER_CENTER_MANAGEMENT">
          <MpAdminCustomerCenterFaqDetail />
        </MpAdminGuard>
      )
    },
    {
      path: 'customer-center/faq/new',
      element: (
        <MpAdminGuard requiredPermission="CUSTOMER_CENTER_MANAGEMENT">
          <MpAdminCustomerCenterFaqEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'customer-center/faq/edit/:id',
      element: (
        <MpAdminGuard requiredPermission="CUSTOMER_CENTER_MANAGEMENT">
          <MpAdminCustomerCenterFaqEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'customer-center/inquiries',
      element: (
        <MpAdminGuard requiredPermission="CUSTOMER_CENTER_MANAGEMENT">
          <MpAdminCustomerCenterInquiryList />
        </MpAdminGuard>
      )
    },
    {
      path: 'banners',
      element: (
        <MpAdminGuard requiredPermission="BANNER_MANAGEMENT">
          <MpAdminBannerList />
        </MpAdminGuard>
      )
    },
    {
      path: 'banners/edit',
      element: (
        <MpAdminGuard requiredPermission="BANNER_MANAGEMENT">
          <MpAdminBannerEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'permission/admins',
      element: (
        <MpAdminGuard requiredPermission="PERMISSION_ADMIN_MANAGEMENT">
          <MpAdminPermissionAdminList />
        </MpAdminGuard>
      )
    },
    {
      path: 'permission/admins/edit',
      element: (
        <MpAdminGuard requiredPermission="PERMISSION_ADMIN_MANAGEMENT">
          <MpAdminPermissionAdminEdit />
        </MpAdminGuard>
      )
    },
    {
      path: 'permission/members',
      element: (
        <MpAdminGuard requiredPermission="PERMISSION_MEMBER_MANAGEMENT">
          <MpAdminPermissionMember />
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
