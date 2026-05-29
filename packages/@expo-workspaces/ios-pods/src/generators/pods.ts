import { nameMatcherToRuby, rubyLiteral } from '@expo-workspaces/core';
import type { Generator, MergeBlockOp, Op } from '@expo-workspaces/core';

import {
  normalizeLocalPods,
  normalizePodBuildSettingsRules,
  normalizeRemotePods,
  normalizeRemovePodBuildPhases,
} from '../validate';
import type {
  LocalPodDeclaration,
  PodBuildSettingsRule,
  PodRemoveBuildPhaseRule,
  RemotePodDeclaration,
} from './../types';

const LOCAL_PODS_TAG = 'declarative-workspace-local-pods';
const REMOTE_PODS_TAG = 'declarative-workspace-remote-pods';
const POD_BUILD_SETTINGS_TAG = 'declarative-workspace-pod-build-settings';
const POD_REMOVE_BUILD_PHASES_TAG = 'declarative-workspace-pod-remove-build-phases';

const USE_EXPO_MODULES = /use_expo_modules!/;
const POST_INSTALL = /post_install do \|installer\|/;

function localPodLines(pods: LocalPodDeclaration[]): string {
  return pods.map(({ pod, path }) => `  pod '${pod}', :path => '${path}'`).join('\n');
}

function remotePodLine(p: RemotePodDeclaration): string {
  const parts = [`pod ${rubyLiteral(p.pod)}`];
  if (p.version) {
    parts.push(rubyLiteral(p.version));
  }
  if (p.git) {
    parts.push(`:git => ${rubyLiteral(p.git)}`);
  }
  if (p.branch) {
    parts.push(`:branch => ${rubyLiteral(p.branch)}`);
  }
  if (p.tag) {
    parts.push(`:tag => ${rubyLiteral(p.tag)}`);
  }
  if (p.commit) {
    parts.push(`:commit => ${rubyLiteral(p.commit)}`);
  }
  if (p.configurations?.length) {
    parts.push(`:configurations => [${p.configurations.map((c) => rubyLiteral(c)).join(', ')}]`);
  }
  if (p.modularHeaders != null) {
    parts.push(`:modular_headers => ${p.modularHeaders}`);
  }
  return `  ${parts.join(', ')}`;
}

function podBuildSettingsLines(rules: PodBuildSettingsRule[]): string {
  const targetCondition = rules.map((rule) => `(${nameMatcherToRuby(rule.target)})`).join(' || ');
  const lines: string[] = [
    '  installer.pods_project.targets.each do |target|',
    `    next unless ${targetCondition}`,
    '    target.build_configurations.each do |config|',
  ];
  for (const rule of rules) {
    lines.push(`      if ${nameMatcherToRuby(rule.target)}`);
    if (rule.configurations?.length) {
      const names = rule.configurations.map((value) => rubyLiteral(value)).join(', ');
      lines.push(`        next unless [${names}].include?(config.name)`);
    }
    for (const [key, value] of Object.entries(rule.settings)) {
      lines.push(`        config.build_settings[${rubyLiteral(key)}] = ${rubyLiteral(value)}`);
    }
    lines.push('      end');
  }
  lines.push('    end');
  lines.push('  end');
  return lines.join('\n');
}

function podRemoveBuildPhasesLines(rules: PodRemoveBuildPhaseRule[]): string {
  return rules
    .map((rule) =>
      [
        '  installer.pods_project.targets.each do |target|',
        `    next unless ${nameMatcherToRuby(rule.target)}`,
        '    target.build_phases.delete_if do |phase|',
        `      phase.respond_to?(:name) && phase.name == ${rubyLiteral(rule.phase)}`,
        '    end',
        '  end',
      ].join('\n'),
    )
    .join('\n');
}

function mergeBlock(
  tag: string,
  newSrc: string,
  anchor: RegExp,
  label: string,
): MergeBlockOp {
  return { kind: 'mergeBlock', path: 'Podfile', tag, newSrc, anchor, offset: 1, comment: '#', label };
}

export const podsGenerator: Generator = {
  name: 'pods',
  generate({ manifest }) {
    const localPods = normalizeLocalPods(manifest.localPods as LocalPodDeclaration[] | undefined);
    const remotePods = normalizeRemotePods(manifest.remotePods as RemotePodDeclaration[] | undefined);
    const podBuildSettings = normalizePodBuildSettingsRules(
      manifest.podBuildSettings as PodBuildSettingsRule[] | undefined,
    );
    const removePodBuildPhases = normalizeRemovePodBuildPhases(
      manifest.removePodBuildPhases as PodRemoveBuildPhaseRule[] | undefined,
    );

    const ops: Op[] = [];
    if (localPods.length > 0) {
      ops.push(mergeBlock(LOCAL_PODS_TAG, localPodLines(localPods), USE_EXPO_MODULES, 'localPods'));
    }
    if (remotePods.length > 0) {
      ops.push(
        mergeBlock(REMOTE_PODS_TAG, remotePods.map(remotePodLine).join('\n'), USE_EXPO_MODULES, 'remotePods'),
      );
    }
    if (podBuildSettings.length > 0) {
      ops.push(
        mergeBlock(POD_BUILD_SETTINGS_TAG, podBuildSettingsLines(podBuildSettings), POST_INSTALL, 'podBuildSettings'),
      );
    }
    if (removePodBuildPhases.length > 0) {
      ops.push(
        mergeBlock(
          POD_REMOVE_BUILD_PHASES_TAG,
          podRemoveBuildPhasesLines(removePodBuildPhases),
          POST_INSTALL,
          'removePodBuildPhases',
        ),
      );
    }
    return { ops };
  },
};
