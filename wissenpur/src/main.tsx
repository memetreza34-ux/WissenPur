import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'motion/react';
import { AccountPrivacyPanel } from './components/AccountPrivacyPanel';
import { AccountSessionBoundary } from './components/AccountSessionBoundary';
import { AppErrorBoundary } from './components/AppErrorBoundary';
import { AvatarManagerPanel } from './components/AvatarManagerPanel';
import { ConnectivityBanner } from './components/ConnectivityBanner';
import { FirstRunOnboarding } from './components/FirstRunOnboarding';
import { LearningAnalyticsPanel } from './components/LearningAnalyticsPanel';
import { LearningLibraryManager } from './components/LearningLibraryManager';
import { LearningPlanPanel } from './components/LearningPlanPanel';
import { LegalPanel } from './components/LegalPanel';
import { ManualLearningSetPanel } from './components/ManualLearningSetPanel';
import { PwaUpdateBanner } from './components/PwaUpdateBanner';
import ReleaseApp from './ReleaseApp';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <MotionConfig reducedMotion="user">
        <ConnectivityBanner />
        <PwaUpdateBanner />
        <AccountSessionBoundary>
          <ReleaseApp />
          <FirstRunOnboarding />
          <LearningAnalyticsPanel />
          <LearningLibraryManager />
          <ManualLearningSetPanel />
          <LearningPlanPanel />
          <AvatarManagerPanel />
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
      const errorName = error instanceof Error ? error.name.slice(0, 80) : 'UnknownError';
      console.warn('Service Worker registration failed', { errorName });
    });
  });
}
