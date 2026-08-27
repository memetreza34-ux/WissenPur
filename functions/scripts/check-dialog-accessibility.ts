import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const [
  dialogHook,
  importPanel,
  privacyPanel,
  avatarManager,
  onboarding,
  main,
  indexCss,
] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/hooks/useAccessibleDialog.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LearningSetImportPanel.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AccountPrivacyPanel.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AvatarManagerPanel.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/FirstRunOnboarding.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/main.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/index.css'), 'utf8'),
]);

assert.match(dialogHook, /FOCUSABLE_SELECTOR/);
assert.match(dialogHook, /event\.key === 'Escape'/);
assert.match(dialogHook, /event\.key !== 'Tab'/);
assert.match(dialogHook, /document\.body\.style\.overflow = 'hidden'/);
assert.match(dialogHook, /previousFocus\.focus\(\{ preventScroll: true \}\)/);
assert.match(dialogHook, /document\.addEventListener\('keydown', handleKeyDown\)/);
assert.match(dialogHook, /document\.removeEventListener\('keydown', handleKeyDown\)/);

assert.match(importPanel, /useAccessibleDialog\(isOpen, close\)/);
assert.match(importPanel, /ref=\{dialogRef\}/);
assert.match(importPanel, /tabIndex=\{-1\}/);
assert.match(importPanel, /role="dialog"/);
assert.match(importPanel, /aria-modal="true"/);
assert.match(importPanel, /aria-labelledby="learning-set-import-title"/);
assert.match(importPanel, /aria-label="Import schließen"/);
assert.match(importPanel, /role="alert"/);
assert.match(importPanel, /role="status" aria-live="polite"/);
assert.match(importPanel, /focus-visible:ring-2/);

assert.match(privacyPanel, /useAccessibleDialog\(isOpen, closePanel\)/);
assert.match(privacyPanel, /const closePanel = \(\) => \{[\s\S]*?if \(isBusy\) return;/);
assert.match(privacyPanel, /ref=\{dialogRef\}/);
assert.match(privacyPanel, /tabIndex=\{-1\}/);
assert.match(privacyPanel, /aria-labelledby="privacy-panel-title"/);
assert.match(privacyPanel, /aria-label="Fenster schließen"[\s\S]*?disabled=\{isBusy\}/);
assert.match(privacyPanel, /role="status" aria-live="polite"/);
assert.match(privacyPanel, /focus-visible:ring-rose-500/);

assert.match(avatarManager, /useAccessibleDialog\(isOpen, close\)/);
assert.match(avatarManager, /role="dialog"/);
assert.match(avatarManager, /aria-modal="true"/);
assert.match(avatarManager, /aria-labelledby="avatar-manager-title"/);
assert.match(avatarManager, /tabIndex=\{-1\}/);
assert.match(avatarManager, /role="status" aria-live="polite"/);
assert.match(avatarManager, /aria-label="Avatarverwaltung schließen"/);
assert.match(avatarManager, /focus-visible:ring-violet-500/);

assert.match(onboarding, /const ONBOARDING_KEY = 'wissenpur_onboarding_v1_completed'/);
assert.match(onboarding, /localStorage\.getItem\(ONBOARDING_KEY\)/);
assert.match(onboarding, /localStorage\.setItem\(ONBOARDING_KEY, '1'\)/);
assert.doesNotMatch(onboarding, /fetch\(|httpsCallable|setDoc\(|syncUserStats|analytics|telemetry/i,
  'Das First-Run-Onboarding darf keine Netzwerk-, Cloud- oder Tracking-Synchronisierung besitzen.');
assert.match(onboarding, /useAccessibleDialog\(isOpen, complete\)/);
assert.match(onboarding, /role="dialog"/);
assert.match(onboarding, /aria-modal="true"/);
assert.match(onboarding, /aria-labelledby="first-run-title"/);
assert.match(onboarding, /aria-describedby="first-run-description"/);
assert.match(onboarding, /tabIndex=\{-1\}/);
assert.match(onboarding, /aria-label="Einführung überspringen"/);
assert.match(main, /<FirstRunOnboarding\s*\/>/);

assert.match(main, /import \{ MotionConfig \} from 'motion\/react'/);
assert.match(main, /<MotionConfig reducedMotion="user">/);
assert.match(indexCss, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(indexCss, /animation-duration: 0\.01ms !important/);
assert.match(indexCss, /transition-duration: 0\.01ms !important/);
assert.match(indexCss, /\.animate-shimmer[\s\S]*?animation: none !important/);
assert.doesNotMatch(indexCss, /fonts\.googleapis\.com|fonts\.gstatic\.com/);

console.log('Dialog-A11y, First-Run-Onboarding, reduzierte Bewegung und lokale Schriftstapel sind regressiv abgesichert.');
