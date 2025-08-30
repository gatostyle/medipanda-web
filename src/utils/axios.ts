import axios, { AxiosRequestConfig } from 'axios';

const axiosServices = axios.create({
  withCredentials: true, // Ensure cookies are sent with requests
});

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.response.use(
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

export default axiosServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { ...config });

  return res.data;
};

export const fetcherPost = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.post(url, { ...config });

  return res.data;
};
