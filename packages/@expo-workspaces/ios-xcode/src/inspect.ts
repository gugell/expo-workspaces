import fs from 'fs';
import path from 'path';

import { PBXNativeTarget, XcodeProject } from '@bacons/xcode';

export interface InspectedXcodeProject {
  targets: string[];
  swiftPackages: string[];
  schemes: string[];
}

/**
 * Read native target names, SPM URLs, and shared schemes from an already
 * generated `ios/` directory. Uses the same `@bacons/xcode` parser as generators
 * rather than pbxproj regex.
 */
export function inspectXcodeProject(iosDir: string): InspectedXcodeProject {
  const empty: InspectedXcodeProject = { targets: [], swiftPackages: [], schemes: [] };
  if (!fs.existsSync(iosDir)) return empty;

  const xcodeproj = fs.readdirSync(iosDir).find((name) => name.endsWith('.xcodeproj'));
  if (!xcodeproj) return empty;

  const xcodeprojPath = path.join(iosDir, xcodeproj);
  const pbxprojPath = path.join(xcodeprojPath, 'project.pbxproj');
  if (!fs.existsSync(pbxprojPath)) return empty;

  const project = XcodeProject.open(pbxprojPath);
  const targets: string[] = [];
  for (const target of project.rootObject.props.targets ?? []) {
    if (!PBXNativeTarget.is(target)) continue;
    const name = String((target.props as { name?: unknown }).name ?? '').replace(/"/g, '');
    if (name && !targets.includes(name)) targets.push(name);
  }

  const swiftPackages: string[] = [];
  const refs = (project.rootObject.props as { packageReferences?: unknown }).packageReferences;
  if (Array.isArray(refs)) {
    for (const ref of refs) {
      const url = packageReferenceUrl(ref);
      if (url && !swiftPackages.includes(url)) swiftPackages.push(url);
    }
  }

  const schemesDir = path.join(xcodeprojPath, 'xcshareddata', 'xcschemes');
  const schemes = fs.existsSync(schemesDir)
    ? fs
        .readdirSync(schemesDir)
        .filter((name) => name.endsWith('.xcscheme'))
        .map((name) => name.replace(/\.xcscheme$/, ''))
    : [];

  return { targets, swiftPackages, schemes };
}

function packageReferenceUrl(ref: unknown): string | undefined {
  if (!ref || typeof ref !== 'object') return undefined;
  const props = (ref as { props?: Record<string, unknown> }).props;
  const url = props?.repositoryURL;
  return typeof url === 'string' && url.length > 0 ? url : undefined;
}
