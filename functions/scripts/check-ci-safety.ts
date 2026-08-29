import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const workflow = await readFile(
  resolve(repoRoot, '.github/workflows/wissenpur-quality.yml'),
  'utf8',
);

assert.match(workflow, /permissions:\s*\n\s*contents: read/);
assert.match(workflow, /concurrency:\s*\n\s*group: wissenpur-quality-/);
assert.match(workflow, /cancel-in-progress: true/);

const jobNames = [
  'frontend-typecheck-and-build',
  'functions-verify-and-build',
  'firestore-security-rules',
];
const jobSections = new Map<string, string>();

for (const job of jobNames) {
  const section = workflow.match(new RegExp(`\\n  ${job}:[\\s\\S]*?(?=\\n  [a-z][a-z0-9-]+:|$)`))?.[0] || '';
  assert.ok(section, `${job} fehlt im Quality-Workflow.`);
  assert.match(section, /timeout-minutes: 20/, `${job} benötigt ein festes Zeitlimit.`);
  assert.match(section, /uses: actions\/checkout@v4/);
  assert.match(section, /uses: actions\/setup-node@v4/);
  assert.match(
    section,
    /node-version:\s*['"]22\.12\.0['"]/,
    `${job} muss die freigegebene Node-Version 22.12.0 exakt pinnen.`,
  );
  jobSections.set(job, section);
}

const frontendSection = jobSections.get('frontend-typecheck-and-build') || '';
assert.match(
  frontendSection,
  /npm install --global npm@10\.9\.2 --no-audit --no-fund/,
  'Der Frontend-Job muss die im Manifest festgelegte npm-Version 10.9.2 verwenden.',
);

assert.doesNotMatch(workflow, /permissions:\s*\n(?:\s+[^\n]+\n)*\s*(?:write-all|contents:\s*write|actions:\s*write|id-token:\s*write)/,
  'Der Quality-Workflow darf keine Schreibrechte oder OIDC-Token anfordern.');
assert.doesNotMatch(workflow, /pull_request_target\s*:/,
  'Untrusted PR-Code darf nicht über pull_request_target laufen.');
assert.doesNotMatch(workflow, /firebase\s+deploy|cleanup:legacy|gcloud\s+firestore\s+(?:import|export)/,
  'Quality-CI darf weder deployen noch Produktionsdaten migrieren/löschen.');

console.log('GitHub-Actions-Rechte, Toolchain-Pins, Concurrency, Zeitlimits und Nicht-Deployment-Grenzen geprüft.');
