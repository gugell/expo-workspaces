import fs from 'fs';
import path from 'path';
import type {
  AppendOnceOp,
  Generator,
  MergeBlockOp,
  Op,
  WorkspaceAppConfig,
  WriteFileOp,
} from '@expo-workspaces/core';
import { pbxOp } from '@expo-workspaces/ios-xcode';

import { resolveTargetBundleId } from '../bundleId';
import { addEASAppExtension } from '../easCredentials';
import { buildEntitlements, resolveEntitlements } from '../entitlements';
import { applyTargetsPbx } from '../generateTarget';
import type { TargetPlan } from '../generateTarget';
import { buildInfoPlist } from '../infoPlist';
import { TARGETS_LOADER_MARKER, buildTargetsPodfileLoader } from '../podsLoader';
import {
  getFrameworksForType,
  needsEmbeddedSwift,
  productTypeForType,
} from '../registry';
import type { TargetPod, TargetSpec } from '../types';
import { cleanTargetsRoot, normalizeTargets } from '../validate';

const DEFAULT_DEPLOYMENT_TARGET = '18.0';
const APP_GROUPS_KEY = 'com.apple.security.application-groups';

/** Renders a single `pod …` line (2-space-indented) for a target's pods block. */
function targetPodLine(pod: TargetPod): string {
  const parts = [`pod '${pod.pod}'`];
  if (pod.path) {
    parts.push(`:path => '${pod.path}'`);
  } else if (pod.version) {
    parts.push(`'${pod.version}'`);
  }
  if (pod.git) parts.push(`:git => '${pod.git}'`);
  if (pod.branch) parts.push(`:branch => '${pod.branch}'`);
  if (pod.tag) parts.push(`:tag => '${pod.tag}'`);
  if (pod.commit) parts.push(`:commit => '${pod.commit}'`);
  if (pod.configurations?.length) {
    const cfgs = pod.configurations.map((c) => `'${c}'`).join(', ');
    parts.push(`:configurations => [${cfgs}]`);
  }
  if (pod.modularHeaders != null) parts.push(`:modular_headers => ${pod.modularHeaders}`);
  return `  ${parts.join(', ')}`;
}

function buildTargetPodsBlock(name: string, pods: TargetPod[]): string {
  return `target '${name}' do\n${pods.map(targetPodLine).join('\n')}\nend`;
}

