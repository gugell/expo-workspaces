import { createRunOncePlugin } from '@expo/config-plugins';

import { defineWorkspace } from './defineWorkspace';
import { withWorkspace } from './withWorkspace';

const plugin = createRunOncePlugin(withWorkspace, 'expo-workspaces', '1.0.0');

export default plugin;
export { withWorkspace, defineWorkspace };
export type {
  WorkspaceManifest,
  IosPodsManifest,
  IosXcodeManifest,
  IosTargetsManifest,
  IosSpmManifest,
  PatchManifest,
  AndroidManifestSlice,
} from './types';
