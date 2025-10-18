import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

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
    plugins: [react(), viteTsconfigPaths()],
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
