import { execFile } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import { basename, extname, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

const execFileAsync = promisify(execFile);
const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const scannerPath = 'functions/scripts/check-repository-secrets.ts';
const failures: string[] = [];
const maxTextFileBytes = 2_000_000;

const ignoredFileNames = new Set([
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
]);

const textExtensions = new Set([
  '',
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mjs',
  '.rules',
  '.sh',
  '.toml',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

const privateKeyMarker = ['-----BEGIN', 'PRIVATE KEY-----'].join(' ');
const rsaPrivateKeyMarker = ['-----BEGIN RSA', 'PRIVATE KEY-----'].join(' ');

const contentRules: Array<{ name: string; pattern: RegExp }> = [
  { name: 'Private-Key-Block', pattern: new RegExp(privateKeyMarker.replaceAll(' ', '\\s+')) },
  { name: 'RSA-Private-Key-Block', pattern: new RegExp(rsaPrivateKeyMarker.replaceAll(' ', '\\s+')) },
  { name: 'Google-Service-Account-Private-Key', pattern: /"private_key"\s*:\s*"-----BEGIN/ },
  { name: 'GitHub-Classic-Token', pattern: /\bghp_[A-Za-z0-9]{30,}\b/ },
  { name: 'GitHub-Fine-Grained-Token', pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/ },
  { name: 'OpenAI-Project-Key', pattern: /\bsk-proj-[A-Za-z0-9_-]{20,}\b/ },
  { name: 'OpenAI-Legacy-Key', pattern: /\bsk-[A-Za-z0-9]{32,}\b/ },
  { name: 'Slack-Token', pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/ },
  { name: 'AWS-Access-Key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: 'Firebase-CLI-Token', pattern: /\bFIREBASE_TOKEN\s*=\s*[^\s#]{20,}/ },
  { name: 'Nonempty-Gemini-Key', pattern: /\bGEMINI_API_KEY\s*=\s*[^\s#]{12,}/ },
  { name: 'Nonempty-OpenAI-Key', pattern: /\bOPENAI_API_KEY\s*=\s*[^\s#]{12,}/ },
];

const isForbiddenEnvironmentFile = (name: string): boolean =>
  name === '.env' ||
  (name.startsWith('.env.') && name !== '.env.example');

const isForbiddenCredentialFile = (name: string): boolean => {
  const lower = name.toLocaleLowerCase('en-US');
  return (
    /service[-_]?account.*\.json$/.test(lower) ||
    /firebase-adminsdk.*\.json$/.test(lower) ||
    /credentials?.*\.json$/.test(lower) ||
    /secrets?.*\.json$/.test(lower) ||
    ['.pem', '.p12', '.pfx', '.key'].includes(extname(lower))
  );
};

let trackedFiles: string[];
try {
  const { stdout } = await execFileAsync('git', ['ls-files', '-z'], {
    cwd: repoRoot,
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  });
  trackedFiles = stdout.split('\0').filter(Boolean);
} catch (error) {
  console.error('Git-Dateiliste konnte für den Secret-Scan nicht gelesen werden.', error);
  process.exit(1);
}

for (const repoPath of trackedFiles) {
  const name = basename(repoPath);

  if (isForbiddenEnvironmentFile(name)) {
    failures.push(`${repoPath}: versionierte Env-Datei ist verboten.`);
    continue;
  }

  if (isForbiddenCredentialFile(name)) {
    failures.push(`${repoPath}: mögliche Credential- oder Schlüsseldatei ist verboten.`);
    continue;
  }

  if (repoPath === scannerPath || ignoredFileNames.has(name)) continue;
  if (!textExtensions.has(extname(name).toLocaleLowerCase('en-US'))) continue;

  const file = resolve(repoRoot, repoPath);
  let fileStats;
  try {
    fileStats = await stat(file);
  } catch {
    continue;
  }
  if (fileStats.size > maxTextFileBytes) continue;

  let content: string;
  try {
    content = await readFile(file, 'utf8');
  } catch {
    continue;
  }

  for (const rule of contentRules) {
    if (rule.pattern.test(content)) {
      failures.push(`${repoPath}: möglicher Geheimnisfund (${rule.name}).`);
    }
  }
}

if (failures.length > 0) {
  console.error('\nWissenPur-Secret-Scan fehlgeschlagen:\n');
  for (const failure of [...new Set(failures)].sort()) console.error(`- ${failure}`);
  console.error('\nEntferne den Wert aus Git und rotiere ihn, falls er jemals gültig war.\n');
  process.exit(1);
}

console.log(`Secret-Scan abgeschlossen: ${trackedFiles.length} versionierte Dateien geprüft.`);
