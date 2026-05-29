import type { NativeTargetRef, ResolvedNativeTargets, SchemeDefinition } from '../types';
import { SCHEME_TEMPLATE_DEFAULTS } from '../types';
import { renderFragment, renderTemplate } from '../utils/renderTemplate';

export interface BuildXcschemeContext {
  targets: ResolvedNativeTargets;
  xcodeprojBasename: string;
}

export function toBuildableReferenceVars(
  target: NativeTargetRef,
  xcodeprojBasename: string,
  productExtension: string,
): Record<string, string> {
  return {
    BLUEPRINT_ID: target.id,
    BLUEPRINT_NAME: target.name,
    BUILDABLE_NAME: `${target.productName}.${productExtension}`,
    XCODEPROJ_BASENAME: xcodeprojBasename,
  };
}

function renderBuildableReference(
  target: NativeTargetRef,
  xcodeprojBasename: string,
  productExtension: string,
): string {
  return renderFragment(
    'buildable-reference.xml',
    toBuildableReferenceVars(target, xcodeprojBasename, productExtension),
  );
}

function renderTestActionBlock(scheme: SchemeDefinition, context: BuildXcschemeContext): string {
  const testConfiguration: 'Debug' | 'Release' = 'Debug';

  if (scheme.includeUnitTestTarget && context.targets.unitTest) {
    const testableReference = renderBuildableReference(
      context.targets.unitTest,
      context.xcodeprojBasename,
      'xctest',
    );
    return renderFragment(
      'test-action-with-testable.xml',
      { TEST_CONFIGURATION: testConfiguration, TESTABLE_REFERENCE: testableReference },
      { rawKeys: ['TESTABLE_REFERENCE'] },
    );
  }
  return renderFragment('test-action-autocreate.xml', { TEST_CONFIGURATION: testConfiguration });
}

/** Renders a shared `.xcscheme` from templates (no inline XML in source). */
export function buildXcscheme(scheme: SchemeDefinition, context: BuildXcschemeContext): string {
  const { application } = context.targets;
  const appRefBuild = renderBuildableReference(application, context.xcodeprojBasename, 'app');
  const appRefRunnable = renderBuildableReference(application, context.xcodeprojBasename, 'app');

  return renderTemplate(
    'schemes/application.xcscheme.xml',
    {
      LAST_UPGRADE_VERSION: SCHEME_TEMPLATE_DEFAULTS.lastUpgradeVersion,
      SCHEME_VERSION: SCHEME_TEMPLATE_DEFAULTS.schemeVersion,
      BUILDABLE_REFERENCE_BUILD: appRefBuild,
      BUILDABLE_REFERENCE_RUNNABLE: appRefRunnable,
      TEST_ACTION_BLOCK: renderTestActionBlock(scheme, context),
      LAUNCH_CONFIGURATION: scheme.configuration,
      PROFILE_CONFIGURATION: scheme.archive ?? 'Release',
      ANALYZE_CONFIGURATION: scheme.analyze ?? 'Debug',
      ARCHIVE_CONFIGURATION: scheme.archive ?? 'Release',
    },
    {
      rawKeys: ['BUILDABLE_REFERENCE_BUILD', 'BUILDABLE_REFERENCE_RUNNABLE', 'TEST_ACTION_BLOCK'],
    },
  );
}
