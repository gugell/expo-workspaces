import type { BaseOp, FileBase, Op } from '@expo-workspaces/core';

/** Idempotent tagged block (delegates to core's mergeContents). */
export interface BlockPatch {
  tag: string;
  anchor: string;
  /** Treat `anchor` as a regex source. Default: false (literal). */
  regex?: boolean;
  offset?: number;
  comment?: string;
  contents: string;
  /** Append a tagged block at EOF when the anchor is not found. */
  appendIfNoAnchor?: boolean;
}

export interface InsertPatch {
  anchor: string;
  regex?: boolean;
  text: string;
}

export interface ReplacePatch {
  find: string;
  /** Treat `find` as a regex source. Default: false (literal). */
  regex?: boolean;
  all?: boolean;
  with: string;
}

export interface FilePatch {
  /** Path relative to `base`. */
  file: string;
  base?: FileBase;
  block?: BlockPatch;
  insertAfter?: InsertPatch;
  insertBefore?: InsertPatch;
  replace?: ReplacePatch;
}

/** The manifest slice this package consumes. */
export interface PatchManifest {
  patches?: FilePatch[];
}

export type PatchAction =
  | { mode: 'insertAfter'; anchor: string; regex: boolean; text: string }
  | { mode: 'insertBefore'; anchor: string; regex: boolean; text: string }
  | { mode: 'replace'; find: string; regex: boolean; all: boolean; with: string };

export interface PatchOp extends BaseOp {
  kind: 'patch';
  base?: FileBase;
  path: string;
  action: PatchAction;
}

export function isPatchOp(op: Op): op is PatchOp {
  return op.kind === 'patch';
}
