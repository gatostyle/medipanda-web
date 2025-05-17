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
const MpAdminProductList = Loadable(lazy(() => import('pages/medipanda/MpAdminProductList')));
const MpAdminBusinessLineList = Loadable(lazy(() => import('pages/medipanda/MpAdminBusinessLineList')));
const MpAdminPharmaceuticalCompanyList = Loadable(lazy(() => import('pages/medipanda/MpAdminPharmaceuticalCompanyList')));
const MpAdminPharmaceuticalProductList = Loadable(lazy(() => import('pages/medipanda/MpAdminPharmaceuticalProductList')));
const MpAdminPrescriptionReceptionList = Loadable(lazy(() => import('pages/medipanda/MpAdminPrescriptionReceptionList')));
const MpAdminPrescriptionFormList = Loadable(lazy(() => import('pages/medipanda/MpAdminPrescriptionFormList')));
const MpAdminAdjustmentApprovedList = Loadable(lazy(() => import('pages/medipanda/MpAdminAdjustmentApprovedList')));
const MpAdminAdjustmentAdjustmentList = Loadable(lazy(() => import('pages/medipanda/MpAdminAdjustmentAdjustmentList')));
const MpAdminAdjustmentStats = Loadable(lazy(() => import('pages/medipanda/MpAdminAdjustmentStats')));
const MpAdminExpenditureReportList = Loadable(lazy(() => import('pages/medipanda/MpAdminExpenditureReportList')));
const MpAdminCommunityMemberList = Loadable(lazy(() => import('pages/medipanda/MpAdminCommunityMemberList')));
const MpAdminCommunityPostList = Loadable(lazy(() => import('pages/medipanda/MpAdminCommunityPostList')));
const MpAdminCommunityCommentList = Loadable(lazy(() => import('pages/medipanda/MpAdminCommunityCommentList')));
const MpAdminCommunityBlindList = Loadable(lazy(() => import('pages/medipanda/MpAdminCommunityBlindList')));
const MpAdminContentManagementHospitalList = Loadable(lazy(() => import('pages/medipanda/MpAdminContentManagementHospitalList')));
const MpAdminContentManagementAtoZList = Loadable(lazy(() => import('pages/medipanda/MpAdminContentManagementAtoZList')));
const MpAdminCustomerServiceNoticeList = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerServiceNoticeList')));
const MpAdminCustomerServiceFaqList = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerServiceFaqList')));
const MpAdminCustomerServiceInquiryList = Loadable(lazy(() => import('pages/medipanda/MpAdminCustomerServiceInquiryList')));
const MpAdminBannerList = Loadable(lazy(() => import('pages/medipanda/MpAdminBannerList')));
const MpAdminPermissionAdminList = Loadable(lazy(() => import('pages/medipanda/MpAdminPermissionAdminList')));
const MpAdminPermissionMemberList = Loadable(lazy(() => import('pages/medipanda/MpAdminPermissionMemberList')));

const MaintenanceError = Loadable(lazy(() => import('pages/maintenance/error/404')));

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
      path: 'products',
      element: <MpAdminProductList />
    },
    {
      path: 'business-lines',
      element: <MpAdminBusinessLineList />
    },
    {
      path: 'pharmaceutical/companies',
      element: <MpAdminPharmaceuticalCompanyList />
    },
    {
      path: 'pharmaceutical/products',
      element: <MpAdminPharmaceuticalProductList />
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
      path: 'adjustment/approved',
      element: <MpAdminAdjustmentApprovedList />
    },
    {
      path: 'adjustment/adjustments',
      element: <MpAdminAdjustmentAdjustmentList />
    },
    {
      path: 'adjustment/stats',
      element: <MpAdminAdjustmentStats />
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
      path: 'community/posts',
      element: <MpAdminCommunityPostList />
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
      path: 'customer-service/notices',
      element: <MpAdminCustomerServiceNoticeList />
    },
    {
      path: 'customer-service/faqs',
      element: <MpAdminCustomerServiceFaqList />
    },
    {
      path: 'customer-service/inquiries',
      element: <MpAdminCustomerServiceInquiryList />
    },
    {
      path: 'banners',
      element: <MpAdminBannerList />
    },
    {
      path: 'permission/admins',
      element: <MpAdminPermissionAdminList />
    },
    {
      path: 'permission/members',
      element: <MpAdminPermissionMemberList />
    },
    { path: '*', element: <MaintenanceError /> }
  ]
};

export const MpRoutes: RouteObject = {
  path: '/',
  children: [authRoute, userRoute, adminRoute, { path: '*', element: <MaintenanceError /> }]
};
