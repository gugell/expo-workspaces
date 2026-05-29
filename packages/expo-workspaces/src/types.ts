import type { AndroidManifestSlice } from '@expo-workspaces/android';
import type { IosPodsManifest } from '@expo-workspaces/ios-pods';
import type { IosSpmManifest } from '@expo-workspaces/ios-spm';
import type { IosTargetsManifest } from '@expo-workspaces/ios-targets';
import type { IosXcodeManifest } from '@expo-workspaces/ios-xcode';
import type { PatchManifest } from '@expo-workspaces/patch';

/**
 * The composed workspace manifest — the intersection of every capability's slice.
 * Authored in `workspace.manifest.js` (CommonJS), `require()`d at prebuild time.
 */
export type WorkspaceManifest = { manifestVersion: 1 } & IosPodsManifest &
  IosXcodeManifest &
  IosTargetsManifest &
  IosSpmManifest &
  PatchManifest &
  AndroidManifestSlice;

export type {
  IosPodsManifest,
  IosXcodeManifest,
  IosTargetsManifest,
  IosSpmManifest,
  PatchManifest,
  AndroidManifestSlice,
};