function sanitizeProductName(name: string): string {
  return name
    .replace(/[\W_]+/g, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function isExtensionProductType(productType: string): boolean {
  return (
    productType.includes('app-extension') || productType.includes('extensionkit-extension')
  );
}

function findFile(dir: string, predicate: (name: string) => boolean): string | undefined {
  if (!fs.existsSync(dir)) {
    return undefined;
  }
  return fs.readdirSync(dir).find(predicate);
}

interface ResolvedTarget {
  spec: TargetSpec;
  sourceRel: string;
  plan: TargetPlan;
  entitlementsJson?: Record<string, unknown>;
}

function resolveTargets(config: WorkspaceAppConfig, projectRoot: string, manifest: unknown): {
  targetsRootClean: string;
  resolved: ResolvedTarget[];
} {
  const slice = manifest as { targets?: TargetSpec[]; targetsRoot?: string };
  const targets = normalizeTargets(slice.targets);
  const targetsRootClean = cleanTargetsRoot(slice.targetsRoot);

  const resolved = targets.map((spec): ResolvedTarget => {
    const sourceRel = spec.source ?? `${targetsRootClean}/${spec.name}`;
    const sourceAbs = path.join(projectRoot, sourceRel);
    const cwd = `../${sourceRel}`;

    const productType = productTypeForType(spec.type);
    const isExtension = isExtensionProductType(productType);

    const entitlementsJson = resolveEntitlements(config, spec);
    const entitlementsFileName = entitlementsJson
      ? findFile(sourceAbs, (name) => name.endsWith('.entitlements')) ?? 'generated.entitlements'
      : undefined;
    const hasAppGroups = Array.isArray((entitlementsJson ?? {})[APP_GROUPS_KEY])
      ? ((entitlementsJson ?? {})[APP_GROUPS_KEY] as unknown[]).length > 0
      : false;

    const configFile = findFile(sourceAbs, (name) => /^expo-target\.config\.(js|json)$/.test(name));
    const membershipExceptions = ['Info.plist', ...(configFile ? [configFile] : [])].sort();

    const plan: TargetPlan = {
      type: spec.type,
      name: spec.name,
      productName: sanitizeProductName(spec.name),
      productType,
      explicitFileType: isExtension ? 'wrapper.app-extension' : 'wrapper.application',
      isExtension,
      bundleId: resolveTargetBundleId(config, spec),
      deploymentTarget: spec.deploymentTarget ?? DEFAULT_DEPLOYMENT_TARGET,
      cwd,
      currentProjectVersion: config.ios?.buildNumber || 1,
      needsEmbeddedSwift: needsEmbeddedSwift(spec.type),
      frameworks: getFrameworksForType(spec.type, spec.frameworks ?? []),
      entitlementsFileName,
      hasAppGroups,
      membershipExceptions,
      buildSettings: spec.buildSettings,
    };

    return { spec, sourceRel, plan, entitlementsJson };
  });

  return { targetsRootClean, resolved };
}

export const targetsGenerator: Generator = {
  name: 'targets',

  contributeConfig(config, ctx) {
    const { resolved } = resolveTargets(config, ctx.projectRoot, ctx.manifest);
    for (const { plan, entitlementsJson } of resolved) {
      addEASAppExtension(config, {
        bundleIdentifier: plan.bundleId,
        targetName: plan.productName,
        entitlements: entitlementsJson,
      });
    }
    return config;
  },

  generate({ config, projectRoot, manifest }) {
    const { targetsRootClean, resolved } = resolveTargets(config, projectRoot, manifest);
    if (resolved.length === 0) {
      return { ops: [] };
    }

    const ops: Op[] = [];

    for (const { spec, sourceRel, plan, entitlementsJson } of resolved) {
      const infoPlistOp: WriteFileOp = {
        kind: 'writeFile',
        base: 'project',
        path: `${sourceRel}/Info.plist`,
        contents: buildInfoPlist(spec.type),
        overwrite: 'ifAbsent',
        label: `target:${spec.name}:Info.plist`,
      };
      ops.push(infoPlistOp);
      if (entitlementsJson && plan.entitlementsFileName) {
        const entitlementsOp: WriteFileOp = {
          kind: 'writeFile',
          base: 'project',
          path: `${sourceRel}/${plan.entitlementsFileName}`,
          contents: buildEntitlements(entitlementsJson),
          overwrite: 'always',
          label: `target:${spec.name}:entitlements`,
        };
        ops.push(entitlementsOp);
      }
    }

    // Podfile loader that wires each target's pods.rb file (kept for back-compat with
    // the @bacons/apple-targets convention). Manifest-declared `pods` below are
    // preferred — drop pods.rb if you migrate to the manifest.
    const loaderOp: AppendOnceOp = {
      kind: 'appendOnce',
      base: 'ios',
      path: 'Podfile',
      marker: TARGETS_LOADER_MARKER,
      contents: buildTargetsPodfileLoader(targetsRootClean),
      label: 'targetsPodfileLoader',
    };
    ops.push(loaderOp);

    // Per-target pod blocks declared in the manifest → tagged, idempotent
    // `target '<name>' do … end` mergeBlocks. Anchored on the loader marker (we
    // emit it above), which is guaranteed to live at **top level** (after the
    // main target's `end`). Anchoring on `post_install` is unsafe — in the Expo
    // template `post_install` lives INSIDE the main target, which would nest our
    // block and cause CocoaPods to inherit the main app's full pod graph
    // (Expo modules, RN, Hermes, …) into the extension.
    for (const { spec } of resolved) {
      if (!spec.pods?.length) continue;
      const op: MergeBlockOp = {
        kind: 'mergeBlock',
        base: 'ios',
        path: 'Podfile',
        tag: `expo-workspaces-target-pods-${spec.name}`,
        newSrc: buildTargetPodsBlock(spec.name, spec.pods),
        anchor: new RegExp(TARGETS_LOADER_MARKER),
        offset: 0,
        comment: '#',
        label: `target:${spec.name}:pods`,
      };
      ops.push(op);
    }

    // One pbx op creates all targets then syncs team id + marketing version.
    const plans = resolved.map((r) => r.plan);
    const teamId = config.ios?.appleTeamId;
    const marketingVersion = config.ios?.version || config.version || '1.0.0';
    ops.push(
      pbxOp('targets', ({ project }) => {
        applyTargetsPbx(project, plans, { teamId, marketingVersion });
      }),
    );

    return { ops };
  },
};
