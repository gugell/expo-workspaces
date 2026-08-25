import { DEFAULT_MANIFEST_FILENAME, loadWorkspaceConfig, resolveConfigPath } from './loadConfig';
import type { RawManifest } from './types';

/** @deprecated Use resolveConfigPath. */
export function resolveManifestPath(projectRoot: string, manifestPath?: string): string {
  return resolveConfigPath(projectRoot, manifestPath);
}

/**
 * Locates and loads the workspace config, then returns the canonical (flat)
 * manifest generators already know. TypeScript configs are supported.
 */
export function loadManifest(projectRoot: string, manifestPath?: string): RawManifest {
  return loadWorkspaceConfig(projectRoot, manifestPath).manifest;
}

export { DEFAULT_MANIFEST_FILENAME };
