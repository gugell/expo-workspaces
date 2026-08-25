import fs from 'fs';
import path from 'path';

import { inspectXcodeProject } from '@expo-workspaces/ios-xcode';

export interface MigrationReport {
  present: boolean;
  targets: string[];
  swiftPackages: string[];
  schemes: string[];
  appGroups: string[];
  permissions: string[];
  features: string[];
  dependencies: string[];
  gradleSdk: Record<string, string>;
  unknown: string[];
  confidence: Record<string, number>;
}

export function inspectNativeProject(projectRoot: string): MigrationReport {
  const iosDir = path.join(projectRoot, 'ios');
  const androidDir = path.join(projectRoot, 'android');
  const present = fs.existsSync(iosDir) || fs.existsSync(androidDir);

  const report: MigrationReport = {
    present,
    targets: [],
    swiftPackages: [],
    schemes: [],
    appGroups: [],
    permissions: [],
    features: [],
    dependencies: [],
    gradleSdk: {},
    unknown: [],
    confidence: {},
  };

  if (fs.existsSync(iosDir)) {
    inspectIos(iosDir, report);
  }
  if (fs.existsSync(androidDir)) {
    inspectAndroid(androidDir, report);
  }
  return report;
}

function inspectIos(iosDir: string, report: MigrationReport): void {
  const xcodeproj = fs.readdirSync(iosDir).find((name) => name.endsWith('.xcodeproj'));
  if (!xcodeproj) {
    report.unknown.push('ios/ exists but no .xcodeproj was found');
    return;
  }

  const inspected = inspectXcodeProject(iosDir);
  report.targets = inspected.targets;
  report.swiftPackages = inspected.swiftPackages;
  report.schemes = inspected.schemes;
  for (const url of inspected.swiftPackages) {
    report.confidence[url] = 0.9;
  }

  const entitlements = walkFiles(iosDir, (file) => file.endsWith('.entitlements'));
  for (const file of entitlements) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/group\.[A-Za-z0-9.]+/g)) {
      if (!report.appGroups.includes(match[0])) report.appGroups.push(match[0]);
    }
  }

  report.confidence.targets = report.targets.length ? 0.85 : 0;
  report.confidence.schemes = report.schemes.length ? 0.85 : 0;
}

function inspectAndroid(androidDir: string, report: MigrationReport): void {
  const manifest = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
  if (fs.existsSync(manifest)) {
    const text = fs.readFileSync(manifest, 'utf8');
    for (const match of text.matchAll(/<uses-permission\b[^>]*android:name="([^"]+)"/g)) {
      if (!report.permissions.includes(match[1])) report.permissions.push(match[1]);
    }
    for (const match of text.matchAll(/<uses-feature\b[^>]*android:name="([^"]+)"/g)) {
      if (!report.features.includes(match[1])) report.features.push(match[1]);
    }
    report.confidence.permissions = report.permissions.length ? 0.8 : 0;
    report.confidence.features = report.features.length ? 0.8 : 0;
  }

  const gradle = path.join(androidDir, 'gradle.properties');
  if (fs.existsSync(gradle)) {
    const text = fs.readFileSync(gradle, 'utf8');
    for (const match of text.matchAll(/^(android\.(?:minSdkVersion|compileSdkVersion|targetSdkVersion|buildToolsVersion|ndkVersion|kotlinVersion))=(.+)$/gm)) {
      report.gradleSdk[match[1]] = match[2].trim();
    }
    if (Object.keys(report.gradleSdk).length) {
      report.confidence.gradleSdk = 0.9;
    }
  }

  const appGradle = path.join(androidDir, 'app', 'build.gradle');
  if (fs.existsSync(appGradle)) {
    const text = fs.readFileSync(appGradle, 'utf8');
    for (const match of text.matchAll(
      /^\s*(implementation|api|compileOnly|runtimeOnly|debugImplementation|releaseImplementation)\s+['"]([^'"]+)['"]/gm,
    )) {
      const line = `${match[1]} '${match[2]}'`;
      if (!report.dependencies.includes(line)) report.dependencies.push(line);
    }
    report.confidence.dependencies = report.dependencies.length ? 0.6 : 0;
  }
}

function walkFiles(root: string, predicate: (file: string) => boolean): string[] {
  const out: string[] = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.name === 'Pods' || entry.name === 'build' || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (predicate(full)) out.push(full);
    }
  }
  return out;
}

export function writeMigratedConfig(projectRoot: string, report: MigrationReport): string {
  const dest = path.join(projectRoot, 'workspace.config.ts');
  if (fs.existsSync(dest)) {
    throw new Error(`Refusing to overwrite existing ${dest}`);
  }
  const extraTargets = report.targets.filter((name) => !/Tests$/i.test(name));
  const targetBlocks = extraTargets
    .map(
      (name) => `      // TODO: confirm type (share | widget | clip). Confidence ${report.confidence.targets ?? 0.5}
      { name: ${JSON.stringify(name)}, type: 'share' as const },`,
    )
    .join('\n');
  const packages = report.swiftPackages
    .map(
      (url) => `      swiftPackage({
        url: ${JSON.stringify(url)},
        requirement: { kind: 'upToNextMajorVersion', minimumVersion: '1.0.0' },
        products: [/* TODO */],
      }),`,
    )
    .join('\n');
  const schemes = report.schemes
    .map((name) => `      { name: ${JSON.stringify(name)}, configuration: 'Debug' as const },`)
    .join('\n');
  const permissions = report.permissions.map((p) => `      ${JSON.stringify(p)},`).join('\n');
  const features = report.features.map((name) => `      androidFeature(${JSON.stringify(name)}),`).join('\n');
  const dependencies = report.dependencies
    .map((line) => {
      const match = line.match(/^(implementation|api|compileOnly|runtimeOnly|debugImplementation|releaseImplementation)\s+'([^']+)'$/);
      if (match && match[1] === 'implementation') {
        return `      androidLibrary(${JSON.stringify(match[2])}),`;
      }
      if (match) {
        return `      androidLibrary(${JSON.stringify(match[2])}, ${JSON.stringify(match[1])}),`;
      }
      return `      ${JSON.stringify(line)},`;
    })
    .join('\n');
  const minSdk = report.gradleSdk['android.minSdkVersion'];
  const unknown = report.unknown.map((u) => `// TODO: unmodeled — ${u}`).join('\n');

  const contents = `import {
  androidFeature,
  androidLibrary,
  defineWorkspace,
  swiftPackage,
} from 'expo-workspaces';

${unknown}

export default defineWorkspace({
  schemaVersion: 1,
  ios: {
    targets: [
${targetBlocks || '      // no extra targets detected'}
    ],
    packages: [
${packages || '      // no Swift packages detected'}
    ],
    schemes: [
${schemes || '      // no extra schemes detected'}
    ],
  },
  android: {
${minSdk ? `    minSdkVersion: ${Number.parseInt(minSdk, 10) || minSdk},\n` : ''}    permissions: [
${permissions || '      // no extra permissions detected'}
    ],
    features: [
${features || '      // no uses-feature entries detected'}
    ],
    dependencies: [
${dependencies || '      // no app Gradle dependencies detected'}
    ],
  },
});
`;
  fs.writeFileSync(dest, contents);
  return dest;
}
