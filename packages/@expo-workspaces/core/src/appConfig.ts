import fs from 'fs';
import path from 'path';

import type { WorkspaceAppConfig } from './types';

/**
 * Best-effort Expo config load for CLI workflows that do not run prebuild.
 * Prefers @expo/config when installed; falls back to app.json / app.config.js.
 */
export function loadAppConfig(projectRoot: string): WorkspaceAppConfig {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { getConfig } = require('@expo/config') as {
      getConfig: (root: string, opts?: object) => { exp: WorkspaceAppConfig };
    };
    return getConfig(projectRoot, { skipSDKVersionRequirement: true }).exp;
  } catch {
    // fall through
  }

  for (const name of ['app.json', 'app.config.json']) {
    const file = path.join(projectRoot, name);
    if (!fs.existsSync(file)) continue;
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8')) as { expo?: WorkspaceAppConfig } & WorkspaceAppConfig;
    return parsed.expo ?? parsed;
  }

  for (const name of ['app.config.js', 'app.config.cjs']) {
    const file = path.join(projectRoot, name);
    if (!fs.existsSync(file)) continue;
    delete require.cache[require.resolve(file)];
    const mod = require(file) as { default?: unknown } | ((cfg: object) => unknown);
    const value = typeof mod === 'function' ? mod({ projectRoot }) : ((mod as { default?: unknown }).default ?? mod);
    const obj = value as { expo?: WorkspaceAppConfig } & WorkspaceAppConfig;
    return obj.expo ?? obj;
  }

  return { name: path.basename(projectRoot) };
}
