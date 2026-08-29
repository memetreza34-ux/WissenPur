import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const [workflow, frontendPackageText, functionsPackageText, rulesPackageText] = await Promise.all([
  readFile(resolve(repoRoot, '.github/workflows/wissenpur-quality.yml'), 'utf8'),
  readFile(resolve(repoRoot, 'wissenpur/package.json'), 'utf8'),
  readFile(resolve(repoRoot, 'functions/package.json'), 'utf8'),
  readFile(resolve(repoRoot, 'rules-tests/package.json'), 'utf8'),
]);

const CHECKOUT_SHA = '11d5960a326750d5838078e36cf38b85af677262';
const SETUP_NODE_SHA = '49933ea5288caeca8642d1e84afbd3f7d6820020';
const SETUP_JAVA_SHA = 'cf277c60eb25467037889841efdb72551f06f6c3';

const packageManifests = new Map<string, Record<string, unknown>>([
  ['wissenpur/package.json', JSON.parse(frontendPackageText) as Record<string, unknown>],
  ['functions/package.json', JSON.parse(functionsPackageText) as Record<string, unknown>],
  ['rules-tests/package.json', JSON.parse(rulesPackageText) as Record<string, unknown>],
]);

for (const [path, manifest] of packageManifests) {
  assert.equal(
    manifest.packageManager,
    'npm@10.9.2',
    `${path} muss npm@10.9.2 als packageManager festlegen.`,
  );
}

assert.match(workflow, /permissions:\s*\n\s*contents: read/);
assert.match(workflow, /concurrency:\s*\n\s*group: wissenpur-quality-/);
assert.match(workflow, /cancel-in-progress: true/);

const rootScriptsTriggerCount = workflow.match(/- 'scripts\/\*\*'/g)?.length || 0;
assert.equal(
  rootScriptsTriggerCount,
  2,
  'Der Quality-Workflow muss Root-Release-Skripte bei pull_request und push berücksichtigen.',
);

const jobNames = [
  'frontend-typecheck-and-build',
  'functions-verify-and-build',
  'firestore-security-rules',
];

for (const job of jobNames) {
  const section = workflow.match(new RegExp(`\\n  ${job}:[\\s\\S]*?(?=\\n  [a-z][a-z0-9-]+:|$)`))?.[0] || '';
  assert.ok(section, `${job} fehlt im Quality-Workflow.`);
  assert.match(section, /timeout-minutes: 20/, `${job} benötigt ein festes Zeitlimit.`);
  assert.ok(
    section.includes(`uses: actions/checkout@${CHECKOUT_SHA}`),
    `${job} muss actions/checkout per Commit-SHA pinnen.`,
  );
  assert.match(
    section,
    /persist-credentials:\s*false/,
    `${job} darf das GitHub-Token nach Checkout nicht im Git-Config persistieren.`,
  );
  assert.ok(
    section.includes(`uses: actions/setup-node@${SETUP_NODE_SHA}`),
    `${job} muss actions/setup-node per Commit-SHA pinnen.`,
  );
  assert.match(
    section,
    /node-version:\s*['"]22\.12\.0['"]/,
    `${job} muss die freigegebene Node-Version 22.12.0 exakt pinnen.`,
  );
  assert.match(
    section,
    /npm install --global npm@10\.9\.2 --no-audit --no-fund/,
    `${job} muss die freigegebene npm-Version 10.9.2 exakt pinnen.`,
  );
}

const rulesSection = workflow.match(/\n  firestore-security-rules:[\s\S]*$/)?.[0] || '';
assert.ok(
  rulesSection.includes(`uses: actions/setup-java@${SETUP_JAVA_SHA}`),
  'Der Firestore-Regeltest-Job muss actions/setup-java per Commit-SHA pinnen.',
);
assert.doesNotMatch(
  workflow,
  /uses:\s*actions\/[A-Za-z0-9_.-]+@v\d+/,
  'Quality-CI darf offizielle Actions nicht über bewegliche Major-Tags referenzieren.',
);
assert.doesNotMatch(workflow, /permissions:\s*\n(?:\s+[^\n]+\n)*\s*(?:write-all|contents:\s*write|actions:\s*write|id-token:\s*write)/,
  'Der Quality-Workflow darf keine Schreibrechte oder OIDC-Token anfordern.');
assert.doesNotMatch(workflow, /pull_request_target\s*:/,
  'Untrusted PR-Code darf nicht über pull_request_target laufen.');
assert.doesNotMatch(workflow, /firebase\s+deploy|cleanup:legacy|gcloud\s+firestore\s+(?:import|export)/,
  'Quality-CI darf weder deployen noch Produktionsdaten migrieren/löschen.');

console.log('GitHub-Actions-Rechte, Trigger-Abdeckung, SHA-Pins, Credential-Grenzen, Toolchain-Pins, Concurrency, Zeitlimits und Nicht-Deployment-Grenzen geprüft.');
