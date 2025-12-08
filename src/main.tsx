import { IS_ADMIN_MODE } from '@/constants';
import { UserApp } from '@/UserApp';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AdminApp } from './AdminApp';

createRoot(document.getElementById('root')!).render(<StrictMode>{IS_ADMIN_MODE ? <AdminApp /> : <UserApp />}</StrictMode>);
