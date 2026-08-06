import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AccountPrivacyPanel } from './components/AccountPrivacyPanel';
import { LearningPlanPanel } from './components/LearningPlanPanel';
import ReleaseApp from './ReleaseApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ReleaseApp />
    <LearningPlanPanel />
    <AccountPrivacyPanel />
  </StrictMode>,
);
