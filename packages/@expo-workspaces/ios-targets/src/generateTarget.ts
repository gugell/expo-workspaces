import path from 'path';
import {
  PBXBuildFile,
  PBXFileReference,
  PBXFileSystemSynchronizedBuildFileExceptionSet,
  PBXFileSystemSynchronizedRootGroup,
  PBXGroup,
  PBXNativeTarget,
  XcodeProject,
} from '@bacons/xcode';

import { createConfigurationListForType } from './configurationList';
import type { TargetType } from './types';

const PROTECTED_GROUP_NAME = 'expo:targets';

/** A fully-resolved target plan, computed at generate time and applied at finalized. */
export interface TargetPlan {
  type: TargetType;
  /** Display + Xcode target name. */
  name: string;
  /** Sanitized product name. */
  productName: string;
  productType: string;
  explicitFileType: string;
  isExtension: boolean;
  bundleId: string;
  deploymentTarget: string;
  /** Target dir relative to ios/ (e.g. "../targets/ShareExtension"). */
  cwd: string;
  currentProjectVersion: string | number;
  needsEmbeddedSwift: boolean;
  frameworks: string[];
  /** Filename of the entitlements file (relative to cwd), if any. */
  entitlementsFileName?: string;
  hasAppGroups: boolean;
  /** Files excluded from automatic target membership in the fs-synchronized group. */
  membershipExceptions: string[];
  /** Extra build settings applied to the target's Debug + Release configs. */
  buildSettings?: Record<string, string>;
}

export interface ProjectTargetSettings {
  /** Apple team id; falls back to any existing target's DEVELOPMENT_TEAM. */
  teamId?: string;
  marketingVersion: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

function setBuildSetting(target: unknown, key: string, value: string): void {
  (target as { setBuildSetting(k: string, v: string): void }).setBuildSetting(key, value);
}

function ensureProtectedGroup(project: XcodeProject, relativePath: string): PBXGroup {
  const mainGroup = project.rootObject.props.mainGroup as any;
  const existing = mainGroup
    .getChildGroups()
    .find((group: any) => group.getDisplayName() === PROTECTED_GROUP_NAME);
  if (existing) {
    return existing as PBXGroup;
  }
  const group = PBXGroup.create(project, {
    name: PROTECTED_GROUP_NAME,
    path: relativePath,
    sourceTree: '<group>',
  } as any);
  mainGroup.props.children.unshift(group);
  return group;
}

function applyDevelopmentTeamId(project: XcodeProject, teamId?: string): void {
  const devTeamId =
    teamId ||
    project.rootObject.props.targets
      .map((target) => (target as any).getDefaultBuildSetting?.('DEVELOPMENT_TEAM'))
      .find(Boolean);

  for (const target of project.rootObject.props.targets) {
    if (devTeamId) {
      setBuildSetting(target, 'DEVELOPMENT_TEAM', devTeamId);
    } else {
      (target as any).removeBuildSetting?.('DEVELOPMENT_TEAM');
    }
  }

  const attributes = (project.rootObject.props as any).attributes ?? {};
  attributes.TargetAttributes = attributes.TargetAttributes ?? {};
  for (const target of project.rootObject.props.targets) {
    if (!attributes.TargetAttributes[target.uuid]) {
      attributes.TargetAttributes[target.uuid] = {
        CreatedOnToolsVersion: '14.3',
        ProvisioningStyle: 'Automatic',
        DevelopmentTeam: devTeamId,
      };
    }
  }
  (project.rootObject.props as any).attributes = attributes;
}

function syncMarketingVersions(project: XcodeProject, marketingVersion: string): void {
  for (const target of project.rootObject.props.targets) {
    if (PBXNativeTarget.is(target)) {
      setBuildSetting(target, 'MARKETING_VERSION', marketingVersion);
    }
  }
}

/** Creates all planned native targets on the project, then syncs team id + marketing version. */
export function applyTargetsPbx(
  project: XcodeProject,
  plans: TargetPlan[],
  settings: ProjectTargetSettings,
): void {
  const mainAppTarget = project.rootObject.getMainAppTarget('ios');
  if (!mainAppTarget) {
    throw new Error('[expo-workspaces] Could not find the main iOS application target.');
  }

  for (const plan of plans) {
    if (plan.needsEmbeddedSwift) {
      setBuildSetting(mainAppTarget, 'ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES', 'YES');
    }

    const fileRef = PBXFileReference.create(project, {
      explicitFileType: plan.explicitFileType,
      includeInIndex: 0,
      path: plan.name + (plan.isExtension ? '.appex' : '.app'),
      sourceTree: 'BUILT_PRODUCTS_DIR',
    } as any);
    const buildFile = PBXBuildFile.create(project, {
      fileRef,
      settings: { ATTRIBUTES: ['RemoveHeadersOnCopy'] },
    } as any);
    (project.rootObject.ensureProductGroup().props.children as any).push(fileRef);

    const target = project.rootObject.createNativeTarget({
      buildConfigurationList: createConfigurationListForType(project, plan.type, {
        name: plan.name,
        cwd: plan.cwd,
        bundleId: plan.bundleId,
        deploymentTarget: plan.deploymentTarget,
        currentProjectVersion: plan.currentProjectVersion,
      }),
      name: plan.name,
      productName: plan.productName,
      productReference: fileRef,
      productType: plan.productType,
    } as any);

    const copyPhase = mainAppTarget.getCopyBuildPhaseForTarget(target);
    (copyPhase.props.files as any).push(buildFile);

    if (plan.entitlementsFileName) {
      setBuildSetting(target, 'CODE_SIGN_ENTITLEMENTS', `${plan.cwd}/${plan.entitlementsFileName}`);
      if (plan.hasAppGroups) {
        setBuildSetting(target, 'REGISTER_APP_GROUPS', 'YES');
      }
    }

    // Manifest-declared build settings override the generated defaults (both configs).
    if (plan.buildSettings) {
      for (const [key, value] of Object.entries(plan.buildSettings)) {
        setBuildSetting(target, key, value);
      }
    }

    target.ensureFrameworks(plan.frameworks);
    target.getSourcesBuildPhase();
    target.getResourcesBuildPhase();
    mainAppTarget.addDependency(target);

    const protectedGroup = ensureProtectedGroup(project, path.posix.dirname(plan.cwd));
    const exceptionSet = PBXFileSystemSynchronizedBuildFileExceptionSet.create(project, {
      target,
      membershipExceptions: plan.membershipExceptions,
    } as any);
    const syncGroup = PBXFileSystemSynchronizedRootGroup.create(project, {
      path: plan.name,
      exceptions: [exceptionSet],
      explicitFileTypes: {},
      explicitFolders: [],
      sourceTree: '<group>',
    } as any);
    (target.props as any).fileSystemSynchronizedGroups = [syncGroup];
    (protectedGroup.props.children as any).push(syncGroup);
  }

  applyDevelopmentTeamId(project, settings.teamId);
  syncMarketingVersions(project, settings.marketingVersion);
}
