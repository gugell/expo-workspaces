import { toPlanOperation } from './ops';
import { redactDeep } from './secrets';
import { isRecord } from './guards';
import type { Op, PlanOperation } from './types';
import type { WorkspacePlan } from './pipeline';

export interface PlanSummary {
  operations: number;
  warnings: number;
  conflicts: number;
}

export interface PlanDocument {
  valid: boolean;
  configPath: string;
  summary: PlanSummary;
  warnings: string[];
  operations: PlanOperation[];
}

export function buildPlanDocument(plan: WorkspacePlan, warnings: string[] = plan.warnings): PlanDocument {
  const operations = redactDeep(plan.ops.map((op, index) => toPlanOperation(op, index))) as PlanOperation[];
  return {
    valid: true,
    configPath: plan.configPath,
    summary: {
      operations: operations.length,
      warnings: warnings.length,
      conflicts: 0,
    },
    warnings,
    operations,
  };
}

export function renderPlanHuman(doc: PlanDocument, verbose = false): string {
  const lines: string[] = ['expo-workspaces', ''];
  const byPlatform = groupBy(doc.operations, (op) => op.platform);

  for (const platform of ['ios', 'android', 'shared'] as const) {
    const ops = byPlatform.get(platform);
    if (!ops?.length) continue;
    lines.push(platform === 'ios' ? 'iOS' : platform === 'android' ? 'Android' : 'Shared');
    const byDomain = groupBy(ops, (op) => domainOf(op.kind));
    for (const [domain, domainOps] of byDomain) {
      lines.push(domain.toUpperCase());
      for (const op of domainOps) {
        lines.push(`  ${statusMark(op.status)} ${op.label}`);
        if (verbose) {
          lines.push(`      ${op.kind}  source=${op.source}  id=${op.id}`);
          if (op.files?.length) {
            lines.push(`      files  ${op.files.join(', ')}`);
          }
        } else if (op.source) {
          lines.push(`      ${op.source}`);
        }
      }
      lines.push('');
    }
  }

  lines.push(`${doc.summary.operations} native operations`);
  lines.push(`${doc.summary.conflicts} conflicts`);
  if (doc.warnings.length) {
    lines.push(`${doc.warnings.length} warnings`);
    for (const warning of doc.warnings) {
      lines.push(`  ⚠ ${warning}`);
    }
  }
  lines.push(doc.valid ? '✓ Workspace valid' : '✗ Workspace invalid');
  return lines.join('\n');
}

function domainOf(kind: string): string {
  const parts = kind.split('.');
  if (parts.length >= 2) {
    return parts[1];
  }
  return kind;
}

function statusMark(status: PlanOperation['status']): string {
  switch (status) {
    case 'add':
      return '+';
    case 'update':
      return '~';
    case 'remove':
      return '-';
    default:
      return '·';
  }
}

function groupBy<T, K>(items: T[], key: (item: T) => K): Map<K, T[]> {
  const map = new Map<K, T[]>();
  for (const item of items) {
    const k = key(item);
    const list = map.get(k);
    if (list) {
      list.push(item);
    } else {
      map.set(k, [item]);
    }
  }
  return map;
}

/** Target names declared by `ios.target.add` operations. */
export function declaredTargetNames(operations: PlanOperation[]): string[] {
  const names = new Set<string>();
  for (const op of operations) {
    if (op.kind !== 'ios.target.add' || op.desired == null) continue;
    for (const name of namesFromDesired(op.desired)) {
      names.add(name);
    }
  }
  return [...names];
}

function namesFromDesired(desired: unknown): string[] {
  if (Array.isArray(desired)) {
    return desired.flatMap(namesFromDesired);
  }
  if (isRecord(desired) && typeof desired.name === 'string' && desired.name) {
    return [desired.name];
  }
  return [];
}

/** @internal used by tests */
export function serializeOpsForCompare(ops: Op[]): string {
  return JSON.stringify(ops.map((op, index) => toPlanOperation(op, index)));
}
