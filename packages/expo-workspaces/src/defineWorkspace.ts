import type { WorkspaceManifest } from './types';

/**
 * Identity helper for authoring `workspace.manifest.js` with editor autocomplete.
 * No-op at runtime.
 *
 *   const { defineWorkspace } = require('expo-workspaces');
 *   module.exports = defineWorkspace({ manifestVersion: 1, ... });
 */
export function defineWorkspace(manifest: WorkspaceManifest): WorkspaceManifest {
  return manifest;
}
