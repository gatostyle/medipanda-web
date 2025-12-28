import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin, type ResolvedConfig } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          admin: resolve(__dirname, 'admin.html'),
          landing: resolve(__dirname, 'landing.html'),
          event1: resolve(__dirname, 'event1.html'),
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
      generateSitemapXml({ mode }),
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

function injectHtmlFaviconPlugin() {
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
}

function injectHtmlSeoPlugin({ mode }: { mode: string }) {
  return {
    name: 'inject-html-seo',
    transformIndexHtml(html: string, ctx: { filename: string }) {
      if (mode !== 'prod') {
        return html.replace(/%SEO_SCRIPT%/, '');
      }

      // landing.html용 SEO
      if (ctx.filename.includes('landing.html')) {
        return html.replace(
          /%SEO_SCRIPT%/,
          `
    <!-- 사이트 소유권 인증 -->
    <meta name="google-site-verification" content="iYcuv7wCso-oWC6-UlR-qaucgT-6ZdAhJ98aH90vCVA" />
    <meta name="naver-site-verification" content="16f3e710fa607e34724d368a30f453aff35a0f87" />

    <!-- Title / Description -->
    <title>메디판다 - CSO비즈니스 성공파트너</title>
    <meta name="description" content="정산은 쉽게! 약품 검색은 빠르게! CSO 영업사원을 위한 스마트 앱. 처방 내역 등록, 실적관리, 커뮤니티까지 한번에" />

    <!-- Robots -->
    <meta name="robots" content="index, follow" />

    <!-- Canonical -->
    <link rel="canonical" href="https://medipanda.co.kr/landing.html" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="메디판다" />
    <meta property="og:title" content="메디판다 - CSO비즈니스 성공파트너" />
    <meta property="og:description" content="정산은 쉽게! 약품 검색은 빠르게! CSO 영업사원을 위한 스마트 앱" />
    <meta property="og:url" content="https://medipanda.co.kr/landing.html" />
    <meta property="og:image" content="https://medipanda.co.kr/assets/og.png" />

    <!-- 구조화 데이터 -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "메디판다",
  "alternateName": "MediPanda",
  "url": "https://medipanda.co.kr/"
}
</script>

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "메디판다",
  "url": "https://medipanda.co.kr/",
  "logo": "https://medipanda.co.kr/assets/og.png"
}
</script>
    `,
        );
      }

      // event1.html - 검색 제외
      if (ctx.filename.includes('event1.html')) {
        return html.replace(
          /%SEO_SCRIPT%/,
          `
    <title>메디판다 이벤트</title>
    <meta name="robots" content="noindex, nofollow" />
          `,
        );
      }

      // index.html (메인) 용 SEO
      return html.replace(
        /%SEO_SCRIPT%/,
        `
    <!-- 사이트 소유권 인증 (Search Console, 네이버 웹마스터 등) -->
    <meta name="google-site-verification" content="iYcuv7wCso-oWC6-UlR-qaucgT-6ZdAhJ98aH90vCVA" />
    <meta name="naver-site-verification" content="16f3e710fa607e34724d368a30f453aff35a0f87" />

    <!-- Title / Description -->
    <title>메디판다, CSO비즈니스 성공파트너</title>
    <meta name="description" content="메디판다, 영업대행관리 플랫폼, 흩어져 있는 정보를 모으고 손쉬운 실적 관리 및 분석으로 영업에만 집중할 수 있도록 도와드리는 스마트한 영업파트너" />

    <!-- Robots -->
    <meta name="robots" content="noindex, follow" />

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
}

function injectHtmlTagPlugin({ mode }: { mode: string }) {
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
}

function generateSitemapXml({ mode }: { mode: string }) {
  let config: ResolvedConfig;

  return {
    name: 'generate-sitemap-xml',
    configResolved(c: ResolvedConfig) {
      config = c;
    },
    closeBundle() {
      if (mode !== 'prod') {
        return;
      }

      const outDir = config.build?.outDir || 'dist';
      const today = new Date().toISOString().split('T')[0];

      const content = `
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://medipanda.co.kr/landing.html</loc>
    <lastmod>${today}</lastmod>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://medipanda.co.kr/</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/login</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/signup</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/find-account</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/find-password</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/products</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/prescriptions</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/dealers</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/settlement-list</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/sales-statistic</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/community/mr-cso-matching</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/community/anonymous</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/sales-agency-products</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/events</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/customer-service/notice</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/customer-service/faq</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/customer-service/inquiry</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/terms</loc>
    <lastmod>${today}</lastmod>
  </url>
  <url>
    <loc>https://medipanda.co.kr/privacy</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
      `.trim();

      mkdirSync(outDir, { recursive: true });
      writeFileSync(resolve(outDir, 'sitemap.xml'), content);
    },
  } as Plugin;
}
