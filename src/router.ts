import { createBrowserRouter } from 'react-router-dom';
import { MpRoutes } from './medipanda/routes/MpRoutes';

export const router = createBrowserRouter([MpRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME ?? '/' });
