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

const Login = LazyComponent(lazy(() => import('@/pages-user/Login')));
const Logout = LazyComponent(lazy(() => import('@/pages-user/Logout')));
const Signup = LazyComponent(lazy(() => import('@/pages-user/Signup')));
const FindAccount = LazyComponent(lazy(() => import('@/pages-user/FindAccount')));
const FindPassword = LazyComponent(lazy(() => import('@/pages-user/FindPassword')));

const Home = LazyComponent(lazy(() => import('@/pages-user/Home')));

const ProductList = LazyComponent(lazy(() => import('@/pages-user/ProductList')));

const PrescriptionList = LazyComponent(lazy(() => import('@/pages-user/PrescriptionList')));
const DealerList = LazyComponent(lazy(() => import('@/pages-user/DealerList')));

const SettlementList = LazyComponent(lazy(() => import('@/pages-user/./SettlementList')));
const SettlementDrugCompany = LazyComponent(lazy(() => import('@/pages-user/SettlementDrugCompany')));
const SalesStatistic = LazyComponent(lazy(() => import('@/pages-user/SalesStatistic')));

const CommunityDetail = LazyComponent(lazy(() => import('@/pages-user/CommunityDetail')));
const CommunityEdit = LazyComponent(lazy(() => import('@/pages-user/CommunityEdit')));

const AnonymousList = LazyComponent(lazy(() => import('@/pages-user/AnonymousList')));

const MrCsoMatchingList = LazyComponent(lazy(() => import('@/pages-user/MrCsoMatchingList')));

const SalesAgencyProductList = LazyComponent(lazy(() => import('@/pages-user/SalesAgencyProductList')));
const SalesAgencyProductDetail = LazyComponent(lazy(() => import('@/pages-user/SalesAgencyProductDetail')));

const EventList = LazyComponent(lazy(() => import('@/pages-user/EventList')));
const EventDetail = LazyComponent(lazy(() => import('@/pages-user/EventDetail')));

const NoticeList = LazyComponent(lazy(() => import('@/pages-user/NoticeList')));
const NoticeDetail = LazyComponent(lazy(() => import('@/pages-user/NoticeDetail')));
const FaqList = LazyComponent(lazy(() => import('@/pages-user/FaqList')));
const InquiryList = LazyComponent(lazy(() => import('@/pages-user/InquiryList')));
const InquiryDetail = LazyComponent(lazy(() => import('@/pages-user/InquiryDetail')));
const InquiryEdit = LazyComponent(lazy(() => import('@/pages-user/InquiryEdit')));

const MypageGuard = LazyComponent(lazy(() => import('@/guards/MypageGuard')));
const MypageInfo = LazyComponent(lazy(() => import('@/pages-user/MypageInfo')));
const MypageNotification = LazyComponent(lazy(() => import('@/pages-user/MypageNotification')));
const MypageWithdraw = LazyComponent(lazy(() => import('@/pages-user/MypageWithdraw')));

const PartnerContract = LazyComponent(lazy(() => import('@/pages-user/PartnerContract')));

const Terms = LazyComponent(lazy(() => import('@/pages-user/Terms')));
const Privacy = LazyComponent(lazy(() => import('@/pages-user/Privacy')));

const Error404 = LazyComponent(lazy(() => import('@/pages-user/Error404')));

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
                    label: '제약사별 정산내역',
                    to: '/settlement-drug-company',
                  },
                  {
                    label: '딜러별 정산내역',
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
            path: 'settlement-drug-company',
            element: <SettlementDrugCompany />,
          },
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

export const userRouter = createBrowserRouter(
  [
    {
      errorElement: <Base64ErrorBoundary />,
      children: route,
    },
  ],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME ?? '/',
  },
);
