import { LazyComponent } from '@/lib/react/LazyComponent';
import { lazy } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';

const GlobalLayout = LazyComponent(lazy(() => import('layouts/GlobalLayout')));
const TabbedLayout = LazyComponent(lazy(() => import('layouts/TabbedLayout')));
const SidebarLayout = LazyComponent(lazy(() => import('layouts/SidebarLayout')));

const Login = LazyComponent(lazy(() => import('pages/Login')));
const Logout = LazyComponent(lazy(() => import('pages/Logout')));

const Home = LazyComponent(lazy(() => import('pages/Home')));

const ProductList = LazyComponent(lazy(() => import('pages/ProductList')));

const PrescriptionList = LazyComponent(lazy(() => import('pages/PrescriptionList')));
const DealerList = LazyComponent(lazy(() => import('pages/DealerList')));

const SettlementList = LazyComponent(lazy(() => import('pages/./SettlementList')));
const SalesStatistic = LazyComponent(lazy(() => import('pages/SalesStatistic')));

const CommunityDetail = LazyComponent(lazy(() => import('pages/CommunityDetail')));
const CommunityEdit = LazyComponent(lazy(() => import('pages/CommunityEdit')));

const AnonymousList = LazyComponent(lazy(() => import('pages/AnonymousList')));

const MrCsoMatchingList = LazyComponent(lazy(() => import('pages/MrCsoMatchingList')));

const SalesAgencyProductList = LazyComponent(lazy(() => import('pages/SalesAgencyProductList')));
const SalesAgencyProductDetail = LazyComponent(lazy(() => import('pages/SalesAgencyProductDetail')));

const EventList = LazyComponent(lazy(() => import('pages/EventList')));
const EventDetail = LazyComponent(lazy(() => import('pages/EventDetail')));

const NoticeList = LazyComponent(lazy(() => import('pages/NoticeList')));
const NoticeDetail = LazyComponent(lazy(() => import('pages/NoticeDetail')));
const FaqList = LazyComponent(lazy(() => import('pages/FaqList')));
const InquiryList = LazyComponent(lazy(() => import('pages/InquiryList')));
const InquiryDetail = LazyComponent(lazy(() => import('pages/InquiryDetail')));
const InquiryNew = LazyComponent(lazy(() => import('pages/InquiryNew')));

const MypageGuard = LazyComponent(lazy(() => import('pages/MypageGuard')));
const MypageInfo = LazyComponent(lazy(() => import('pages/MypageInfo')));
const MypageNotification = LazyComponent(lazy(() => import('pages/MypageNotification')));
const MypageWithdraw = LazyComponent(lazy(() => import('pages/MypageWithdraw')));

const PartnerContract = LazyComponent(lazy(() => import('pages/PartnerContract')));

const Terms = LazyComponent(lazy(() => import('pages/Terms')));
const Privacy = LazyComponent(lazy(() => import('pages/Privacy')));
const Partnership = LazyComponent(lazy(() => import('pages/Partnership')));

const Error404 = LazyComponent(lazy(() => import('pages/404')));

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
            path: ':communityType/:id',
            element: <CommunityDetail />,
          },
          {
            path: ':communityType/:id/edit',
            element: <CommunityEdit />,
          },
          {
            path: ':communityType/new',
            element: <CommunityEdit />,
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
