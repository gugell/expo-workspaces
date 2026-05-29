// Public type surface for the bundled `expo-workspaces` package.
import type { WorkspaceManifest } from './types';

export * from './types';

/** Identity helper for authoring `workspace.manifest.js` with autocomplete. */
export declare function defineWorkspace(manifest: WorkspaceManifest): WorkspaceManifest;

export interface WithWorkspaceProps {
  /** Path to the manifest, relative to the app root. Defaults to `workspace.manifest.js`. */
  manifestPath?: string;
}

/** The composed Expo config plugin. */
export declare const withWorkspace: (config: any, props?: WithWorkspaceProps) => any;

declare const plugin: (config: any, props?: WithWorkspaceProps) => any;
export default plugin;
