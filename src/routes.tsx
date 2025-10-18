import { BoardType } from '@/backend';
import { ContractMemberGuard } from '@/guards/ContractMemberGuard';
import { CsoMemberGuard } from '@/guards/CsoMemberGuard';
import { LoginMemberGuard } from '@/guards/LoginMemberGuard';
import { Base64ErrorBoundary } from '@/lib/components/Base64ErrorBoundary';
import { LazyComponent } from '@/lib/components/LazyComponent';
import { lazy } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom';

const FooterLayout = LazyComponent(lazy(() => import('layouts/FooterLayout')));
const GlobalLayout = LazyComponent(lazy(() => import('layouts/GlobalLayout')));
const TabbedLayout = LazyComponent(lazy(() => import('layouts/TabbedLayout')));
const SidebarLayout = LazyComponent(lazy(() => import('layouts/SidebarLayout')));

const Login = LazyComponent(lazy(() => import('pages/Login')));
const Logout = LazyComponent(lazy(() => import('pages/Logout')));
const Signup = LazyComponent(lazy(() => import('@/pages/Signup')));
const FindAccount = LazyComponent(lazy(() => import('@/pages/FindAccount')));
const FindPassword = LazyComponent(lazy(() => import('pages/FindPassword')));

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
const InquiryEdit = LazyComponent(lazy(() => import('@/pages/InquiryEdit')));

const MypageGuard = LazyComponent(lazy(() => import('@/guards/MypageGuard')));
const MypageInfo = LazyComponent(lazy(() => import('pages/MypageInfo')));
const MypageNotification = LazyComponent(lazy(() => import('pages/MypageNotification')));
const MypageWithdraw = LazyComponent(lazy(() => import('pages/MypageWithdraw')));

const PartnerContract = LazyComponent(lazy(() => import('pages/PartnerContract')));

const Terms = LazyComponent(lazy(() => import('pages/Terms')));
const Privacy = LazyComponent(lazy(() => import('pages/Privacy')));

const Error404 = LazyComponent(lazy(() => import('@/pages/Error404')));

const route: RouteObject[] = [
  {
    path: '/login',
    element: (
      <FooterLayout>
        <Login />
      </FooterLayout>
    ),
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
        path: '/signup',
        element: <Signup />,
      },
      {
        path: '/find-account',
        element: <FindAccount />,
      },
      {
        path: '/find-password',
        element: <FindPassword />,
      },
      {
        path: 'mypage/guard',
        element: <MypageGuard />,
      },
      {
        path: 'mypage',
        element: (
          <LoginMemberGuard>
            <MypageGuard>
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
            </MypageGuard>
          </LoginMemberGuard>
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
        element: (
          <LoginMemberGuard>
            <PartnerContract />
          </LoginMemberGuard>
        ),
      },
      {
        path: 'products',
        element: (
          <LoginMemberGuard>
            <ProductList />
          </LoginMemberGuard>
        ),
      },
      {
        path: '',
        element: (
          <LoginMemberGuard>
            <ContractMemberGuard>
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
            </ContractMemberGuard>
          </LoginMemberGuard>
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
          <LoginMemberGuard>
            <ContractMemberGuard>
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
            </ContractMemberGuard>
          </LoginMemberGuard>
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
          <LoginMemberGuard>
            <TabbedLayout
              title='커뮤니티'
              tabConfig={[
                {
                  label: '신규처 매칭',
                  to: '/community/mr-cso-matching',
                },
                {
                  label: '익명게시판',
                  to: '/community/anonymous',
                },
              ]}
            />
          </LoginMemberGuard>
        ),
        children: [
          {
            index: true,
            element: <Navigate to={'/community/mr-cso-matching'} replace />,
          },
          {
            path: 'anonymous',
            element: (
              <CsoMemberGuard>
                <AnonymousList />
              </CsoMemberGuard>
            ),
          },
          {
            path: 'anonymous/:id',
            element: <CommunityDetail boardType={BoardType.ANONYMOUS} />,
          },
          {
            path: 'anonymous/new',
            element: <CommunityEdit boardType={BoardType.ANONYMOUS} />,
          },
          {
            path: 'anonymous/:id/edit',
            element: <CommunityEdit boardType={BoardType.ANONYMOUS} />,
          },
          {
            path: 'mr-cso-matching',
            element: <MrCsoMatchingList />,
          },
          {
            path: 'mr-cso-matching/:id',
            element: <CommunityDetail boardType={BoardType.MR_CSO_MATCHING} />,
          },
          {
            path: 'mr-cso-matching/new',
            element: <CommunityEdit boardType={BoardType.MR_CSO_MATCHING} />,
          },
          {
            path: 'mr-cso-matching/:id/edit',
            element: <CommunityEdit boardType={BoardType.MR_CSO_MATCHING} />,
          },
        ],
      },
      {
        path: 'sales-agency-products',
        element: (
          <LoginMemberGuard>
            <SalesAgencyProductList />
          </LoginMemberGuard>
        ),
      },
      {
        path: 'sales-agency-products/:id',
        element: (
          <LoginMemberGuard>
            <SalesAgencyProductDetail />
          </LoginMemberGuard>
        ),
      },
      {
        path: 'events',
        element: (
          <LoginMemberGuard>
            <EventList />
          </LoginMemberGuard>
        ),
      },
      {
        path: 'events/:id',
        element: (
          <LoginMemberGuard>
            <EventDetail />
          </LoginMemberGuard>
        ),
      },
      {
        path: 'customer-service',
        element: (
          <LoginMemberGuard>
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
          </LoginMemberGuard>
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
            path: 'inquiry/:id/edit',
            element: <InquiryEdit />,
          },
          {
            path: 'inquiry/new',
            element: <InquiryEdit />,
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
    ],
  },
  { path: '*', element: <Error404 /> },
];

export const router = createBrowserRouter(
  [
    {
      errorElement: <Base64ErrorBoundary />,
      children: route,
    },
  ],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME,
  },
);
