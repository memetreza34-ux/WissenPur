import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');
const manifestPath = resolve(repoRoot, 'wissenpur/package.json');
const lockPath = resolve(repoRoot, 'wissenpur/package-lock.json');

const manifest = JSON.parse(await readFile(manifestPath, 'utf8')) as {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};
const lock = JSON.parse(await readFile(lockPath, 'utf8')) as {
  name?: string;
  version?: string;
  lockfileVersion?: number;
  packages?: Record<string, {
    name?: string;
    version?: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }>;
};

const failures: string[] = [];
const root = lock.packages?.[''];
const removedTopLevelPackages = [
  '@google/genai',
  '@types/express',
  'autoprefixer',
  'dotenv',
  'express',
  'tsx',
] as const;

if (lock.lockfileVersion !== 3) {
  failures.push(`wissenpur/package-lock.json: lockfileVersion ${String(lock.lockfileVersion)} statt 3.`);
}
if (!root) {
  failures.push('wissenpur/package-lock.json: Root-Paket fehlt unter packages[""].');
} else {
  if (lock.name !== manifest.name || root.name !== manifest.name) {
    failures.push(`wissenpur/package-lock.json: Paketname ist nicht mit package.json synchron (${String(lock.name)} / ${String(root.name)}).`);
  }
  if (lock.version !== manifest.version || root.version !== manifest.version) {
    failures.push(`wissenpur/package-lock.json: Version ist nicht mit package.json synchron (${String(lock.version)} / ${String(root.version)}).`);
  }

  for (const section of ['dependencies', 'devDependencies'] as const) {
    const expected = manifest[section] || {};
    const locked = root[section] || {};
    const expectedNames = Object.keys(expected).sort();
    const lockedNames = Object.keys(locked).sort();

    if (JSON.stringify(expectedNames) !== JSON.stringify(lockedNames)) {
      failures.push(
        `wissenpur/package-lock.json: ${section} enthält andere direkte Pakete als package.json. Erwartet: ${expectedNames.join(', ')}. Lock: ${lockedNames.join(', ')}.`,
      );
    }

    for (const [name, version] of Object.entries(expected)) {
      if (locked[name] !== version) {
        failures.push(`wissenpur/package-lock.json: ${section}.${name} ist ${String(locked[name])} statt ${version}.`);
      }
      if (!lock.packages?.[`node_modules/${name}`]) {
        failures.push(`wissenpur/package-lock.json: Aufgelöster Eintrag node_modules/${name} fehlt.`);
      }
    }
  }
}

for (const packageName of removedTopLevelPackages) {
  if (lock.packages?.[`node_modules/${packageName}`]) {
    failures.push(
      `wissenpur/package-lock.json: Entferntes Alt-Paket ${packageName} liegt noch als Top-Level-Lockeintrag vor. Das Lockfile muss aus dem bereinigten Manifest neu erzeugt werden.`,
    );
  }
}

if (failures.length > 0) {
  console.error('\nWissenPur-Frontend-Lockfile ist nicht reproduzierbar:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error('\nRegeneriere wissenpur/package-lock.json aus dem aktuellen package.json und verwende danach wieder npm ci.\n');
  process.exit(1);
}

console.log('Frontend-Lockfile stimmt mit dem Manifest überein und enthält keine bekannten Top-Level-Alt-Pakete.');
