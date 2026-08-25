import fs from 'fs';
import path from 'path';

import {
  buildPlanDocument,
  collectWorkspacePlan,
  createGeneratorContext,
  EXIT_ERROR,
  EXIT_OK,
  EXIT_TOOL_FAILURE,
  exitCodeFor,
  loadAppConfig,
  loadWorkspaceConfig,
  renderPlanHuman,
  runDoctor,
  type Diagnostic,
} from '@expo-workspaces/core';

import { workspaceGenerators } from './engine';
import { inspectNativeProject, writeMigratedConfig, type MigrationReport } from './migrate';

interface CliArgs {
  command: string;
  json: boolean;
  ci: boolean;
  verbose: boolean;
  write: boolean;
  configPath?: string;
  projectRoot: string;
  id?: string;
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2);
  const flags = new Set<string>();
  const values: Record<string, string> = {};
  const takesValue = new Set(['--project', '--config', '--manifest', '--id']);
  const positional: string[] = [];

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (takesValue.has(token)) {
      values[token] = args[i + 1] ?? '';
      i += 1;
      continue;
    }
    if (token.startsWith('-')) {
      flags.add(token);
      continue;
    }
    positional.push(token);
  }

  return {
    command: positional[0] ?? 'help',
    json: flags.has('--json'),
    ci: flags.has('--ci'),
    verbose: flags.has('--verbose') || flags.has('-v'),
    write: flags.has('--write'),
    configPath: values['--config'] || values['--manifest'] || undefined,
    projectRoot: path.resolve(values['--project'] || process.cwd()),
    id: values['--id'] || positional[1],
  };
}

function fail(message: string, code = EXIT_TOOL_FAILURE): never {
  console.error(`[expo-workspaces] ${message}`);
  process.exit(code);
}

function printDiagnostics(title: string, diagnostics: Diagnostic[], json: boolean): void {
  if (json) {
    const errors = diagnostics.filter((d) => d.severity === 'error').length;
    const warnings = diagnostics.filter((d) => d.severity === 'warning').length;
    console.log(JSON.stringify({ title, errors, warnings, diagnostics }, null, 2));
    return;
  }
  console.log(title);
  if (diagnostics.length === 0) {
    console.log('✓ healthy');
    return;
  }
  for (const d of diagnostics) {
    const mark = d.severity === 'error' ? '✗' : d.severity === 'warning' ? '⚠' : '·';
    const loc = d.source ? `  ${d.source}` : '';
    console.log(`${mark} ${d.message}${loc}`);
    if (d.hint) console.log(`    ${d.hint}`);
  }
  const errors = diagnostics.filter((d) => d.severity === 'error').length;
  const warnings = diagnostics.filter((d) => d.severity === 'warning').length;
  console.log(`${errors} errors · ${warnings} warnings`);
}

function collectPlan(args: CliArgs) {
  const ctx = createGeneratorContext(args.projectRoot, args.configPath);
  return collectWorkspacePlan(workspaceGenerators, ctx);
}

function runPlan(args: CliArgs): number {
  const plan = collectPlan(args);
  const doc = buildPlanDocument(plan);
  if (args.json) {
    console.log(JSON.stringify(doc, null, 2));
  } else {
    console.log(`Config  ${doc.configPath}`);
    console.log(renderPlanHuman(doc, args.verbose));
  }
  return EXIT_OK;
}

function runValidate(args: CliArgs): number {
  try {
    const loaded = loadWorkspaceConfig(args.projectRoot, args.configPath);
    const plan = collectPlan(args);
    const diagnostics = runDoctor({
      projectRoot: args.projectRoot,
      configPath: loaded.configPath,
      manifest: loaded.manifest,
      appConfig: loadAppConfig(args.projectRoot),
      plan,
      nodeVersion: process.versions.node,
    }).filter((d) => d.severity === 'error');
    if (args.json) {
      console.log(
        JSON.stringify(
          { valid: diagnostics.length === 0, configPath: loaded.configPath, diagnostics },
          null,
          2,
        ),
      );
    } else if (diagnostics.length === 0) {
      console.log(`✓ ${loaded.loadedAs} is valid`);
    } else {
      printDiagnostics('Validate', diagnostics, false);
    }
    return exitCodeFor(diagnostics);
  } catch (error) {
    fail((error as Error).message, EXIT_ERROR);
  }
}

function runDoctorCommand(args: CliArgs): number {
  try {
    const loaded = loadWorkspaceConfig(args.projectRoot, args.configPath);
    const plan = collectPlan(args);
    const diagnostics = runDoctor({
      projectRoot: args.projectRoot,
      configPath: loaded.configPath,
      manifest: loaded.manifest,
      appConfig: loadAppConfig(args.projectRoot),
      plan,
      nodeVersion: process.versions.node,
    });
    printDiagnostics('Expo Workspace Doctor', diagnostics, args.json);
    return exitCodeFor(diagnostics);
  } catch (error) {
    fail((error as Error).message, EXIT_ERROR);
  }
}

