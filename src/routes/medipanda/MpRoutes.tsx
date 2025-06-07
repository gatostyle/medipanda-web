import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthLayout from 'layout/Auth';

const MpLogin = Loadable(lazy(() => import('pages/medipanda/MpLogin')));

const MpMemberMain = Loadable(lazy(() => import('pages/medipanda/MpMemberMain')));
const MpMemberProductList = Loadable(lazy(() => import('pages/medipanda/MpMemberProductList')));
const MpMemberPrescriptionList = Loadable(lazy(() => import('pages/medipanda/MpMemberPrescriptionList')));
const MpMemberAdjustmentList = Loadable(lazy(() => import('pages/medipanda/MpMemberAdjustmentList')));
const MpMemberCommunity = Loadable(lazy(() => import('pages/medipanda/MpMemberCommunity')));

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
const MpAdminCustomerCenterFaqList = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerCenterFaqList')));
const MpAdminCustomerCenterFaqDetail = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerCenterFaqDetail')));
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
  element: <DashboardLayout />,
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
      element: <MpAdminMemberList />,
      index: true
    },
    {
      path: 'members',
      element: <MpAdminMemberList />
    },
    {
      path: 'members/edit',
      element: <MpAdminMemberEdit />
    },
    {
      path: 'products',
      element: <MpAdminProductList />
    },
    {
      path: 'products/:id',
      element: <MpAdminProductDetail />
    },
    {
      path: 'business-lines',
      element: <MpAdminBusinessLineList />
    },
    {
      path: 'business-lines/edit',
      element: <MpAdminBusinessLineEdit />
    },
    {
      path: 'business-lines/edit/:id',
      element: <MpAdminBusinessLineEdit />
    },
    {
      path: 'pharmaceutical/companies',
      element: <MpAdminPharmaceuticalCompanyList />
    },
    {
      path: 'pharmaceutical/companies/:id',
      element: <MpAdminPharmaceuticalCompanyDetail />
    },
    {
      path: 'pharmaceutical/products',
      element: <MpAdminPharmaceuticalProductList />
    },
    {
      path: 'pharmaceutical/products/:id',
      element: <MpAdminPharmaceuticalProductDetail />
    },
    {
      path: 'prescription/receptions',
      element: <MpAdminPrescriptionReceptionList />
    },
    {
      path: 'prescription/forms',
      element: <MpAdminPrescriptionFormList />
    },
    {
      path: 'prescription/forms/register',
      element: <MpAdminPrescriptionFormRegister />
    },
    {
      path: 'prescription/forms/products/:id',
      element: <MpAdminPrescriptionFormProducts />
    },
    {
      path: 'adjustment/approved',
      element: <MpAdminAdjustmentApprovedList />
    },
    {
      path: 'adjustment/approved/:id',
      element: <MpAdminAdjustmentApprovedDetail />
    },
    {
      path: 'adjustment/business-partner/:id',
      element: <MpAdminAdjustmentBusinessPartnerDetail />
    },
    {
      path: 'adjustment/adjustments',
      element: <MpAdminAdjustmentAdjustmentList />
    },
    {
      path: 'adjustment/stats',
      element: <MpAdminStatisticsList />
    },
    {
      path: 'settlement',
      element: <MpAdminSettlementList />
    },
    {
      path: 'settlement/:id',
      element: <MpAdminSettlementDetail />
    },
    {
      path: 'settlement/business-partner/:id',
      element: <MpAdminSettlementBusinessPartnerDetail />
    },
    {
      path: 'expenditure-reports',
      element: <MpAdminExpenditureReportList />
    },
    {
      path: 'community/members',
      element: <MpAdminCommunityMemberList />
    },
    {
      path: 'community/users',
      element: <MpAdminCommunityUserList />
    },
    {
      path: 'community/posts',
      element: <MpAdminCommunityPostList />
    },
    {
      path: 'community/posts/:id',
      element: <MpAdminCommunityPostDetail />
    },
    {
      path: 'community/comments',
      element: <MpAdminCommunityCommentList />
    },
    {
      path: 'community/blinds',
      element: <MpAdminCommunityBlindList />
    },
    {
      path: 'content-management/hospitals',
      element: <MpAdminContentManagementHospitalList />
    },
    {
      path: 'content-management/atoz',
      element: <MpAdminContentManagementAtoZList />
    },
    {
      path: 'content-management/atoz/:id',
      element: <MpAdminContentManagementAtoZDetail />
    },
    {
      path: 'content-management/atoz/edit',
      element: <MpAdminContentManagementAtoZEdit />
    },
    {
      path: 'customer-center/notices',
      element: <MpAdminCustomerCenterNoticeList />
    },
    {
      path: 'customer-center/notice/:id',
      element: <MpAdminCustomerCenterNoticeDetail />
    },
    {
      path: 'customer-center/faqs',
      element: <MpAdminCustomerCenterFaqList />
    },
    {
      path: 'customer-center/faq/:id',
      element: <MpAdminCustomerCenterFaqDetail />
    },
    {
      path: 'customer-center/inquiries',
      element: <MpAdminCustomerCenterInquiryList />
    },
    {
      path: 'banners',
      element: <MpAdminBannerList />
    },
    {
      path: 'banners/edit',
      element: <MpAdminBannerEdit />
    },
    {
      path: 'permission/admins',
      element: <MpAdminPermissionAdminList />
    },
    {
      path: 'permission/admins/edit',
      element: <MpAdminPermissionAdminEdit />
    },
    {
      path: 'permission/members',
      element: <MpAdminPermissionMember />
    },
    { path: '*', element: <MaintenanceError /> }
  ]
};

export const MpRoutes: RouteObject = {
  path: '/',
  children: [authRoute, userRoute, adminRoute, { path: '*', element: <MaintenanceError /> }]
};
