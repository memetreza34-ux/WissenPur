import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

const [dialogHook, importPanel, privacyPanel] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/hooks/useAccessibleDialog.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LearningSetImportPanel.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/AccountPrivacyPanel.tsx'), 'utf8'),
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

console.log('Dialog-Fokusfang, Escape, Fokus-Rückgabe sowie Import- und Datenschutzdialog-A11y geprüft.');
