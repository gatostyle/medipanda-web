import { createBrowserRouter } from 'react-router-dom';

// project-imports
import { MpRoutes } from 'routes/medipanda/MpRoutes';

// ==============================|| ROUTES RENDER ||============================== //

const router = createBrowserRouter([MpRoutes], { basename: import.meta.env.VITE_APP_BASE_NAME });

export default router;
