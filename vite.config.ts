/* eslint-disable @typescript-eslint/no-explicit-any */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin, type ResolvedConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

const injectHtmlFaviconPlugin = () => {
  return {
    name: 'inject-html-favicon',
    transformIndexHtml(html: string) {
      return html.replace(
        /%FAVICON_SCRIPT%/,
        `
    <!-- Favicon -->
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/favicon-16-light.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/favicon-32-light.png">
    <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicons/favicon-96-light.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/assets/favicons/favicon-16-dark.png" media="(prefers-color-scheme: dark)">
    <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicons/favicon-32-dark.png" media="(prefers-color-scheme: dark)">
    <link rel="icon" type="image/png" sizes="96x96" href="/assets/favicons/favicon-96-dark.png" media="(prefers-color-scheme: dark)">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/favicon-180-light.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/assets/favicons/favicon-180-dark.png" media="(prefers-color-scheme: dark)">
        `,
      );
    },
  };
};

const injectHtmlSeoPlugin = ({ mode }: { mode: string }) => {
  return {
    name: 'inject-html-seo',
    transformIndexHtml(html: string) {
      if (mode !== 'prod') {
        return html.replace(/%SEO_SCRIPT%/, '');
      }

      return html.replace(
        /%SEO_SCRIPT%/,
        `
    <!-- 사이트 소유권 인증 (Search Console, 네이버 웹마스터 등) -->
    <meta name="google-site-verification" content="iYcuv7wCso-oWC6-UlR-qaucgT-6ZdAhJ98aH90vCVA" />
    <meta name="naver-site-verification" content="16f3e710fa607e34724d368a30f453aff35a0f87" />

    <!-- Title / Description -->
    <title>CSO비즈니스 성공파트너, 메디판다</title>
    <meta name="description" content="영업대행관리 플랫폼, 흩어져 있는 정보를 모으고 손쉬운 실적 관리 및 분석으로 영업에만 집중할 수 있도록 도와드리는 스마트한 영업파트너" />

    <!-- Robots -->
    <meta name="robots" content="index, follow" />

    <!-- Canonical (중복 URL 방지) -->
    <link rel="canonical" href="https://medipanda.co.kr/" />

    <!-- Open Graph / Social 메타 -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content="CSO비즈니스 성공파트너, 메디판다" />
    <meta property="og:description" content="영업대행관리 플랫폼, 영업에만 집중할 수 있게 하는 스마트한 CSO파트너" />
    <meta property="og:url" content="https://medipanda.co.kr/" />
    <meta property="og:image" content="https://medipanda.co.kr/assets/og.png" />

    <!-- 구조화 데이터 -->
    <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "메디판다",
        "url": "https://medipanda.co.kr/",
        "@graph": [
          {
            "@type": "WebPage",
            "name": "로그인",
            "url": "https://medipanda.co.kr/login"
          },
          {
            "@type": "WebPage",
            "name": "회원가입",
            "url": "https://medipanda.co.kr/signup"
          },
          {
            "@type": "WebPage",
            "name": "아이디 찾기",
            "url": "https://medipanda.co.kr/find-account"
          },
          {
            "@type": "WebPage",
            "name": "비밀번호 찾기",
            "url": "https://medipanda.co.kr/find-password"
          },
          {
            "@type": "WebPage",
            "name": "홈",
            "url": "https://medipanda.co.kr/"
          },
          {
            "@type": "WebPage",
            "name": "제품검색",
            "url": "https://medipanda.co.kr/products"
          },
          {
            "@type": "WebPage",
            "name": "실적입력(EDI)",
            "url": "https://medipanda.co.kr/prescriptions"
          },
          {
            "@type": "WebPage",
            "name": "소속딜러 관리",
            "url": "https://medipanda.co.kr/dealers"
          },
          {
            "@type": "WebPage",
            "name": "정산내역",
            "url": "https://medipanda.co.kr/settlement-list"
          },
          {
            "@type": "WebPage",
            "name": "매출통계",
            "url": "https://medipanda.co.kr/sales-statistic"
          },
          {
            "@type": "WebPage",
            "name": "신규처 매칭 게시판",
            "url": "https://medipanda.co.kr/community/mr-cso-matching"
          },
          {
            "@type": "WebPage",
            "name": "익명 게시판",
            "url": "https://medipanda.co.kr/community/anonymous"
          },
          {
            "@type": "WebPage",
            "name": "마이페이지 - 내 정보",
            "url": "https://medipanda.co.kr/mypage/info"
          },
          {
            "@type": "WebPage",
            "name": "영업대행상품",
            "url": "https://medipanda.co.kr/sales-agency-products"
          },
          {
            "@type": "WebPage",
            "name": "이벤트",
            "url": "https://medipanda.co.kr/events"
          },
          {
            "@type": "WebPage",
            "name": "고객센터 - 공지사항",
            "url": "https://medipanda.co.kr/customer-service/notice"
          },
          {
            "@type": "WebPage",
            "name": "고객센터 - FAQ",
            "url": "https://medipanda.co.kr/customer-service/faq"
          },
          {
            "@type": "WebPage",
            "name": "고객센터 - 1:1 문의내역",
            "url": "https://medipanda.co.kr/customer-service/inquiry"
          },
          {
            "@type": "WebPage",
            "name": "마이페이지 - 수신 설정",
            "url": "https://medipanda.co.kr/mypage/notification"
          },
          {
            "@type": "WebPage",
            "name": "마이페이지 - 회원 탈퇴",
            "url": "https://medipanda.co.kr/mypage/withdraw"
          },
          {
            "@type": "WebPage",
            "name": "파트너사 계약신청",
            "url": "https://medipanda.co.kr/partner-contract"
          },
          {
            "@type": "WebPage",
            "name": "이용약관",
            "url": "https://medipanda.co.kr/terms"
          },
          {
            "@type": "WebPage",
            "name": "개인정보처리방침",
            "url": "https://medipanda.co.kr/privacy"
          }
        ]
      }
    </script>
        `,
      );
    },
  };
};

