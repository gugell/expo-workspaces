import { createRunOncePlugin } from '@expo/config-plugins';

import { defineWorkspace } from './helpers';
import { withWorkspace } from './withWorkspace';

const plugin = createRunOncePlugin(withWorkspace, 'expo-workspaces', '0.1.0');

export default plugin;
export { withWorkspace };
export {
  defineWorkspace,
  shareExtension,
  widgetExtension,
  appClip,
  swiftPackage,
  localSwiftPackage,
  scheme,
  androidLibrary,
  androidFeature,
} from './helpers';
export type { WorkspaceManifest, WorkspaceConfig, IOSWorkspaceConfig, AndroidSlice } from './types';
export type {
  IosPodsManifest,
  IosXcodeManifest,
  IosTargetsManifest,
  IosSpmManifest,
  PatchManifest,
  AndroidManifestSlice,
} from './types';
