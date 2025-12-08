import { IS_ADMIN_MODE } from '@/constants';
import axios from 'axios';

const apiClient = axios.create({
  timeout: 10000,
});

if (IS_ADMIN_MODE) {
  apiClient.interceptors.response.use(
    response => response,
    error => {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        const currentPath = window.location.pathname;
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/logout');
        const isAuthRequest =
          error.config?.url?.includes('/v1/auth/login') ||
          error.config?.url?.includes('/v1/auth/logout') ||
          error.config?.url?.includes('/v1/auth/token/refresh') ||
          error.config?.url?.includes('/v1/auth/me');

        if (!isAuthPage && !isAuthRequest) {
          const currentUrl = window.location.pathname + window.location.search;
          window.location.replace(`/logout?authError=true&redirectTo=${encodeURIComponent(currentUrl)}`);
        }
      }

      return Promise.reject(error);
    },
  );
}

export default apiClient;
