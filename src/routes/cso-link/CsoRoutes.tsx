import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthLayout from 'layout/Auth';

const CsoLogin = Loadable(lazy(() => import('pages/cso-link/CsoLogin')));

const CsoMemberMain = Loadable(lazy(() => import('pages/cso-link/CsoMemberMain')));
const CsoMemberProductList = Loadable(lazy(() => import('pages/cso-link/CsoMemberProductList')));
const CsoMemberPrescriptionList = Loadable(lazy(() => import('pages/cso-link/CsoMemberPrescriptionList')));
const CsoMemberAdjustmentList = Loadable(lazy(() => import('pages/cso-link/CsoMemberAdjustmentList')));
const CsoMemberCommunity = Loadable(lazy(() => import('pages/cso-link/CsoMemberCommunity')));

const CsoAdminMemberList = Loadable(lazy(() => import('pages/cso-link/CsoAdminMemberList')));
const CsoAdminProductList = Loadable(lazy(() => import('pages/cso-link/CsoAdminProductList')));
const CsoAdminBusinessLineList = Loadable(lazy(() => import('pages/cso-link/CsoAdminBusinessLineList')));
const CsoAdminPharmaceuticalCompanyList = Loadable(lazy(() => import('pages/cso-link/CsoAdminPharmaceuticalCompanyList')));
const CsoAdminPharmaceuticalProductList = Loadable(lazy(() => import('pages/cso-link/CsoAdminPharmaceuticalProductList')));
const CsoAdminPrescriptionReceptionList = Loadable(lazy(() => import('pages/cso-link/CsoAdminPrescriptionReceptionList')));
const CsoAdminPrescriptionFormList = Loadable(lazy(() => import('pages/cso-link/CsoAdminPrescriptionFormList')));
const CsoAdminAdjustmentApprovedList = Loadable(lazy(() => import('pages/cso-link/CsoAdminAdjustmentApprovedList')));
const CsoAdminAdjustmentAdjustmentList = Loadable(lazy(() => import('pages/cso-link/CsoAdminAdjustmentAdjustmentList')));
const CsoAdminAdjustmentStats = Loadable(lazy(() => import('pages/cso-link/CsoAdminAdjustmentStats')));
const CsoAdminExpenditureReportList = Loadable(lazy(() => import('pages/cso-link/CsoAdminExpenditureReportList')));
const CsoAdminCommunityMemberList = Loadable(lazy(() => import('pages/cso-link/CsoAdminCommunityMemberList')));
const CsoAdminCommunityPostList = Loadable(lazy(() => import('pages/cso-link/CsoAdminCommunityPostList')));
const CsoAdminCommunityCommentList = Loadable(lazy(() => import('pages/cso-link/CsoAdminCommunityCommentList')));
const CsoAdminCommunityBlindList = Loadable(lazy(() => import('pages/cso-link/CsoAdminCommunityBlindList')));
const CsoAdminContentManagementHospitalList = Loadable(lazy(() => import('pages/cso-link/CsoAdminContentManagementHospitalList')));
const CsoAdminContentManagementAtoZList = Loadable(lazy(() => import('pages/cso-link/CsoAdminContentManagementAtoZList')));
const CsoAdminCustomerServiceNoticeList = Loadable(lazy(() => import('pages/cso-link/CsoAdminCustomerServiceNoticeList')));
const CsoAdminCustomerServiceFaqList = Loadable(lazy(() => import('pages/cso-link/CsoAdminCustomerServiceFaqList')));
const CsoAdminCustomerServiceInquiryList = Loadable(lazy(() => import('pages/cso-link/CsoAdminCustomerServiceInquiryList')));
const CsoAdminBannerList = Loadable(lazy(() => import('pages/cso-link/CsoAdminBannerList')));
const CsoAdminPermissionAdminList = Loadable(lazy(() => import('pages/cso-link/CsoAdminPermissionAdminList')));
const CsoAdminPermissionMemberList = Loadable(lazy(() => import('pages/cso-link/CsoAdminPermissionMemberList')));

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));

const authRoute: RouteObject = {
  path: '/',
  element: <AuthLayout />,
  children: [
    {
      path: 'login',
      element: <CsoLogin />
    }
  ]
};
const userRoute: RouteObject = {
  path: '/',
  element: <DashboardLayout />,
  children: [
    {
      element: <CsoMemberMain />,
      index: true
    },
    {
      path: '/products',
      element: <CsoMemberProductList />
    },
    {
      path: '/prescriptions',
      element: <CsoMemberPrescriptionList />
    },
    {
      path: '/adjustments',
      element: <CsoMemberAdjustmentList />
    },
    {
      path: '/community',
      element: <CsoMemberCommunity />
    }
  ]
};

const adminRoute: RouteObject = {
  path: 'admin',
  element: <DashboardLayout />,
  children: [
    {
      element: <CsoAdminMemberList />,
      index: true
    },
    {
      path: 'products',
      element: <CsoAdminProductList />
    },
    {
      path: 'business-lines',
      element: <CsoAdminBusinessLineList />
    },
    {
      path: 'pharmaceutical/companies',
      element: <CsoAdminPharmaceuticalCompanyList />
    },
    {
      path: 'pharmaceutical/products',
      element: <CsoAdminPharmaceuticalProductList />
    },
    {
      path: 'prescription/receptions',
      element: <CsoAdminPrescriptionReceptionList />
    },
    {
      path: 'prescription/forms',
      element: <CsoAdminPrescriptionFormList />
    },
    {
      path: 'adjustment/approved',
      element: <CsoAdminAdjustmentApprovedList />
    },
    {
      path: 'adjustment/adjustments',
      element: <CsoAdminAdjustmentAdjustmentList />
    },
    {
      path: 'adjustment/stats',
      element: <CsoAdminAdjustmentStats />
    },
    {
      path: 'expenditure-reports',
      element: <CsoAdminExpenditureReportList />
    },
    {
      path: 'community/members',
      element: <CsoAdminCommunityMemberList />
    },
    {
      path: 'community/posts',
      element: <CsoAdminCommunityPostList />
    },
    {
      path: 'community/comments',
      element: <CsoAdminCommunityCommentList />
    },
    {
      path: 'community/blinds',
      element: <CsoAdminCommunityBlindList />
    },
    {
      path: 'content-management/hospitals',
      element: <CsoAdminContentManagementHospitalList />
    },
    {
      path: 'content-management/atoz',
      element: <CsoAdminContentManagementAtoZList />
    },
    {
      path: 'customer-service/notices',
      element: <CsoAdminCustomerServiceNoticeList />
    },
    {
      path: 'customer-service/faqs',
      element: <CsoAdminCustomerServiceFaqList />
    },
    {
      path: 'customer-service/inquiries',
      element: <CsoAdminCustomerServiceInquiryList />
    },
    {
      path: 'banners',
      element: <CsoAdminBannerList />
    },
    {
      path: 'permission/admins',
      element: <CsoAdminPermissionAdminList />
    },
    {
      path: 'permission/members',
      element: <CsoAdminPermissionMemberList />
    },
    { path: '*', element: <MaintenanceError /> }
  ]
};

export const CsoRoutes: RouteObject = {
  path: '/',
  children: [authRoute, userRoute, adminRoute, { path: '*', element: <MaintenanceError /> }]
};
