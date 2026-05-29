import {
  PBXBuildFile,
  PBXNativeTarget,
  XCLocalSwiftPackageReference,
  XCRemoteSwiftPackageReference,
  XCSwiftPackageProductDependency,
  XcodeProject,
} from '@bacons/xcode';
import type { Generator } from '@expo-workspaces/core';
import { pbxOp } from '@expo-workspaces/ios-xcode';

import type { SpmLocalPackage, SpmRemotePackage } from '../types';
import { normalizeLocalPackages, normalizeRemotePackages } from '../validate';

/* eslint-disable @typescript-eslint/no-explicit-any */

function findTarget(project: XcodeProject, name?: string): PBXNativeTarget {
  if (name) {
    const match = project.rootObject.props.targets.find(
      (t) => PBXNativeTarget.is(t) && (t.props as any).name === name,
    );
    if (!match) {
      throw new Error(`[expo-workspaces] swiftPackages: target "${name}" not found.`);
    }
    return match as PBXNativeTarget;
  }
  const app = project.rootObject.getMainAppTarget('ios');
  if (!app) {
    throw new Error('[expo-workspaces] swiftPackages: no main app target found.');
  }
  return app;
}

function addPackageReference(project: XcodeProject, ref: { uuid: string }): void {
  const root = project.rootObject.props as any;
  root.packageReferences = root.packageReferences ?? [];
  root.packageReferences.push(ref);
}

function linkProducts(
  project: XcodeProject,
  pkgRef: any,
  products: string[],
  targetName: string | undefined,
): void {
  const target = findTarget(project, targetName);
  const targetProps = target.props as any;
  targetProps.packageProductDependencies = targetProps.packageProductDependencies ?? [];

  for (const productName of products) {
    const dependency = XCSwiftPackageProductDependency.create(project, {
      package: pkgRef,
      productName,
    } as any);
    targetProps.packageProductDependencies.push(dependency);

    const buildFile = PBXBuildFile.create(project, { productRef: dependency } as any);
    (target.getFrameworksBuildPhase().props.files as any).push(buildFile);
  }
}

export const spmGenerator: Generator = {
  name: 'swiftPackages',
  generate({ manifest }) {
    const slice = (manifest as { swiftPackages?: { remote?: SpmRemotePackage[]; local?: SpmLocalPackage[] } })
      .swiftPackages;
    if (!slice) {
      return { ops: [] };
    }
    const remote = normalizeRemotePackages(slice.remote);
    const local = normalizeLocalPackages(slice.local);
    if (remote.length === 0 && local.length === 0) {
      return { ops: [] };
    }

    return {
      ops: [
        pbxOp('swiftPackages', ({ project }) => {
          for (const pkg of remote) {
            const ref = XCRemoteSwiftPackageReference.create(project, {
              repositoryURL: pkg.url,
              requirement: pkg.requirement,
            } as any);
            addPackageReference(project, ref);
            linkProducts(project, ref, pkg.products, pkg.target);
          }
          for (const pkg of local) {
            const ref = XCLocalSwiftPackageReference.create(project, {
              relativePath: pkg.path,
            } as any);
            addPackageReference(project, ref);
            linkProducts(project, ref, pkg.products, pkg.target);
          }
        }),
      ],
    };
  },
};
