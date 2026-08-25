import type { AndroidManifestSlice, AndroidSlice } from '@expo-workspaces/android';
import type { IosPodsManifest, LocalPodDeclaration, RemotePodDeclaration } from '@expo-workspaces/ios-pods';
import type { IosSpmManifest, SpmLocalPackage, SpmRemotePackage } from '@expo-workspaces/ios-spm';
import type { IosTargetsManifest, TargetSpec } from '@expo-workspaces/ios-targets';
import type { IosXcodeManifest, SchemeDefinition, XcodeEnvSpec } from '@expo-workspaces/ios-xcode';
import type { PatchManifest } from '@expo-workspaces/patch';

export type {
  AndroidManifestSlice,
  IosPodsManifest,
  IosSpmManifest,
  IosTargetsManifest,
  IosXcodeManifest,
  PatchManifest,
};

/**
 * Canonical generator-facing manifest (flat). Prefer WorkspaceConfig for authoring.
 */
export type WorkspaceManifest = { manifestVersion: 1; schemaVersion?: 1 } & IosPodsManifest &
  IosXcodeManifest &
  IosTargetsManifest &
  IosSpmManifest &
  PatchManifest &
  AndroidManifestSlice;

export interface IOSWorkspaceConfig {
  deploymentTarget?: string;
  targetsRoot?: string;
  targets?: TargetSpec[];
  packages?: Array<SpmRemotePackage | SpmLocalPackage>;
  pods?: Array<LocalPodDeclaration | RemotePodDeclaration>;
  localPods?: LocalPodDeclaration[];
  remotePods?: RemotePodDeclaration[];
  podBuildSettings?: IosPodsManifest['podBuildSettings'];
  removePodBuildPhases?: IosPodsManifest['removePodBuildPhases'];
  schemes?: SchemeDefinition[];
  replaceExpoScheme?: boolean;
  xcode?: {
    env?: XcodeEnvSpec;
    buildSettings?: Record<string, string>;
  };
  xcodeEnv?: XcodeEnvSpec;
  fixExtensionEmbedCycle?: boolean;
  swiftPackages?: IosSpmManifest['swiftPackages'];
}

/**
 * Preferred public authoring shape (`workspace.config.ts`).
 * Flat WorkspaceManifest fields are still accepted and normalized.
 */
export type WorkspaceConfig = {
  schemaVersion?: 1;
  manifestVersion?: 1;
  ios?: IOSWorkspaceConfig;
  android?: AndroidSlice;
  patches?: PatchManifest['patches'];
} & Partial<WorkspaceManifest>;
