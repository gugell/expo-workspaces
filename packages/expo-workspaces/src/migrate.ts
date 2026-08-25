import fs from 'fs';
import path from 'path';

export interface MigrationReport {
  present: boolean;
  targets: string[];
  swiftPackages: string[];
  schemes: string[];
  appGroups: string[];
  permissions: string[];
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
  const pbx = path.join(iosDir, xcodeproj, 'project.pbxproj');
  if (!fs.existsSync(pbx)) return;
  const contents = fs.readFileSync(pbx, 'utf8');

  for (const match of contents.matchAll(/name = ([^;]+);/g)) {
    const name = match[1].replace(/"/g, '').trim();
    if (name && !report.targets.includes(name) && !name.includes('/') && name.length < 80) {
      // pbxproj has many name = fields; keep product-looking names later via PBXNativeTarget isa blocks
    }
  }

  for (const match of contents.matchAll(
    /isa = PBXNativeTarget;[\s\S]*?name = "?([A-Za-z0-9_.-]+)"?;/g,
  )) {
    const name = match[1];
    if (!report.targets.includes(name)) report.targets.push(name);
  }

  for (const match of contents.matchAll(/repositoryURL = "?([^";]+)"?;/g)) {
    report.swiftPackages.push(match[1]);
    report.confidence[match[1]] = 0.9;
  }

  const schemesDir = path.join(iosDir, xcodeproj, 'xcshareddata', 'xcschemes');
  if (fs.existsSync(schemesDir)) {
    report.schemes = fs
      .readdirSync(schemesDir)
      .filter((name) => name.endsWith('.xcscheme'))
      .map((name) => name.replace(/\.xcscheme$/, ''));
  }

  const entitlements = walkFiles(iosDir, (file) => file.endsWith('.entitlements'));
  for (const file of entitlements) {
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(/group\.[A-Za-z0-9.]+/g)) {
      if (!report.appGroups.includes(match[0])) report.appGroups.push(match[0]);
    }
  }

  report.confidence.targets = report.targets.length ? 0.7 : 0;
  report.confidence.schemes = report.schemes.length ? 0.85 : 0;
}

function inspectAndroid(androidDir: string, report: MigrationReport): void {
  const manifest = path.join(androidDir, 'app', 'src', 'main', 'AndroidManifest.xml');
  if (fs.existsSync(manifest)) {
    const text = fs.readFileSync(manifest, 'utf8');
    for (const match of text.matchAll(/android:name="(android\.permission\.[A-Z_]+)"/g)) {
      report.permissions.push(match[1]);
    }
    report.confidence.permissions = report.permissions.length ? 0.8 : 0;
  }
  const gradle = path.join(androidDir, 'gradle.properties');
  if (fs.existsSync(gradle)) {
    const text = fs.readFileSync(gradle, 'utf8');
    if (/android\.minSdkVersion/.test(text)) {
      report.confidence.minSdkVersion = 0.9;
    }
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
  const unknown = report.unknown.map((u) => `// TODO: unmodeled — ${u}`).join('\n');

  const contents = `import {
  defineWorkspace,
  shareExtension,
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
    permissions: [
${permissions || '      // no extra permissions detected'}
    ],
  },
});
`;
  fs.writeFileSync(dest, contents);
  return dest;
}
