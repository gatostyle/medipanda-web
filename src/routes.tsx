import { lazy } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router';
import { Loadable } from './components/Loadable.tsx';

const GlobalLayout = Loadable(lazy(() => import('./layouts/GlobalLayout.tsx')));
const MyPageLayout = Loadable(lazy(() => import('./layouts/MyPageLayout.tsx')));
const CustomerServiceLayout = Loadable(lazy(() => import('./layouts/CustomerServiceLayout.tsx')));

const Home = Loadable(lazy(() => import('./pages/Home.tsx')));
const HomeNoContract = Loadable(lazy(() => import('./pages/HomeNoContract.tsx')));

const MypageGuard = Loadable(lazy(() => import('./pages/MypageGuard.tsx')));
const MypageInfo = Loadable(lazy(() => import('./pages/MypageInfo.tsx')));
const MypageNotification = Loadable(lazy(() => import('./pages/MypageNotification.tsx')));
const MypageWithdraw = Loadable(lazy(() => import('./pages/MypageWithdraw.tsx')));

const RequestContract = Loadable(lazy(() => import('./pages/RequestContract.tsx')));
const RequestContractPending = Loadable(lazy(() => import('./pages/RequestContractPending.tsx')));
const RequestContractComplete = Loadable(lazy(() => import('./pages/RequestContractComplete.tsx')));

const Products = Loadable(lazy(() => import('./pages/Products.tsx')));

const Performance = Loadable(lazy(() => import('./pages/Performance.tsx')));
const PerformanceBatch = Loadable(lazy(() => import('./pages/PerformanceBatch.tsx')));

const Dealers = Loadable(lazy(() => import('./pages/Dealers.tsx')));

const Settlements = Loadable(lazy(() => import('./pages/Settlements.tsx')));
const SettlementsCustomerDetail = Loadable(lazy(() => import('./pages/SettlementsCustomerDetail.tsx')));

const StatisticsAll = Loadable(lazy(() => import('./pages/StatisticsAll.tsx')));
const StatisticsCustomer = Loadable(lazy(() => import('./pages/StatisticsCustomer.tsx')));
const StatisticsCustomerDetail = Loadable(lazy(() => import('./pages/StatisticsCustomerDetail.tsx')));

const AnonymousList = Loadable(lazy(() => import('./pages/AnonymousList.tsx')));
const AnonymousBoardDetail = Loadable(lazy(() => import('./pages/AnonymousBoardDetail.tsx')));
const MrCsoMatchingList = Loadable(lazy(() => import('./pages/MrCsoMatchingList.tsx')));
const MrCsoMatchingCreate = Loadable(lazy(() => import('./pages/MrCsoMatchingCreate.tsx')));

const SalesAgencyProductList = Loadable(lazy(() => import('./pages/SalesAgencyProductList.tsx')));
const SalesAgencyProductDetail = Loadable(lazy(() => import('./pages/SalesAgencyProductDetail.tsx')));

const EventList = Loadable(lazy(() => import('./pages/EventList.tsx')));
const EventDetail = Loadable(lazy(() => import('./pages/EventDetail.tsx')));

const NoticeList = Loadable(lazy(() => import('./pages/NoticeList.tsx')));
const NoticeDetail = Loadable(lazy(() => import('./pages/NoticeDetail.tsx')));
const FaqList = Loadable(lazy(() => import('./pages/FaqList.tsx')));
const InquiryList = Loadable(lazy(() => import('./pages/InquiryList.tsx')));
const InquiryDetail = Loadable(lazy(() => import('./pages/InquiryDetail.tsx')));
const InquiryNew = Loadable(lazy(() => import('./pages/InquiryNew.tsx')));

const Error404 = Loadable(lazy(() => import('./pages/404.tsx')));

const route: RouteObject[] = [
  {
    path: '/',
    element: <GlobalLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'home-no-contract',
        element: <HomeNoContract />,
      },
      {
        path: 'mypage',
        element: <MyPageLayout />,
        children: [
          {
            path: 'guard',
            element: <MypageGuard />,
          },
          {
            path: 'info',
            element: <MypageInfo />,
          },
          {
            path: 'notification',
            element: <MypageNotification />,
          },
          {
            path: 'withdraw',
            element: <MypageWithdraw />,
          },
        ],
      },
      {
        path: 'request-contract',
        element: <RequestContract />,
      },
      {
        path: 'request-contract/pending',
        element: <RequestContractPending />,
      },
      {
        path: 'request-contract/complete',
        element: <RequestContractComplete />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'performance',
        element: <Performance />,
      },
      {
        path: 'performance/batch',
        element: <PerformanceBatch />,
      },
      {
        path: 'dealers',
        element: <Dealers />,
      },
      {
        path: 'settlements',
        element: <Settlements />,
      },
      {
        path: 'settlements/customer/:id',
        element: <SettlementsCustomerDetail />,
      },
      {
        path: 'statistics/all',
        element: <StatisticsAll />,
      },
      {
        path: 'statistics/customer',
        element: <StatisticsCustomer />,
      },
      {
        path: 'statistics/customer/:id',
        element: <StatisticsCustomerDetail />,
      },
      {
        path: 'community/anonymous',
        element: <AnonymousList />,
      },
      {
        path: 'community/anonymous/:id',
        element: <AnonymousBoardDetail />,
      },
      {
        path: 'community/mrcso-matching',
        element: <MrCsoMatchingList />,
      },
      {
        path: 'community/mrcso-matching/create',
        element: <MrCsoMatchingCreate />,
      },
      {
        path: 'sales-agency/products',
        element: <SalesAgencyProductList />,
      },
      {
        path: 'sales-agency/products/:id',
        element: <SalesAgencyProductDetail />,
      },
      {
        path: 'events',
        element: <EventList />,
      },
      {
        path: 'events/:id',
        element: <EventDetail />,
      },
      {
        path: 'customer-service',
        element: <CustomerServiceLayout />,
        children: [
          {
            index: true,
            element: <NoticeList />,
          },
          {
            path: 'notice',
            element: <NoticeList />,
          },
          {
            path: 'notice/:id',
            element: <NoticeDetail />,
          },
          {
            path: 'faq',
            element: <FaqList />,
          },
          {
            path: 'inquiry',
            element: <InquiryList />,
          },
          {
            path: 'inquiry/:id',
            element: <InquiryDetail />,
          },
          {
            path: 'inquiry/new',
            element: <InquiryNew />,
          },
        ],
      },
    ],
  },
  { path: '*', element: <Error404 /> },
];

export const router = createBrowserRouter(route, { basename: import.meta.env.VITE_BASE_NAME });
