import type { XcodeBuildConfiguration } from '@expo-workspaces/core';

export type { XcodeBuildConfiguration };

export interface SchemeDefinition {
  /** Xcode scheme display name (also used as the `.xcscheme` filename). */
  name: string;
  configuration: XcodeBuildConfiguration;
  archive?: XcodeBuildConfiguration;
  analyze?: XcodeBuildConfiguration;
  /** Include a TestAction with the unit-test target (if present). Default: false. */
  includeUnitTestTarget?: boolean;
}

export interface XcodeEnvSpec {
  exports?: Record<string, string>;
  lines?: string[];
}

export interface NativeTargetRef {
  id: string;
  name: string;
  productName: string;
}

export interface ResolvedNativeTargets {
  application: NativeTargetRef;
  unitTest?: NativeTargetRef;
}

/** The manifest slice this package consumes. */
export interface IosXcodeManifest {
  schemes?: SchemeDefinition[];
  replaceExpoScheme?: boolean;
  xcodeEnv?: XcodeEnvSpec;
  /** Reorder "Embed Foundation Extensions" after Resources. Default: true. */
  fixExtensionEmbedCycle?: boolean;
}

/** Defaults aligned with current Expo prebuild scheme output. */
export const SCHEME_TEMPLATE_DEFAULTS = {
  lastUpgradeVersion: '1130',
  schemeVersion: '1.7',
} as const;
