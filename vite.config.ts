import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import viteTsconfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [react(), viteTsconfigPaths()],
    server: {
      proxy: {
        '/v1': {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
        },
        '/ocr': {
          target: env.VITE_OCR_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
