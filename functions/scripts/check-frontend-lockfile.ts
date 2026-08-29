import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const repoRoot = resolve(currentDir, '../..');

type Manifest = {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type Lockfile = {
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

type Workspace = {
  label: string;
  manifestPath: string;
  lockPath: string;
  removedTopLevelPackages?: readonly string[];
};

const workspaces: Workspace[] = [
  {
    label: 'Frontend',
    manifestPath: 'wissenpur/package.json',
    lockPath: 'wissenpur/package-lock.json',
    removedTopLevelPackages: [
      '@google/genai',
      '@types/express',
      'autoprefixer',
      'dotenv',
      'express',
      'tsx',
    ],
  },
  {
    label: 'Functions',
    manifestPath: 'functions/package.json',
    lockPath: 'functions/package-lock.json',
  },
  {
    label: 'Firestore-Regeltests',
    manifestPath: 'rules-tests/package.json',
    lockPath: 'rules-tests/package-lock.json',
  },
];

const failures: string[] = [];

async function readJson<T>(relativePath: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(resolve(repoRoot, relativePath), 'utf8')) as T;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return null;
    throw error;
  }
}

for (const workspace of workspaces) {
  const manifest = await readJson<Manifest>(workspace.manifestPath);
  if (!manifest) {
    failures.push(`${workspace.manifestPath}: Manifest fehlt.`);
    continue;
  }

  const lock = await readJson<Lockfile>(workspace.lockPath);
  if (!lock) {
    failures.push(
      `${workspace.lockPath}: Lockfile fehlt. Erzeuge es mit der freigegebenen Toolchain Node 22.12.0 / npm 10.9.2.`,
    );
    continue;
  }

  const root = lock.packages?.[''];
  if (lock.lockfileVersion !== 3) {
    failures.push(`${workspace.lockPath}: lockfileVersion ${String(lock.lockfileVersion)} statt 3.`);
  }
  if (!root) {
    failures.push(`${workspace.lockPath}: Root-Paket fehlt unter packages[""].`);
    continue;
  }

  if (lock.name !== manifest.name || root.name !== manifest.name) {
    failures.push(
      `${workspace.lockPath}: Paketname ist nicht mit ${workspace.manifestPath} synchron (${String(lock.name)} / ${String(root.name)}).`,
    );
  }
  if (lock.version !== manifest.version || root.version !== manifest.version) {
    failures.push(
      `${workspace.lockPath}: Version ist nicht mit ${workspace.manifestPath} synchron (${String(lock.version)} / ${String(root.version)}).`,
    );
  }

  for (const section of ['dependencies', 'devDependencies'] as const) {
    const expected = manifest[section] || {};
    const locked = root[section] || {};
    const expectedNames = Object.keys(expected).sort();
    const lockedNames = Object.keys(locked).sort();

    if (JSON.stringify(expectedNames) !== JSON.stringify(lockedNames)) {
      failures.push(
        `${workspace.lockPath}: ${section} enthält andere direkte Pakete als ${workspace.manifestPath}. Erwartet: ${expectedNames.join(', ')}. Lock: ${lockedNames.join(', ')}.`,
      );
    }

    for (const [name, version] of Object.entries(expected)) {
      if (locked[name] !== version) {
        failures.push(`${workspace.lockPath}: ${section}.${name} ist ${String(locked[name])} statt ${version}.`);
      }
      if (!lock.packages?.[`node_modules/${name}`]) {
        failures.push(`${workspace.lockPath}: Aufgelöster Eintrag node_modules/${name} fehlt.`);
      }
    }
  }

  for (const packageName of workspace.removedTopLevelPackages || []) {
    if (lock.packages?.[`node_modules/${packageName}`]) {
      failures.push(
        `${workspace.lockPath}: Entferntes Alt-Paket ${packageName} liegt noch als Top-Level-Lockeintrag vor. Das Lockfile muss aus dem bereinigten Manifest neu erzeugt werden.`,
      );
    }
  }
}

if (failures.length > 0) {
  console.error('\nWissenPur-Package-Lockfiles sind nicht vollständig reproduzierbar:\n');
  for (const failure of failures) console.error(`- ${failure}`);
  console.error(
    '\nErzeuge alle drei package-lock.json mit Node 22.12.0 und npm 10.9.2 neu. Stelle die drei CI-Installationen erst danach gemeinsam auf npm ci um.\n',
  );
  process.exit(1);
}

console.log('Frontend-, Functions- und Rules-Test-Lockfiles stimmen mit ihren Manifesten überein.');
