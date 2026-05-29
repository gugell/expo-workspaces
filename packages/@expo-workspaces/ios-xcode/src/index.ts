export { pbxExecutor } from './pbxExecutor';
export { pbxOp, isPbxOp } from './pbxOp';
export type { PbxOp, PbxApplyContext } from './pbxOp';
export { openXcodeProject, serializeXcodeProject, resolveNativeTargets } from './openProject';
export type { OpenedProject } from './openProject';
export { buildXcscheme, toBuildableReferenceVars } from './scheme/buildXcscheme';
export type { BuildXcschemeContext } from './scheme/buildXcscheme';
export { renderTemplate, renderFragment, escapeXmlAttribute } from './utils/renderTemplate';
export { normalizeSchemeDefinitions, schemeFileName } from './validate';

export { schemesGenerator } from './generators/schemes';
export { xcodeEnvGenerator } from './generators/xcodeEnv';
export { fixEmbedCycleGenerator } from './generators/fixEmbedCycle';

export type {
  SchemeDefinition,
  XcodeEnvSpec,
  NativeTargetRef,
  ResolvedNativeTargets,
  IosXcodeManifest,
  XcodeBuildConfiguration,
} from './types';
export { SCHEME_TEMPLATE_DEFAULTS } from './types';
