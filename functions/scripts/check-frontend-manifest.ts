import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const packagePath = resolve(repoRoot, 'wissenpur/package.json');
const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as {
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const dependencies = packageJson.dependencies || {};
const devDependencies = packageJson.devDependencies || {};
const scripts = packageJson.scripts || {};
const failures: string[] = [];

const expectedRuntimeDependencies = new Set([
  'firebase',
  'lucide-react',
  'motion',
  'react',
  'react-dom',
]);

for (const dependency of Object.keys(dependencies)) {
  if (!expectedRuntimeDependencies.has(dependency)) {
    failures.push(`wissenpur/package.json: Unerwartete Browser-Abhängigkeit ${dependency}.`);
  }
}

for (const requiredDependency of expectedRuntimeDependencies) {
  if (!(requiredDependency in dependencies)) {
    failures.push(`wissenpur/package.json: Browser-Abhängigkeit ${requiredDependency} fehlt.`);
  }
}

for (const forbiddenDependency of [
  '@google/genai',
  'dotenv',
  'express',
  '@types/express',
  'tsx',
  'zod',
]) {
  if (forbiddenDependency in dependencies || forbiddenDependency in devDependencies) {
    failures.push(`wissenpur/package.json: Alt-/Serverpaket ${forbiddenDependency} ist im Frontend verboten.`);
  }
}

for (const requiredDevDependency of [
  '@tailwindcss/vite',
  '@types/node',
  '@types/react',
  '@types/react-dom',
  '@vitejs/plugin-react',
  'tailwindcss',
  'typescript',
  'vite',
]) {
  if (!(requiredDevDependency in devDependencies)) {
    failures.push(`wissenpur/package.json: Entwicklungsabhängigkeit ${requiredDevDependency} fehlt.`);
  }
}

for (const buildTool of ['@tailwindcss/vite', '@vitejs/plugin-react', 'tailwindcss', 'vite']) {
  if (buildTool in dependencies) {
    failures.push(`wissenpur/package.json: Buildwerkzeug ${buildTool} gehört in devDependencies.`);
  }
}

if (scripts.clean !== 'node scripts/clean.mjs') {
  failures.push('wissenpur/package.json: Clean-Skript muss plattformunabhängig über Node laufen.');
}
if (!scripts.lint?.includes('tsc --noEmit')) {
  failures.push('wissenpur/package.json: Frontend-Typecheck fehlt im lint-Skript.');
}
if (!scripts['build:release']?.includes('check:release')) {
  failures.push('wissenpur/package.json: Release-Build muss die Produktionskonfiguration prüfen.');
}

for (const [name, version] of Object.entries({ ...dependencies, ...devDependencies })) {
  if (typeof version !== 'string' || !version.trim()) {
    failures.push(`wissenpur/package.json: ${name} besitzt keine gültige Versionsangabe.`);
  }
  if (/^(?:latest|next|\*|git\+|https?:)/i.test(version.trim())) {
    failures.push(`wissenpur/package.json: ${name} verwendet eine nicht reproduzierbare Versionsquelle (${version}).`);
  }
}

if (failures.length > 0) {
  console.error('\nWissenPur-Frontend-Manifestprüfung fehlgeschlagen:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('');
  process.exit(1);
}

console.log(
  `Frontend-Manifest geprüft: ${Object.keys(dependencies).length} Laufzeit- und ${Object.keys(devDependencies).length} Entwicklungsabhängigkeiten.`,
);
