import type { ConfigPlugin } from '@expo/config-plugins';

import { loadAppConfig } from './appConfig';
import { loadWorkspaceConfig } from './loadConfig';
import { collectWorkspacePlan } from './pipeline';
import { reportInfo, reportWarning } from './report';
import type { Executor, Generator, GeneratorContext, Op, WorkspaceAppConfig } from './types';

export interface CreateWorkspaceOptions {
  generators: Generator[];
  executors: Executor[];
}

export interface WithWorkspaceProps {
  /** Path to the workspace config, relative to the app root. */
  configPath?: string;
  /** @deprecated Use configPath. */
  manifestPath?: string;
}

/**
 * Builds the workspace ConfigPlugin from a composed set of generators + executors.
 * Pipeline: load config → normalize → contributeConfig → collect ops → run executors.
 */
export function createWorkspace({
  generators,
  executors,
}: CreateWorkspaceOptions): ConfigPlugin<WithWorkspaceProps> {
  return (config, props = {}) => {
    const projectRoot =
      (config as { _internal?: { projectRoot?: string } })._internal?.projectRoot ?? process.cwd();

    const loaded = loadWorkspaceConfig(projectRoot, props.configPath ?? props.manifestPath);
    reportInfo(`loaded ${loaded.loadedAs} (${loaded.configPath})`);

    const ctx: GeneratorContext = {
      manifest: loaded.manifest,
      config: config as unknown as WorkspaceAppConfig,
      projectRoot,
      configPath: loaded.configPath,
    };

    const plan = collectWorkspacePlan(generators, ctx);
    for (const warning of plan.warnings) {
      reportWarning(warning);
    }

    let next = plan.config as unknown as typeof config;
    for (const executor of executors) {
      next = executor(next, plan.ops as Op[]);
    }
    return next;
  };
}

/** CLI helper: load config + app.json without running Expo mods. */
export function createGeneratorContext(
  projectRoot: string,
  configPath?: string,
  appConfig?: WorkspaceAppConfig,
): GeneratorContext {
  const loaded = loadWorkspaceConfig(projectRoot, configPath);
  return {
    manifest: loaded.manifest,
    config: appConfig ?? loadAppConfig(projectRoot),
    projectRoot,
    configPath: loaded.configPath,
  };
}