function runExplain(args: CliArgs): number {
  const doc = buildPlanDocument(collectPlan(args));
  const ops = args.id ? doc.operations.filter((op) => op.id === args.id || op.label === args.id) : doc.operations;
  if (args.id && ops.length === 0) {
    fail(`No operation matching "${args.id}"`, EXIT_ERROR);
  }
  if (args.json) {
    console.log(JSON.stringify(ops, null, 2));
    return EXIT_OK;
  }
  for (const op of ops) {
    console.log(`${op.id}`);
    console.log(`  kind      ${op.kind}`);
    console.log(`  source    ${op.source}`);
    console.log(`  status    ${op.status}`);
    console.log(`  label     ${op.label}`);
    if (op.files?.length) console.log(`  files     ${op.files.join(', ')}`);
    if (op.risk) console.log(`  risk      ${op.risk}`);
    console.log('');
  }
  return EXIT_OK;
}

function runDiff(args: CliArgs): number {
  const plan = collectPlan(args);
  const doc = buildPlanDocument(plan);
  const report = inspectNativeProject(args.projectRoot);
  const declaredTargets = new Set(
    doc.operations
      .filter((op) => op.kind === 'ios.target.add' && op.desired && typeof op.desired === 'object')
      .flatMap((op) => {
        const desired = op.desired as { name?: string } | Array<{ name?: string }>;
        if (Array.isArray(desired)) return desired.map((t) => t.name).filter(Boolean) as string[];
        return desired.name ? [desired.name] : [];
      }),
  );
  const extras = report.targets.filter((name) => !declaredTargets.has(name) && !isStockTarget(name));
  const missing = [...declaredTargets].filter((name) => !report.targets.includes(name));
  const payload = {
    generated: report.present,
    declaredTargets: [...declaredTargets],
    nativeTargets: report.targets,
    missingFromNative: missing,
    extraOnNative: extras,
    schemes: report.schemes,
    swiftPackages: report.swiftPackages,
  };
  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else if (!report.present) {
    console.log('No generated ios/ or android/ project found. Run expo prebuild first.');
  } else {
    console.log('Declared vs generated native state');
    if (missing.length === 0 && extras.length === 0) {
      console.log('✓ targets match configuration');
    }
    for (const name of missing) console.log(`- missing native target ${name}`);
    for (const name of extras) console.log(`+ extra native target ${name}`);
  }
  return extras.length || missing.length ? EXIT_ERROR : EXIT_OK;
}

function isStockTarget(name: string): boolean {
  return /(Tests|Watch|Pods)$/i.test(name);
}

function runMigrate(args: CliArgs): number {
  const report = inspectNativeProject(args.projectRoot);
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printMigration(report);
  }
  if (args.write) {
    const dest = writeMigratedConfig(args.projectRoot, report);
    console.log(`Wrote ${dest}`);
  }
  return EXIT_OK;
}

function printMigration(report: MigrationReport): void {
  console.log('Detected native customizations');
  if (!report.present) {
    console.log('· no ios/ or android/ directories — nothing to migrate');
    return;
  }
  console.log(`✓ ${report.targets.length} native targets`);
  console.log(`✓ ${report.swiftPackages.length} Swift packages`);
  console.log(`✓ ${report.schemes.length} schemes`);
  console.log(`✓ ${report.appGroups.length} App Groups`);
  console.log(`✓ ${report.permissions.length} Android permissions`);
  for (const unknown of report.unknown) {
    console.log(`? ${unknown} (unmodeled — will emit a TODO)`);
  }
}

function help(): number {
  console.log(`expo-workspaces <command>

Commands:
  plan       Render the semantic operation plan (no native writes)
  validate   Validate config schema and semantic constraints
  doctor     Environment, config, and native-intent checks
  explain    Explain why an operation exists (--id <op id>)
  diff       Compare declared intent with generated native state
  migrate    Inspect an existing native project (add --write to emit config)

Options:
  --json --ci --verbose --write --config <path> --project <dir> --id <op>
`);
  return EXIT_OK;
}

export async function runCli(argv = process.argv): Promise<number> {
  const args = parseArgs(argv);
  try {
    switch (args.command) {
      case 'plan':
        return runPlan(args);
      case 'validate':
        return runValidate(args);
      case 'doctor':
        return runDoctorCommand(args);
      case 'explain':
        return runExplain(args);
      case 'diff':
        return runDiff(args);
      case 'migrate':
        return runMigrate(args);
      case 'help':
      case '--help':
      case '-h':
        return help();
      default:
        fail(`Unknown command "${args.command}". Run expo-workspaces help.`);
    }
  } catch (error) {
    fail((error as Error).stack ?? (error as Error).message, EXIT_TOOL_FAILURE);
  }
}

if (require.main === module) {
  void runCli().then((code) => process.exit(code));
}
