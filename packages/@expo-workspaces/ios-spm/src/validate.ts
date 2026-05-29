import { ERR } from '@expo-workspaces/core';

import type { SpmLocalPackage, SpmRemotePackage, SwiftPackageRequirement } from './types';

const REQUIREMENT_KINDS = new Set([
  'upToNextMajorVersion',
  'upToNextMinorVersion',
  'versionRange',
  'exactVersion',
  'branch',
  'revision',
]);

function assertRequirement(req: SwiftPackageRequirement | undefined, label: string): void {
  if (!req || typeof req !== 'object' || !REQUIREMENT_KINDS.has((req as { kind?: string }).kind ?? '')) {
    throw new Error(
      `${ERR} ${label}.requirement.kind must be one of ${[...REQUIREMENT_KINDS].join(', ')}.`,
    );
  }
}

function assertProducts(products: unknown, label: string): void {
  if (!Array.isArray(products) || products.length === 0 || products.some((p) => typeof p !== 'string' || !p.trim())) {
    throw new Error(`${ERR} ${label}.products must be a non-empty array of product names.`);
  }
}

export function normalizeRemotePackages(packages: SpmRemotePackage[] | undefined): SpmRemotePackage[] {
  if (!Array.isArray(packages) || packages.length === 0) {
    return [];
  }
  return packages.map((pkg, index) => {
    if (!pkg?.url?.trim()) {
      throw new Error(`${ERR} swiftPackages.remote[${index}] requires a "url".`);
    }
    assertRequirement(pkg.requirement, `swiftPackages.remote[${index}]`);
    assertProducts(pkg.products, `swiftPackages.remote[${index}]`);
    return { ...pkg, url: pkg.url.trim() };
  });
}

export function normalizeLocalPackages(packages: SpmLocalPackage[] | undefined): SpmLocalPackage[] {
  if (!Array.isArray(packages) || packages.length === 0) {
    return [];
  }
  return packages.map((pkg, index) => {
    if (!pkg?.path?.trim()) {
      throw new Error(`${ERR} swiftPackages.local[${index}] requires a "path".`);
    }
    assertProducts(pkg.products, `swiftPackages.local[${index}]`);
    return { ...pkg, path: pkg.path.trim() };
  });
}
