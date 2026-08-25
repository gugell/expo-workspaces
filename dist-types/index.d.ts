// Public type surface for the bundled `expo-workspaces` package.
import type {
  AndroidLibraryDependency,
  AndroidUsesFeature,
  GradleConfiguration,
  SpmLocalPackage,
  SpmRemotePackage,
  TargetSpec,
  WorkspaceConfig,
  WorkspaceManifest,
} from './types';
import type { SchemeDefinition } from './types';

export * from './types';

export declare function defineWorkspace<T extends WorkspaceConfig | WorkspaceManifest>(config: T): T;
export declare function shareExtension(spec: Omit<TargetSpec, 'type'>): TargetSpec;
export declare function widgetExtension(spec: Omit<TargetSpec, 'type'>): TargetSpec;
export declare function appClip(spec: Omit<TargetSpec, 'type'>): TargetSpec;
export declare function swiftPackage(spec: SpmRemotePackage): SpmRemotePackage;
export declare function localSwiftPackage(spec: SpmLocalPackage): SpmLocalPackage;
export declare function scheme(spec: SchemeDefinition): SchemeDefinition;
export declare function androidLibrary(
  module: string,
  configuration?: GradleConfiguration,
): AndroidLibraryDependency;
export declare function androidFeature(name: string, required?: boolean): AndroidUsesFeature;

export interface WithWorkspaceProps {
  /** Path to the workspace config, relative to the app root. */
  configPath?: string;
  /** @deprecated Use configPath. */
  manifestPath?: string;
}

/** The composed Expo config plugin. */
export declare const withWorkspace: (config: any, props?: WithWorkspaceProps) => any;

declare const plugin: (config: any, props?: WithWorkspaceProps) => any;
export default plugin;
