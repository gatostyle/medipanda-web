import { lazy } from 'react';
import { createBrowserRouter, type RouteObject, Navigate } from 'react-router';
import { Loadable } from './components/Loadable';

const GlobalLayout = Loadable(lazy(() => import('./layouts/GlobalLayout')));
const TabbedLayout = Loadable(lazy(() => import('./layouts/TabbedLayout')));
const SidebarLayout = Loadable(lazy(() => import('./layouts/SidebarLayout')));

const Login = Loadable(lazy(() => import('./pages/Login')));
const Logout = Loadable(lazy(() => import('./pages/Logout')));

const Home = Loadable(lazy(() => import('./pages/Home')));

const ProductList = Loadable(lazy(() => import('./pages/ProductList')));

const PrescriptionList = Loadable(lazy(() => import('./pages/PrescriptionList')));
const DealerList = Loadable(lazy(() => import('./pages/DealerList')));

const SettlementList = Loadable(lazy(() => import('./pages/./SettlementList')));
const SalesStatistic = Loadable(lazy(() => import('./pages/SalesStatistic')));

const AnonymousList = Loadable(lazy(() => import('./pages/AnonymousList')));
const AnonymousBoardDetail = Loadable(lazy(() => import('./pages/AnonymousBoardDetail')));
const MrCsoMatchingList = Loadable(lazy(() => import('./pages/MrCsoMatchingList')));
const MrCsoMatchingNew = Loadable(lazy(() => import('./pages/./MrCsoMatchingNew')));

const SalesAgencyProductList = Loadable(lazy(() => import('./pages/SalesAgencyProductList')));
const SalesAgencyProductDetail = Loadable(lazy(() => import('./pages/SalesAgencyProductDetail')));

const EventList = Loadable(lazy(() => import('./pages/EventList')));
const EventDetail = Loadable(lazy(() => import('./pages/EventDetail')));

const NoticeList = Loadable(lazy(() => import('./pages/NoticeList')));
const NoticeDetail = Loadable(lazy(() => import('./pages/NoticeDetail')));
const FaqList = Loadable(lazy(() => import('./pages/FaqList')));
const InquiryList = Loadable(lazy(() => import('./pages/InquiryList')));
const InquiryDetail = Loadable(lazy(() => import('./pages/InquiryDetail')));
const InquiryNew = Loadable(lazy(() => import('./pages/InquiryNew')));

const MypageGuard = Loadable(lazy(() => import('./pages/MypageGuard')));
const MypageInfo = Loadable(lazy(() => import('./pages/MypageInfo')));
const MypageNotification = Loadable(lazy(() => import('./pages/MypageNotification')));
const MypageWithdraw = Loadable(lazy(() => import('./pages/MypageWithdraw')));

const PartnerContract = Loadable(lazy(() => import('./pages/PartnerContract')));

const Terms = Loadable(lazy(() => import('./pages/Terms')));
const Privacy = Loadable(lazy(() => import('./pages/Privacy')));
const Partnership = Loadable(lazy(() => import('./pages/Partnership')));

const Error404 = Loadable(lazy(() => import('./pages/404')));

const route: RouteObject[] = [
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/logout',
    element: <Logout />,
  },
  {
    path: '/',
    element: <GlobalLayout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'mypage/guard',
        element: <MypageGuard />,
      },
      {
        path: 'mypage',
        element: (
          <SidebarLayout
            title='마이페이지'
            tabConfig={[
              {
                label: '내정보관리',
                to: '/mypage/info',
              },
              {
                label: '수신설정',
                to: '/mypage/notification',
              },
              {
                label: '회원탈퇴',
                to: '/mypage/withdraw',
              },
            ]}
          />
        ),
        children: [
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
        path: 'partner-contract',
        element: <PartnerContract />,
      },
      {
        path: 'products',
        element: <ProductList />,
      },
      {
        path: '',
        element: (
          <TabbedLayout
            title='실적관리'
            tabConfig={[
              {
                label: '실적입력(EDI)',
                to: '/prescriptions',
              },
              {
                label: '소속딜러 관리',
                to: '/dealers',
              },
            ]}
          />
        ),
        children: [
          {
            path: 'prescriptions',
            element: <PrescriptionList />,
          },
          {
            path: 'dealers',
            element: <DealerList />,
          },
        ],
      },
      {
        path: '',
        element: (
          <TabbedLayout
            title='정산'
            tabConfig={[
              {
                label: '정산내역',
                to: '/settlement-list',
              },
              {
                label: '매출통계',
                to: '/sales-statistic',
              },
            ]}
          />
        ),
        children: [
          {
            path: 'settlement-list',
            element: <SettlementList />,
          },
          {
            path: 'sales-statistic',
            element: <SalesStatistic />,
          },
        ],
      },
      {
        path: 'community',
        element: (
          <TabbedLayout
            title='커뮤니티'
            tabConfig={[
              {
                label: '익명게시판',
                to: '/community/anonymous',
              },
              {
                label: 'MR-CSO 매칭',
                to: '/community/mr-cso-matching',
              },
            ]}
          />
        ),
        children: [
          {
            index: true,
            element: <Navigate to={'anonymous'} />,
          },
          {
            path: 'anonymous',
            element: <AnonymousList />,
          },
          {
            path: 'mr-cso-matching',
            element: <MrCsoMatchingList />,
          },
        ],
      },
      {
        path: 'community/anonymous/:id',
        element: <AnonymousBoardDetail />,
      },
      {
        path: 'community/mrcso-matching/new',
        element: <MrCsoMatchingNew />,
      },
      {
        path: 'sales-agency-products',
        element: <SalesAgencyProductList />,
      },
      {
        path: 'sales-agency-products/:id',
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
        element: (
          <SidebarLayout
            title='고객센터'
            tabConfig={[
              {
                label: '공지사항',
                to: '/customer-service/notice',
              },
              {
                label: 'FAQ',
                to: '/customer-service/faq',
              },
              {
                label: '1:1 문의내역',
                to: '/customer-service/inquiry',
              },
            ]}
          />
        ),
        children: [
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
      {
        path: 'terms',
        element: <Terms />,
      },
      {
        path: 'privacy',
        element: <Privacy />,
      },
      {
        path: 'partnership',
        element: <Partnership />,
      },
    ],
  },
  { path: '*', element: <Error404 /> },
];

export const router = createBrowserRouter(route, { basename: import.meta.env.VITE_BASE_NAME });
