import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AccountPrivacyPanel } from './components/AccountPrivacyPanel';
import ReleaseApp from './ReleaseApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReleaseApp />
    <AccountPrivacyPanel />
  </StrictMode>,
);
