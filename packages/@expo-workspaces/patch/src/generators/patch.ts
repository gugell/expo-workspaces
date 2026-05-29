import { ERR } from '@expo-workspaces/core';
import type { Generator, MergeBlockOp, Op } from '@expo-workspaces/core';

import type { FilePatch, PatchOp } from '../types';

function buildOpsForPatch(patch: FilePatch, index: number): Op[] {
  if (!patch?.file?.trim()) {
    throw new Error(`${ERR} patches[${index}] requires a "file".`);
  }
  const base = patch.base;
  const file = patch.file.trim();
  const ops: Op[] = [];
  let count = 0;

  if (patch.block) {
    count++;
    const b = patch.block;
    const op: MergeBlockOp = {
      kind: 'mergeBlock',
      base,
      path: file,
      tag: b.tag,
      newSrc: b.contents,
      anchor: b.regex ? new RegExp(b.anchor) : new RegExp(escapeRegExp(b.anchor)),
      offset: b.offset ?? 0,
      comment: b.comment ?? '//',
      appendIfNoAnchor: b.appendIfNoAnchor,
      label: `patch:${file}:block:${b.tag}`,
    };
    ops.push(op);
  }

  if (patch.insertAfter) {
    count++;
    ops.push(patchOp(file, base, `patch:${file}:insertAfter`, {
      mode: 'insertAfter',
      anchor: patch.insertAfter.anchor,
      regex: Boolean(patch.insertAfter.regex),
      text: patch.insertAfter.text,
    }));
  }
  if (patch.insertBefore) {
    count++;
    ops.push(patchOp(file, base, `patch:${file}:insertBefore`, {
      mode: 'insertBefore',
      anchor: patch.insertBefore.anchor,
      regex: Boolean(patch.insertBefore.regex),
      text: patch.insertBefore.text,
    }));
  }
  if (patch.replace) {
    count++;
    ops.push(patchOp(file, base, `patch:${file}:replace`, {
      mode: 'replace',
      find: patch.replace.find,
      regex: Boolean(patch.replace.regex),
      all: Boolean(patch.replace.all),
      with: patch.replace.with,
    }));
  }

  if (count === 0) {
    throw new Error(
      `${ERR} patches[${index}] requires one of "block" | "insertAfter" | "insertBefore" | "replace".`,
    );
  }
  return ops;
}

function patchOp(path: string, base: FilePatch['base'], label: string, action: PatchOp['action']): PatchOp {
  return { kind: 'patch', base, path, action, label };
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const patchGenerator: Generator = {
  name: 'patches',
  generate({ manifest }) {
    const patches = (manifest as { patches?: FilePatch[] }).patches;
    if (!Array.isArray(patches) || patches.length === 0) {
      return { ops: [] };
    }
    const ops: Op[] = [];
    patches.forEach((patch, index) => {
      ops.push(...buildOpsForPatch(patch, index));
    });
    return { ops };
  },
};
