import fs from 'fs';
import path from 'path';

import type { RawManifest } from './types';

const ERR = '[expo-workspaces]';

export const DEFAULT_MANIFEST_FILENAME = 'workspace.manifest.js';

export function resolveManifestPath(projectRoot: string, manifestPath?: string): string {
  return path.resolve(projectRoot, manifestPath ?? DEFAULT_MANIFEST_FILENAME);
}

/**
 * Locates and `require()`s the CommonJS workspace manifest. No TS loader — the
 * manifest must be plain `.js` (CommonJS).
 */
export function loadManifest(projectRoot: string, manifestPath?: string): RawManifest {
  const resolved = resolveManifestPath(projectRoot, manifestPath);

  if (!fs.existsSync(resolved)) {
    throw new Error(
      `${ERR} Manifest not found at ${resolved}. ` +
        `Create "${DEFAULT_MANIFEST_FILENAME}" at the app root, or set the "manifestPath" plugin option.`,
    );
  }

  let mod: unknown;
  try {
    delete require.cache[require.resolve(resolved)];
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require(resolved);
  } catch (error) {
    throw new Error(`${ERR} Failed to require manifest ${resolved}: ${(error as Error).message}`);
  }

  const manifest = (mod as { default?: unknown })?.default ?? mod;
  if (!manifest || typeof manifest !== 'object') {
    throw new Error(
      `${ERR} Manifest at ${resolved} must export an object (received ${typeof manifest}).`,
    );
  }

  const raw = manifest as RawManifest;
  if (raw.manifestVersion !== 1) {
    throw new Error(`${ERR} Unsupported "manifestVersion": ${String(raw.manifestVersion)}. Expected 1.`);
  }
  return raw;
}
