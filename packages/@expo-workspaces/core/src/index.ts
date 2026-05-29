export { createWorkspace } from './createWorkspace';
export type { CreateWorkspaceOptions, WithWorkspaceProps } from './createWorkspace';
export { loadManifest, resolveManifestPath, DEFAULT_MANIFEST_FILENAME } from './loadManifest';
export { fileExecutor } from './fileExecutor';
export { reportChange, reportSkip, reportWarning } from './report';
export {
  ERR,
  assertBuildConfiguration,
  assertNameMatcher,
  nameMatcherToRuby,
  rubyLiteral,
} from './validation';
export type { XcodeBuildConfiguration, NameMatcher } from './validation';

export {
  FILE_OP_KINDS,
  isFileOp,
} from './types';
export type {
  WorkspaceAppConfig,
  RawManifest,
  FileBase,
  BaseOp,
  WriteFileOp,
  MergeBlockOp,
  AppendOnceOp,
  DeleteGlobOp,
  FileOp,
  Op,
  GeneratorContext,
  GeneratorResult,
  Generator,
  Executor,
} from './types';
