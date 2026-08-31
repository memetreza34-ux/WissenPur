import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getReviewTargetCount } from '../../wissenpur/src/services/reviewQueue.ts';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

assert.equal(getReviewTargetCount(0, 20), 0, 'Ohne fällige Karten darf der Lernplan keine Karten erfinden.');
assert.equal(getReviewTargetCount(2, 20), 2, 'Eine kleine Due-Queue muss vollständig, aber nicht künstlich auf fünf erhöht werden.');
assert.equal(getReviewTargetCount(20, 20), 10, '20 Minuten ergeben bei großer Queue ein Ziel von zehn Karten.');
assert.equal(getReviewTargetCount(100, 45), 23, 'Das Zeitbudget muss auch große Due-Queues begrenzen.');
assert.equal(getReviewTargetCount(Number.NaN, 20), 0, 'Ungültige Due-Zahlen müssen sicher auf null fallen.');

const [learningPlanService, learningPlanPanel, releaseApp, libraryManager] = await Promise.all([
  readFile(resolve(repoRoot, 'wissenpur/src/services/learningPlanService.ts'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LearningPlanPanel.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/ReleaseApp.tsx'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/src/components/LearningLibraryManager.tsx'), 'utf8'),
]);

assert.match(learningPlanService, /import \{ getReviewTargetCount \} from ['"]\.\/reviewQueue['"]/);
assert.match(learningPlanService, /const cardsToday = getReviewTargetCount\(dueCards, plan\.dailyMinutes\);/);
assert.doesNotMatch(
  learningPlanService,
  /Math\.max\(5, Math\.max\(0, Math\.trunc\(dueCards\)\)\)/,
  'Die alte Mindest-fünf-Logik darf nicht zurückkehren.',
);

for (const [name, content] of [
  ['LearningPlanPanel', learningPlanPanel],
  ['ReleaseApp', releaseApp],
  ['LearningLibraryManager', libraryManager],
] as const) {
  assert.match(content, /getDueQuestionsFromLibrary/, `${name} muss die zentrale Due-Queue verwenden.`);
}

assert.match(learningPlanPanel, /window\.setInterval\(refresh, REVIEW_REFRESH_MS\)/);
assert.match(releaseApp, /setInterval\(\(\) => setReviewNow\(Date\.now\(\)\), REVIEW_REFRESH_MS\)/);
assert.match(libraryManager, /setInterval\(\(\) => setReviewNow\(Date\.now\(\)\), REVIEW_REFRESH_MS\)/);

console.log('Gemeinsame Due-Queue, kleine Queue-Ziele und zeitbasierte Review-Aktualisierung geprüft.');
