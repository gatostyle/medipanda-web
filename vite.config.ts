import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig, loadEnv } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    build: {
      rollupOptions: {
        input: {
          admin: resolve(__dirname, 'admin.html'),
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
