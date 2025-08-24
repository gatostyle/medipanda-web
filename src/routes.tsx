import { LoginGuard } from '@/guards/LoginGuard';
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
            element: (
              <LoginGuard>
                <MypageInfo />
              </LoginGuard>
            ),
          },
          {
            path: 'notification',
            element: (
              <LoginGuard>
                <MypageNotification />
              </LoginGuard>
            ),
          },
          {
            path: 'withdraw',
            element: (
              <LoginGuard>
                <MypageWithdraw />
              </LoginGuard>
            ),
          },
        ],
      },
      {
        path: 'partner-contract',
        element: (
          <LoginGuard>
            <PartnerContract />
          </LoginGuard>
        ),
      },
      {
        path: 'products',
        element: (
          <LoginGuard>
            <ProductList />
          </LoginGuard>
        ),
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
            element: (
              <LoginGuard>
                <PrescriptionList />
              </LoginGuard>
            ),
          },
          {
            path: 'dealers',
            element: (
              <LoginGuard>
                <DealerList />
              </LoginGuard>
            ),
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
            element: (
              <LoginGuard>
                <SettlementList />
              </LoginGuard>
            ),
          },
          {
            path: 'sales-statistic',
            element: (
              <LoginGuard>
                <SalesStatistic />
              </LoginGuard>
            ),
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
            element: (
              <LoginGuard>
                <CommunityDetail />
              </LoginGuard>
            ),
          },
          {
            path: ':communityType/:id/edit',
            element: (
              <LoginGuard>
                <CommunityEdit />
              </LoginGuard>
            ),
          },
          {
            path: ':communityType/new',
            element: (
              <LoginGuard>
                <CommunityEdit />
              </LoginGuard>
            ),
          },
          {
            path: 'anonymous',
            element: (
              <LoginGuard>
                <AnonymousList />
              </LoginGuard>
            ),
          },
          {
            path: 'mr-cso-matching',
            element: (
              <LoginGuard>
                <MrCsoMatchingList />
              </LoginGuard>
            ),
          },
        ],
      },
      {
        path: 'sales-agency-products',
        element: (
          <LoginGuard>
            <SalesAgencyProductList />
          </LoginGuard>
        ),
      },
      {
        path: 'sales-agency-products/:id',
        element: (
          <LoginGuard>
            <SalesAgencyProductDetail />
          </LoginGuard>
        ),
      },
      {
        path: 'events',
        element: (
          <LoginGuard>
            <EventList />
          </LoginGuard>
        ),
      },
      {
        path: 'events/:id',
        element: (
          <LoginGuard>
            <EventDetail />
          </LoginGuard>
        ),
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
            element: (
              <LoginGuard>
                <NoticeList />
              </LoginGuard>
            ),
          },
          {
            path: 'notice/:id',
            element: (
              <LoginGuard>
                <NoticeDetail />
              </LoginGuard>
            ),
          },
          {
            path: 'faq',
            element: (
              <LoginGuard>
                <FaqList />
              </LoginGuard>
            ),
          },
          {
            path: 'inquiry',
            element: (
              <LoginGuard>
                <InquiryList />
              </LoginGuard>
            ),
          },
          {
            path: 'inquiry/:id',
            element: (
              <LoginGuard>
                <InquiryDetail />
              </LoginGuard>
            ),
          },
          {
            path: 'inquiry/new',
            element: (
              <LoginGuard>
                <InquiryNew />
              </LoginGuard>
            ),
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
