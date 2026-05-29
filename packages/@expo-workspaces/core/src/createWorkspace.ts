import type { ConfigPlugin } from '@expo/config-plugins';

import { loadManifest } from './loadManifest';
import { reportWarning } from './report';
import type { Executor, Generator, GeneratorContext, Op, WorkspaceAppConfig } from './types';

export interface CreateWorkspaceOptions {
  generators: Generator[];
  executors: Executor[];
}

export interface WithWorkspaceProps {
  /** Path to the manifest, relative to the app root. Defaults to `workspace.manifest.js`. */
  manifestPath?: string;
}

/**
 * Builds the workspace ConfigPlugin from a composed set of generators + executors.
 * Pipeline: load raw manifest → contributeConfig → collect ops → run executors.
 */
export function createWorkspace({
  generators,
  executors,
}: CreateWorkspaceOptions): ConfigPlugin<WithWorkspaceProps> {
  return (config, props = {}) => {
    const projectRoot =
      (config as { _internal?: { projectRoot?: string } })._internal?.projectRoot ?? process.cwd();

    const manifest = loadManifest(projectRoot, props.manifestPath);
    const ctx: GeneratorContext = {
      manifest,
      config: config as unknown as WorkspaceAppConfig,
      projectRoot,
    };

    // 1. Static config contributions (e.g. EAS appExtensions).
    for (const generator of generators) {
      if (generator.contributeConfig) {
        ctx.config = generator.contributeConfig(ctx.config, ctx);
      }
    }
    config = ctx.config as unknown as typeof config;

    // 2. Collect the declarative op plan.
    const ops: Op[] = [];
    for (const generator of generators) {
      const result = generator.generate(ctx);
      ops.push(...result.ops);
      for (const warning of result.warnings ?? []) {
        reportWarning(`${generator.name}: ${warning}`);
      }
    }

    // 3. Dispatch ops to each executor (each handles the kinds it recognizes).
    for (const executor of executors) {
      config = executor(config, ops);
    }

    return config;
  };
}
