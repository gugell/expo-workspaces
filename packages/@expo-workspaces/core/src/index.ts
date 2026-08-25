export { createWorkspace, createGeneratorContext } from './createWorkspace';
export type { CreateWorkspaceOptions, WithWorkspaceProps } from './createWorkspace';
export { loadManifest, resolveManifestPath, DEFAULT_MANIFEST_FILENAME } from './loadManifest';
export {
  loadWorkspaceConfig,
  resolveConfigPath,
  DEFAULT_CONFIG_FILENAMES,
} from './loadConfig';
export type { LoadedWorkspaceConfig } from './loadConfig';
export { normalizeWorkspaceConfig } from './normalize';
export { collectWorkspacePlan } from './pipeline';
export type { WorkspacePlan } from './pipeline';
export { withMeta, toPlanOperation } from './ops';
export { buildPlanDocument, renderPlanHuman, serializeOpsForCompare, declaredTargetNames } from './plan';
export type { PlanDocument, PlanSummary } from './plan';
export { loadAppConfig } from './appConfig';
export { runDoctor, builtinDoctorRules } from './doctor';
export type { DoctorRule, DoctorContext } from './doctor';
export {
  isEnvRef,
  parseSecretInput,
  resolveSecret,
  isLiteralSecret,
  redactValue,
  redactDeep,
} from './secrets';
export type { EnvRef, SecretInput } from './secrets';
export { EXIT_OK, EXIT_ERROR, EXIT_TOOL_FAILURE, exitCodeFor } from './diagnostics';
export type { Diagnostic, DiagnosticSeverity } from './diagnostics';
export { fileExecutor } from './fileExecutor';
export { reportChange, reportSkip, reportInfo, reportWarning } from './report';
export {
  ERR,
  assertBuildConfiguration,
  assertNameMatcher,
  nameMatcherToRuby,
  rubyLiteral,
} from './validation';
export type { XcodeBuildConfiguration, NameMatcher } from './validation';

export { isRecord, asRecordArray, asStringArray, compareDottedVersions } from './guards';
export { FILE_OP_KINDS, isFileOp } from './types';
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
  OpMeta,
  OpPlatform,
  OpStatus,
  OpRisk,
  PlanOperation,
  GeneratorContext,
  GeneratorResult,
  Generator,
  Executor,
} from './types';
