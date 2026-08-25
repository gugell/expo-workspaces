import fs from 'fs';
import path from 'path';

import type { Diagnostic } from './diagnostics';
import { asRecordArray, asStringArray, compareDottedVersions, isRecord } from './guards';
import type { WorkspacePlan } from './pipeline';
import { isLiteralSecret } from './secrets';
import type { RawManifest, WorkspaceAppConfig } from './types';

export interface DoctorRule {
  id: string;
  title: string;
  run(ctx: DoctorContext): Diagnostic[];
}

export interface DoctorContext {
  projectRoot: string;
  configPath: string;
  manifest: RawManifest;
  appConfig: WorkspaceAppConfig;
  plan?: WorkspacePlan;
  nodeVersion: string;
}

const MIN_NODE = [20, 19, 4] as const;
const MIN_EXPO_SDK = 56;

export const builtinDoctorRules: DoctorRule[] = [
  {
    id: 'config-loaded',
    title: 'Config file can be loaded',
    run({ configPath }) {
      if (!fs.existsSync(configPath)) {
        return [
          {
            id: 'config-loaded',
            severity: 'error',
            message: `Workspace config not found at ${configPath}`,
            hint: 'Create workspace.config.ts at the app root.',
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'node-version',
    title: 'Supported Node version',
    run({ nodeVersion }) {
      const [major, minor, patch] = nodeVersion.split('.').map((p) => Number.parseInt(p, 10));
      const ok =
        major > MIN_NODE[0] ||
        (major === MIN_NODE[0] && minor > MIN_NODE[1]) ||
        (major === MIN_NODE[0] && minor === MIN_NODE[1] && patch >= MIN_NODE[2]);
      if (!ok) {
        return [
          {
            id: 'node-version',
            severity: 'error',
            message: `Node ${nodeVersion} is below the minimum ${MIN_NODE.join('.')}`,
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'expo-sdk',
    title: 'Supported Expo SDK',
    run({ projectRoot }) {
      const sdk = readExpoSdk(projectRoot);
      if (sdk == null) {
        return [
          {
            id: 'expo-sdk',
            severity: 'warning',
            message: 'Could not determine Expo SDK version from node_modules/expo or package.json',
          },
        ];
      }
      if (sdk < MIN_EXPO_SDK) {
        return [
          {
            id: 'expo-sdk',
            severity: 'error',
            message: `Expo SDK ${sdk} is below the minimum supported SDK ${MIN_EXPO_SDK}`,
          },
        ];
      }
      return [];
    },
  },
  {
    id: 'unique-target-names',
    title: 'Target names are unique',
    run({ manifest }) {
      const names = targetList(manifest).map((t) => String(t.name ?? ''));
      return duplicateDiagnostics('unique-target-names', names, 'Duplicate target name');
    },
  },
  {
    id: 'unique-bundle-ids',
    title: 'Target bundle identifiers are unique',
    run({ manifest }) {
      const ids = targetList(manifest)
        .map((t) => (typeof t.bundleIdentifier === 'string' ? t.bundleIdentifier : ''))
        .filter(Boolean);
      return duplicateDiagnostics('unique-bundle-ids', ids, 'Duplicate bundle identifier');
    },
  },
  {
    id: 'deployment-target',
    title: 'Extension deployment targets are not lower than the workspace default',
    run({ manifest }) {
      const floor = typeof manifest.iosDeploymentTarget === 'string' ? manifest.iosDeploymentTarget : undefined;
      if (!floor) return [];
      const diagnostics: Diagnostic[] = [];
      targetList(manifest).forEach((target, index) => {
        const dt = typeof target.deploymentTarget === 'string' ? target.deploymentTarget : undefined;
        if (dt && compareDottedVersions(dt, floor) < 0) {
          diagnostics.push({
            id: 'deployment-target',
            severity: 'warning',
            source: `ios.targets[${index}]`,
            message: `${target.name} deployment target ${dt} is lower than workspace ${floor}`,
            hint: 'Extensions should match or exceed the application deployment target.',
          });
        }
      });
      return diagnostics;
    },
  },
  {
    id: 'app-groups',
    title: 'App Group entitlements are consistent with the parent app',
    run({ manifest, appConfig }) {
      const appGroups = asStringArray(appConfig.ios?.entitlements?.['com.apple.security.application-groups']);
      const diagnostics: Diagnostic[] = [];
      targetList(manifest).forEach((target, index) => {
        const groups = asStringArray(
          isRecord(target.entitlements)
            ? target.entitlements['com.apple.security.application-groups']
            : undefined,
        );
        for (const group of groups) {
          if (appGroups.length > 0 && !appGroups.includes(group)) {
            diagnostics.push({
              id: 'app-groups',
              severity: 'error',
              source: `ios.targets[${index}]`,
              message: `${target.name} requires ${group} but the main target does not declare that App Group`,
              hint: 'Add the group to expo.ios.entitlements in app.json, or to the extension only if it is exclusive.',
            });
          }
        }
      });
      return diagnostics;
    },
  },
  {
    id: 'spm-targets',
    title: 'Declared Swift Package products resolve to intended targets',
    run({ manifest }) {
      const targetNames = new Set(targetList(manifest).map((t) => String(t.name)));
      const diagnostics: Diagnostic[] = [];
      const slice = isRecord(manifest.swiftPackages) ? manifest.swiftPackages : {};
      const packages = [
        ...asRecordArray(slice.remote).map((pkg, i) => ({ pkg, source: `ios.packages.remote[${i}]` })),
        ...asRecordArray(slice.local).map((pkg, i) => ({ pkg, source: `ios.packages.local[${i}]` })),
      ];
      for (const { pkg, source } of packages) {
        for (const name of asStringArray(pkg.target)) {
          if (targetNames.size > 0 && !targetNames.has(name)) {
            diagnostics.push({
              id: 'spm-targets',
              severity: 'error',
              source,
              message: `Swift package product is linked to unknown target "${name}"`,
            });
          }
        }
      }
      return diagnostics;
    },
  },
  {
    id: 'signing-secrets',
    title: 'Signing secrets are not committed as literals',
    run({ manifest }) {
      const android = isRecord(manifest.android) ? manifest.android : undefined;
      const signing = android && isRecord(android.signing) ? android.signing : undefined;
      if (!signing) return [];
      const diagnostics: Diagnostic[] = [];
      for (const field of ['storePassword', 'keyPassword'] as const) {
        if (isLiteralSecret(signing[field])) {
          diagnostics.push({
            id: 'signing-secrets',
            severity: 'warning',
            source: `android.signing.${field}`,
            message: `${field} is a literal value. Prefer { env: "VAR" } or "env:VAR".`,
            hint: 'Literal secrets in git are unsafe. Use EAS Secrets or environment variables.',
          });
        }
      }
      return diagnostics;
    },
  },
];

export function runDoctor(ctx: DoctorContext, rules: DoctorRule[] = builtinDoctorRules): Diagnostic[] {
  const diagnostics: Diagnostic[] = [];
  for (const rule of rules) {
    diagnostics.push(...rule.run(ctx));
  }
  return diagnostics;
}

function targetList(manifest: RawManifest): Record<string, unknown>[] {
  return asRecordArray(manifest.targets);
}

function duplicateDiagnostics(id: string, values: string[], label: string): Diagnostic[] {
  const seen = new Set<string>();
  const diagnostics: Diagnostic[] = [];
  for (const value of values) {
    if (!value) continue;
    if (seen.has(value)) {
      diagnostics.push({ id, severity: 'error', message: `${label} "${value}"` });
    }
    seen.add(value);
  }
  return diagnostics;
}

function readExpoSdk(projectRoot: string): number | null {
  const expoPkg = path.join(projectRoot, 'node_modules', 'expo', 'package.json');
  if (fs.existsSync(expoPkg)) {
    try {
      const json = JSON.parse(fs.readFileSync(expoPkg, 'utf8')) as { version?: string };
      const major = Number.parseInt(String(json.version ?? '').split('.')[0], 10);
      return Number.isFinite(major) ? major : null;
    } catch {
      return null;
    }
  }
  const pkg = path.join(projectRoot, 'package.json');
  if (!fs.existsSync(pkg)) return null;
  try {
    const json = JSON.parse(fs.readFileSync(pkg, 'utf8')) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const range = json.dependencies?.expo ?? json.devDependencies?.expo;
    if (!range) return null;
    const match = range.match(/(\d+)/);
    return match ? Number.parseInt(match[1], 10) : null;
  } catch {
    return null;
  }
}
