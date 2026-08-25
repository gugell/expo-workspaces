import fs from 'fs';
import path from 'path';

import { normalizeWorkspaceConfig } from './normalize';
import type { RawManifest } from './types';
import { ERR } from './validation';

export const DEFAULT_CONFIG_FILENAMES = [
  'workspace.config.ts',
  'workspace.config.js',
  'workspace.config.mjs',
  'workspace.config.cjs',
  'workspace.manifest.ts',
  'workspace.manifest.js',
] as const;

/** @deprecated Use DEFAULT_CONFIG_FILENAMES. Kept for existing plugin option docs. */
export const DEFAULT_MANIFEST_FILENAME = 'workspace.manifest.js';

export interface LoadedWorkspaceConfig {
  manifest: RawManifest;
  configPath: string;
  /** Filename as authored, for diagnostics. */
  loadedAs: string;
}

export function resolveConfigPath(projectRoot: string, configPath?: string): string {
  if (configPath) {
    return path.resolve(projectRoot, configPath);
  }
  for (const name of DEFAULT_CONFIG_FILENAMES) {
    const candidate = path.resolve(projectRoot, name);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return path.resolve(projectRoot, DEFAULT_CONFIG_FILENAMES[0]);
}

export function loadWorkspaceConfig(
  projectRoot: string,
  configPath?: string,
): LoadedWorkspaceConfig {
  const resolved = resolveConfigPath(projectRoot, configPath);
  if (!fs.existsSync(resolved)) {
    const searched = configPath
      ? resolved
      : DEFAULT_CONFIG_FILENAMES.map((name) => path.join(projectRoot, name)).join(', ');
    throw new Error(
      `${ERR} Workspace config not found. Looked for: ${searched}. ` +
        `Create workspace.config.ts at the app root, or set the "configPath" plugin option.`,
    );
  }

  const exported = loadModule(resolved);
  const manifest = normalizeWorkspaceConfig(exported);
  return {
    manifest,
    configPath: resolved,
    loadedAs: path.basename(resolved),
  };
}

function loadModule(filePath: string): unknown {
  const ext = path.extname(filePath).toLowerCase();
  try {
    if (ext === '.ts' || ext === '.mts' || ext === '.tsx') {
      return unwrapDefault(loadTypeScript(filePath));
    }
    delete require.cache[require.resolve(filePath)];
    return unwrapDefault(require(filePath));
  } catch (error) {
    throw new Error(`${ERR} Failed to load config ${filePath}: ${(error as Error).message}`);
  }
}

function unwrapDefault(mod: unknown): unknown {
  if (mod && typeof mod === 'object' && 'default' in (mod as { default?: unknown })) {
    const def = (mod as { default?: unknown }).default;
    if (def !== undefined) {
      return def;
    }
  }
  return mod;
}

function loadTypeScript(filePath: string): unknown {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jiti = require('jiti') as (id: string, opts?: object) => (id: string) => unknown;
  return jiti(__filename, {
    interopDefault: true,
    alias: {
      'expo-workspaces': resolvePackageRoot(),
    },
  })(filePath);
}

function resolvePackageRoot(): string {
  try {
    return path.dirname(require.resolve('expo-workspaces/package.json'));
  } catch {
    return path.resolve(__dirname, '..');
  }
}
