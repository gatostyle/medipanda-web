import { createBrowserRouter } from 'react-router-dom';

// project-imports
import { CsoRoutes } from './cso-link/CsoRoutes';

// ==============================|| ROUTES RENDER ||============================== //

const router = createBrowserRouter([CsoRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
