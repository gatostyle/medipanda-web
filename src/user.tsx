import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './user.scss';
import { UserApp } from './UserApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserApp />
  </StrictMode>,
);
