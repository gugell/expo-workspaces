import fs from 'fs';
import path from 'path';
import { IOSConfig } from '@expo/config-plugins';
import { XcodeProject } from '@bacons/xcode';

import type { NativeTargetRef, ResolvedNativeTargets } from './types';

// `@bacons/xcode/json` is an exports-map subpath; require it for classic resolution.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { build: buildPbxproj } = require('@bacons/xcode/json') as {
  build: (project: unknown) => string;
};

export interface OpenedProject {
  project: XcodeProject;
  pbxprojPath: string;
  xcodeprojPath: string;
  xcodeprojBasename: string;
  schemesDirectory: string;
}

export function openXcodeProject(appProjectRoot: string): OpenedProject {
  const pbxprojPath = IOSConfig.Paths.getPBXProjectPath(appProjectRoot);
  if (!fs.existsSync(pbxprojPath)) {
    throw new Error(
      `[expo-workspaces] PBX project not found at ${pbxprojPath}. Run "expo prebuild" for iOS first.`,
    );
  }
  const xcodeprojPath = IOSConfig.Paths.getXcodeProjectPath(appProjectRoot);
  const xcodeprojBasename = path.basename(xcodeprojPath);
  const schemesDirectory = path.join(xcodeprojPath, 'xcshareddata', 'xcschemes');

  return {
    project: XcodeProject.open(pbxprojPath),
    pbxprojPath,
    xcodeprojPath,
    xcodeprojBasename,
    schemesDirectory,
  };
}

export function serializeXcodeProject(project: XcodeProject): string {
  return buildPbxproj(project.toJSON());
}

function cleanName(value: unknown): string {
  return String(value ?? '').replace(/"/g, '');
}

function toRef(uuid: string, name: unknown, productName: unknown): NativeTargetRef {
  const cleanedName = cleanName(name);
  return { id: uuid, name: cleanedName, productName: cleanName(productName) || cleanedName };
}

/** Resolves the primary application target (and optional unit-test target). */
export function resolveNativeTargets(project: XcodeProject): ResolvedNativeTargets {
  const result: Partial<ResolvedNativeTargets> = {};

  const app = project.rootObject.getMainAppTarget('ios');
  if (app) {
    result.application = toRef(app.uuid, app.props.name, app.props.productName);
  }

  for (const target of project.rootObject.props.targets) {
    const productType = cleanName((target.props as { productType?: unknown }).productType);
    if (productType === 'com.apple.product-type.bundle.unit-test') {
      result.unitTest = toRef(
        target.uuid,
        (target.props as { name?: unknown }).name,
        (target.props as { productName?: unknown }).productName,
      );
    }
  }

  if (!result.application) {
    throw new Error(
      '[expo-workspaces] Could not find an iOS application target in the Xcode project.',
    );
  }
  return result as ResolvedNativeTargets;
}
