// Public manifest types for `expo-workspaces` (bundled, self-contained).
// Hand-curated to mirror the @expo-workspaces/* source slices without pulling
// in @bacons/xcode / @expo/config-plugins type graphs.

export type XcodeBuildConfiguration = 'Debug' | 'Release';

export interface NameMatcher {
  equals?: string;
  startsWith?: string;
  regex?: string;
}

// ─── iOS · CocoaPods ────────────────────────────────────────────────────────
export type PodTargetMatcher = NameMatcher;

export interface LocalPodDeclaration {
  pod: string;
  /** Path relative to the `ios/` directory (the Podfile). */
  path: string;
}

export interface RemotePodDeclaration {
  pod: string;
  version?: string;
  git?: string;
  branch?: string;
  tag?: string;
  commit?: string;
  configurations?: string[];
  modularHeaders?: boolean;
}

export interface PodBuildSettingsRule {
  target: string | PodTargetMatcher;
  settings: Record<string, string>;
  configurations?: XcodeBuildConfiguration[];
}

export interface PodRemoveBuildPhaseRule {
  target: string | PodTargetMatcher;
  phase: string;
}

export interface IosPodsManifest {
  localPods?: LocalPodDeclaration[];
  remotePods?: RemotePodDeclaration[];
  podBuildSettings?: PodBuildSettingsRule[];
  removePodBuildPhases?: PodRemoveBuildPhaseRule[];
}

// ─── iOS · Xcode ────────────────────────────────────────────────────────────
export interface SchemeDefinition {
  name: string;
  configuration: XcodeBuildConfiguration;
  archive?: XcodeBuildConfiguration;
  analyze?: XcodeBuildConfiguration;
  includeUnitTestTarget?: boolean;
}

export interface XcodeEnvSpec {
  exports?: Record<string, string>;
  lines?: string[];
}

export interface IosXcodeManifest {
  schemes?: SchemeDefinition[];
  replaceExpoScheme?: boolean;
  xcodeEnv?: XcodeEnvSpec;
  /** Reorder "Embed Foundation Extensions" after Resources. Default: true. */
  fixExtensionEmbedCycle?: boolean;
}

// ─── iOS · Native targets ───────────────────────────────────────────────────
export type TargetType = 'share' | 'widget' | 'clip';

export interface TargetSpec {
  /** Folder under targetsRoot AND the Xcode target name. */
  name: string;
  type: TargetType;
  /** Leading "." appends to the app id (".ShareExtension" => "<app>.ShareExtension"). */
  bundleIdentifier?: string;
  /** Default 18.0. */
  deploymentTarget?: string;
  entitlements?: Record<string, unknown>;
  frameworks?: string[];
  /** Default `${targetsRoot}/${name}`. */
  source?: string;
  /** Build settings applied to the target's Debug + Release configs. */
  buildSettings?: Record<string, string>;
  /**
   * CocoaPods dependencies for this target. Emitted as a `target '<name>' do … end`
   * block in the Podfile — a manifest-first alternative to `targets/<name>/pods.rb`.
   */
  pods?: TargetPod[];
}

export interface TargetPod {
  pod: string;
  /** Local pod path, relative to ios/. */
  path?: string;
  version?: string;
  git?: string;
  branch?: string;
  tag?: string;
  commit?: string;
  configurations?: string[];
  modularHeaders?: boolean;
}

export interface IosTargetsManifest {
  /** Default "./targets". */
  targetsRoot?: string;
  targets?: TargetSpec[];
}

// ─── iOS · Swift Package Manager ────────────────────────────────────────────
export type SwiftPackageRequirement =
  | { kind: 'upToNextMajorVersion'; minimumVersion: string }
  | { kind: 'upToNextMinorVersion'; minimumVersion: string }
  | { kind: 'versionRange'; minimumVersion: string; maximumVersion: string }
  | { kind: 'exactVersion'; version: string }
  | { kind: 'branch'; branch: string }
  | { kind: 'revision'; revision: string };

export interface SpmRemotePackage {
  url: string;
  requirement: SwiftPackageRequirement;
  products: string[];
  target?: string;
}

export interface SpmLocalPackage {
  path: string;
  products: string[];
  target?: string;
}

export interface IosSpmManifest {
  swiftPackages?: {
    remote?: SpmRemotePackage[];
    local?: SpmLocalPackage[];
  };
}

// ─── Source patching ────────────────────────────────────────────────────────
export type PatchFileBase = 'ios' | 'android' | 'project';

export interface BlockPatch {
  tag: string;
  anchor: string;
  regex?: boolean;
  offset?: number;
  comment?: string;
  contents: string;
  appendIfNoAnchor?: boolean;
}

export interface InsertPatch {
  anchor: string;
  regex?: boolean;
  text: string;
}

export interface ReplacePatch {
  find: string;
  regex?: boolean;
  all?: boolean;
  with: string;
}

export interface FilePatch {
  file: string;
  base?: PatchFileBase;
  block?: BlockPatch;
  insertAfter?: InsertPatch;
  insertBefore?: InsertPatch;
  replace?: ReplacePatch;
}

export interface PatchManifest {
  patches?: FilePatch[];
}

// ─── Android ────────────────────────────────────────────────────────────────
export interface AndroidSigningConfig {
  /** Keystore path relative to android/app. */
  storeFile: string;
  storePassword: string;
  keyAlias: string;
  keyPassword: string;
}

export interface AndroidSlice {
  minSdkVersion?: number;
  compileSdkVersion?: number;
  targetSdkVersion?: number;
  buildToolsVersion?: string;
  ndkVersion?: string;
  kotlinVersion?: string;
  gradleProperties?: Record<string, string | number | boolean>;
  permissions?: string[];
  dependencies?: string[];
  applicationAttributes?: Record<string, string>;
  signing?: AndroidSigningConfig;
}

export interface AndroidManifestSlice {
  android?: AndroidSlice;
}

// ─── Composed manifest ──────────────────────────────────────────────────────
export type WorkspaceManifest = { manifestVersion: 1 } & IosPodsManifest &
  IosXcodeManifest &
  IosTargetsManifest &
  IosSpmManifest &
  PatchManifest &
  AndroidManifestSlice;
