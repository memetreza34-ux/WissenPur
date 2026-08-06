import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import ReleaseApp from './ReleaseApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReleaseApp />
  </StrictMode>,
);
