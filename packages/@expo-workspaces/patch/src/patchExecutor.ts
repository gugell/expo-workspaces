import fs from 'fs';
import path from 'path';
import { withDangerousMod } from '@expo/config-plugins';
import type { ConfigPlugin } from '@expo/config-plugins';
import type { Executor, FileBase, Op } from '@expo-workspaces/core';
import { reportChange, reportSkip } from '@expo-workspaces/core';

import type { PatchOp } from './types';
import { isPatchOp } from './types';

const ERR = '[expo-workspaces]';

function applyAction(contents: string, op: PatchOp): { next: string; changed: boolean } {
  const { action } = op;

  if (action.mode === 'replace') {
    const pattern = action.regex
      ? new RegExp(action.find, action.all ? 'g' : '')
      : action.find;
    const next =
      typeof pattern === 'string' && action.all
        ? contents.split(pattern).join(action.with)
        : contents.replace(pattern as never, action.with);
    return { next, changed: next !== contents };
  }

  // insertAfter / insertBefore — idempotent: skip if the text is already present.
  if (contents.includes(action.text)) {
    return { next: contents, changed: false };
  }
  const matcher = action.regex ? new RegExp(action.anchor) : action.anchor;
  const matchIndex = action.regex
    ? contents.search(matcher as RegExp)
    : contents.indexOf(matcher as string);
  if (matchIndex < 0) {
    throw new Error(`${ERR} ${op.label}: anchor not found ("${action.anchor}").`);
  }

  const anchorText = action.regex
    ? (contents.match(matcher as RegExp) as RegExpMatchArray)[0]
    : (matcher as string);

  if (action.mode === 'insertAfter') {
    // Insert on the line after the anchor's line.
    const lineEnd = contents.indexOf('\n', matchIndex + anchorText.length);
    const at = lineEnd < 0 ? contents.length : lineEnd + 1;
    return { next: contents.slice(0, at) + action.text + '\n' + contents.slice(at), changed: true };
  }
  // insertBefore — insert at the start of the anchor's line.
  const lineStart = contents.lastIndexOf('\n', matchIndex) + 1;
  return {
    next: contents.slice(0, lineStart) + action.text + '\n' + contents.slice(lineStart),
    changed: true,
  };
}

function applyPatchOps(platform: 'ios' | 'android', ops: PatchOp[]): ConfigPlugin {
  return (config) =>
    withDangerousMod(config, [
      platform,
      async (config) => {
        const { platformProjectRoot, projectRoot } = config.modRequest;
        const baseDir = (base: FileBase | undefined): string =>
          base === 'project' ? projectRoot : platformProjectRoot;

        for (const op of ops) {
          const filePath = path.resolve(baseDir(op.base), op.path);
          if (!fs.existsSync(filePath)) {
            throw new Error(`${ERR} ${op.label}: file not found at ${filePath}.`);
          }
          const original = fs.readFileSync(filePath, 'utf8');
          const { next, changed } = applyAction(original, op);
          if (changed) {
            fs.writeFileSync(filePath, next, 'utf8');
            reportChange(op.label, filePath);
          } else {
            reportSkip(op.label, filePath);
          }
        }
        return config;
      },
    ]);
}

/** Applies all `patch` ops, partitioned by platform mod. */
export const patchExecutor: Executor = (config, ops: Op[]) => {
  const patchOps = ops.filter(isPatchOp);
  if (patchOps.length === 0) {
    return config;
  }
  const iosOps = patchOps.filter((o) => (o.base ?? 'ios') !== 'android');
  const androidOps = patchOps.filter((o) => o.base === 'android');
  if (iosOps.length > 0) {
    config = applyPatchOps('ios', iosOps)(config, undefined as never);
  }
  if (androidOps.length > 0) {
    config = applyPatchOps('android', androidOps)(config, undefined as never);
  }
  return config;
};
