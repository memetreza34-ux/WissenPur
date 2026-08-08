import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { AccountPrivacyPanel } from './components/AccountPrivacyPanel';
import { AccountSessionBoundary } from './components/AccountSessionBoundary';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { LearningAnalyticsPanel } from './components/LearningAnalyticsPanel';
import { LearningLibraryManager } from './components/LearningLibraryManager';
import { LearningPlanPanel } from './components/LearningPlanPanel';
import { LegalPanel } from './components/LegalPanel';
import { ManualLearningSetPanel } from './components/ManualLearningSetPanel';
import ReleaseApp from './ReleaseApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <MotionConfig reducedMotion="user">
        <AccountSessionBoundary>
          <ReleaseApp />
          <LearningAnalyticsPanel />
          <LearningLibraryManager />
          <ManualLearningSetPanel />
          <LearningPlanPanel />
          <LegalPanel />
          <AccountPrivacyPanel />
        </AccountSessionBoundary>
      </MotionConfig>
    </AppErrorBoundary>
  </StrictMode>,
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'unknown registration error';
      console.warn('Service Worker konnte nicht registriert werden:', message);
    });
  });
}
