import {
  androidFeature as feature,
  androidLibrary as library,
} from '@expo-workspaces/android';
import type { AndroidLibraryDependency, AndroidUsesFeature, GradleConfiguration } from '@expo-workspaces/android';
import type { SpmLocalPackage, SpmRemotePackage } from '@expo-workspaces/ios-spm';
import type { TargetSpec } from '@expo-workspaces/ios-targets';
import type { SchemeDefinition } from '@expo-workspaces/ios-xcode';

import type { WorkspaceConfig, WorkspaceManifest } from './types';

/**
 * Identity helper for `workspace.config.ts` / `workspace.manifest.js`.
 * No-op at runtime; exists for TypeScript autocomplete.
 */
export function defineWorkspace<T extends WorkspaceConfig | WorkspaceManifest>(config: T): T {
  return config;
}

export function shareExtension(spec: Omit<TargetSpec, 'type'>): TargetSpec {
  return { ...spec, type: 'share' };
}

export function widgetExtension(spec: Omit<TargetSpec, 'type'>): TargetSpec {
  return { ...spec, type: 'widget' };
}

export function appClip(spec: Omit<TargetSpec, 'type'>): TargetSpec {
  return { ...spec, type: 'clip' };
}

export function swiftPackage(spec: SpmRemotePackage): SpmRemotePackage {
  return spec;
}

export function localSwiftPackage(spec: SpmLocalPackage): SpmLocalPackage {
  return spec;
}

export function scheme(spec: SchemeDefinition): SchemeDefinition {
  return spec;
}

export function androidLibrary(
  module: string,
  configuration: GradleConfiguration = 'implementation',
): AndroidLibraryDependency {
  return library(module, configuration);
}

export function androidFeature(name: string, required = true): AndroidUsesFeature {
  return feature(name, required);
}