const injectHtmlTagPlugin = ({ mode }: { mode: string }) => {
  return {
    name: 'inject-html-tag',
    transformIndexHtml(html: string) {
      if (mode !== 'prod') {
        return html.replace(/%TAG_SCRIPT%/, '');
      }

      return html.replace(
        /%TAG_SCRIPT%/,
        `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-PDGFZ1ZDYR"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-PDGFZ1ZDYR');
    </script>

    <!-- Naver tag -->
    <script type="text/javascript" src="//wcs.pstatic.net/wcslog.js"></script>
    <script type="text/javascript">
      if(!wcs_add) var wcs_add = {};
      wcs_add["wa"] = "15288ae0ba3e930";
      if(window.wcs) {
        wcs_do();
      }
    </script>
        `,
      );
    },
  };
};

const generateRobotsTxt = ({ mode }: { mode: string }) => {
  let config: ResolvedConfig;

  return {
    name: 'generate-robots-txt',
    configResolved(c: ResolvedConfig) {
      config = c;
    },
    closeBundle() {
      if (mode !== 'prod') {
        return;
      }

      const outDir = config.build?.outDir || 'dist';

      const content = `
User-agent: *
Allow: /
        `.trim();

      mkdirSync(outDir, { recursive: true });
      writeFileSync(resolve(outDir, 'robots.txt'), content);
    },
  } as Plugin;
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          landing: resolve(__dirname, 'landing.html'),
        },
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
    plugins: [
      react(),
      viteTsconfigPaths(),
      injectHtmlFaviconPlugin(),
      injectHtmlSeoPlugin({ mode }),
      injectHtmlTagPlugin({ mode }),
      generateRobotsTxt({ mode }),
    ],
    server: {
      proxy: {
        '/v1': {
          target: env.VITE_BACKEND_ENDPOINT,
          changeOrigin: true,
        },
        '/ocr': {
          target: env.VITE_BACKEND_ENDPOINT,
          changeOrigin: true,
        },
      },
    },
  };
});
