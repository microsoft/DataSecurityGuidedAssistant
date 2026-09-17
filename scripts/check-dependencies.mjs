#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
const lockfile = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'));
const approvedRegistryPrefix =
  'https://ms-feed-25.pkgs.visualstudio.com/1es-public/_packaging/npm-public/npm/registry/';
const failures = [];
const algorithms = new Map();
let resolvedCount = 0;
let packageCount = 0;

if (lockfile.lockfileVersion !== 3) {
  failures.push(`package-lock.json must use lockfileVersion 3; found ${lockfile.lockfileVersion}.`);
}

const rootPackage = lockfile.packages?.[''];
if (!rootPackage) {
  failures.push('package-lock.json is missing its root package entry.');
} else {
  const manifestDependencies = JSON.stringify(packageJson.dependencies ?? {});
  const lockedDependencies = JSON.stringify(rootPackage.dependencies ?? {});
  const manifestDevDependencies = JSON.stringify(packageJson.devDependencies ?? {});
  const lockedDevDependencies = JSON.stringify(rootPackage.devDependencies ?? {});

  if (manifestDependencies !== lockedDependencies) {
    failures.push('package.json dependencies do not match the package-lock.json root entry.');
  }
  if (manifestDevDependencies !== lockedDevDependencies) {
    failures.push('package.json devDependencies do not match the package-lock.json root entry.');
  }
}

for (const [path, entry] of Object.entries(lockfile.packages ?? {})) {
  if (!path) {
    continue;
  }

  packageCount += 1;
  if (!entry.resolved) {
    failures.push(`${path} has no resolved package URL.`);
  } else {
    resolvedCount += 1;
    if (!entry.resolved.startsWith(approvedRegistryPrefix)) {
      failures.push(`${path} resolves from an unapproved registry: ${entry.resolved}`);
    }
  }

  if (!entry.integrity) {
    failures.push(`${path} has no integrity value.`);
    continue;
  }

  const match = /^([a-z0-9]+)-[A-Za-z0-9+/]+={0,2}$/.exec(entry.integrity);
  if (!match) {
    failures.push(`${path} has a malformed integrity value.`);
    continue;
  }

  algorithms.set(match[1], (algorithms.get(match[1]) ?? 0) + 1);
}

console.log(`Lockfile packages: ${packageCount}`);
console.log(`Approved-registry resolutions: ${resolvedCount}/${packageCount}`);
console.log('Integrity algorithms:');
for (const [algorithm, count] of [...algorithms].sort()) {
  console.log(`  ${algorithm}: ${count}`);
}

const sha1Count = algorithms.get('sha1') ?? 0;
if (sha1Count > 0) {
  console.warn(
    `KNOWN FEED ISSUE: ${sha1Count} package(s) use SHA-1 integrity values supplied by the approved internal feed.`
  );
  console.warn('This check reports but does not rewrite or fail those entries.');
}

if (failures.length > 0) {
  console.error('Dependency policy failures:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('Dependency policy checks PASSED.');
