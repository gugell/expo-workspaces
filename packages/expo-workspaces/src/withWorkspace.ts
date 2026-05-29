import { createWorkspace, fileExecutor } from '@expo-workspaces/core';
import { androidExecutor, androidGenerator } from '@expo-workspaces/android';
import { podsGenerator } from '@expo-workspaces/ios-pods';
import { spmGenerator } from '@expo-workspaces/ios-spm';
import { targetsGenerator } from '@expo-workspaces/ios-targets';
import {
  fixEmbedCycleGenerator,
  pbxExecutor,
  schemesGenerator,
  xcodeEnvGenerator,
} from '@expo-workspaces/ios-xcode';
import { patchExecutor, patchGenerator } from '@expo-workspaces/patch';

/**
 * The composed workspace plugin.
 *
 * Generator order is load-bearing for pbx ops: targets → spm → schemes → fixEmbedCycle
 * (target creation before schemes read targets; embed reorder runs last).
 */
export const withWorkspace = createWorkspace({
  generators: [
    podsGenerator,
    targetsGenerator,
    spmGenerator,
    xcodeEnvGenerator,
    schemesGenerator,
    fixEmbedCycleGenerator,
    patchGenerator,
    androidGenerator,
  ],
  executors: [fileExecutor, patchExecutor, androidExecutor, pbxExecutor],
});
