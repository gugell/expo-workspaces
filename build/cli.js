"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// packages/@expo-workspaces/core/build/appConfig.js
var require_appConfig = __commonJS({
  "packages/@expo-workspaces/core/build/appConfig.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.loadAppConfig = loadAppConfig;
    var fs_1 = __importDefault2(require("fs"));
    var path_12 = __importDefault2(require("path"));
    function loadAppConfig(projectRoot) {
      try {
        const { getConfig } = require("@expo/config");
        return getConfig(projectRoot, { skipSDKVersionRequirement: true }).exp;
      } catch {
      }
      for (const name of ["app.json", "app.config.json"]) {
        const file = path_12.default.join(projectRoot, name);
        if (!fs_1.default.existsSync(file))
          continue;
        const parsed = JSON.parse(fs_1.default.readFileSync(file, "utf8"));
        return parsed.expo ?? parsed;
      }
      for (const name of ["app.config.js", "app.config.cjs"]) {
        const file = path_12.default.join(projectRoot, name);
        if (!fs_1.default.existsSync(file))
          continue;
        delete require.cache[require.resolve(file)];
        const mod = require(file);
        const value = typeof mod === "function" ? mod({ projectRoot }) : mod.default ?? mod;
        const obj = value;
        return obj.expo ?? obj;
      }
      return { name: path_12.default.basename(projectRoot) };
    }
  }
});

// packages/@expo-workspaces/core/build/guards.js
var require_guards = __commonJS({
  "packages/@expo-workspaces/core/build/guards.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isRecord = isRecord;
    exports2.asRecordArray = asRecordArray;
    exports2.asStringArray = asStringArray;
    exports2.compareDottedVersions = compareDottedVersions;
    function isRecord(value) {
      return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }
    function asRecordArray(value) {
      if (!Array.isArray(value))
        return [];
      return value.filter(isRecord);
    }
    function asStringArray(value) {
      if (typeof value === "string" && value.length > 0)
        return [value];
      if (!Array.isArray(value))
        return [];
      return value.filter((entry) => typeof entry === "string" && entry.length > 0);
    }
    function compareDottedVersions(left, right) {
      const a = left.split(".").map((part) => Number.parseInt(part, 10) || 0);
      const b = right.split(".").map((part) => Number.parseInt(part, 10) || 0);
      const length = Math.max(a.length, b.length);
      for (let i = 0; i < length; i += 1) {
        const delta = (a[i] ?? 0) - (b[i] ?? 0);
        if (delta !== 0)
          return delta;
      }
      return 0;
    }
  }
});

// packages/@expo-workspaces/core/build/validation.js
var require_validation = __commonJS({
  "packages/@expo-workspaces/core/build/validation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ERR = void 0;
    exports2.assertBuildConfiguration = assertBuildConfiguration;
    exports2.rubyLiteral = rubyLiteral;
    exports2.nameMatcherToRuby = nameMatcherToRuby;
    exports2.assertNameMatcher = assertNameMatcher;
    exports2.ERR = "[expo-workspaces]";
    var BUILD_CONFIGURATIONS = /* @__PURE__ */ new Set(["Debug", "Release"]);
    function assertBuildConfiguration(value, label) {
      if (!BUILD_CONFIGURATIONS.has(value)) {
        throw new Error(`${exports2.ERR} ${label} must be "Debug" or "Release", received "${value}".`);
      }
    }
    function rubyLiteral(value) {
      return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
    }
    function nameMatcherToRuby(matcher) {
      if (typeof matcher === "string") {
        return `target.name == ${rubyLiteral(matcher.trim())}`;
      }
      const conditions = [];
      if (matcher.equals) {
        conditions.push(`target.name == ${rubyLiteral(matcher.equals.trim())}`);
      }
      if (matcher.startsWith) {
        conditions.push(`target.name.start_with?(${rubyLiteral(matcher.startsWith.trim())})`);
      }
      if (matcher.regex) {
        conditions.push(`target.name =~ /${matcher.regex}/`);
      }
      return conditions.join(" && ");
    }
    function assertNameMatcher(matcher, label) {
      if (!matcher) {
        throw new Error(`${exports2.ERR} ${label} requires a target matcher.`);
      }
      if (typeof matcher === "string") {
        if (!matcher.trim()) {
          throw new Error(`${exports2.ERR} ${label} matcher cannot be empty.`);
        }
        return;
      }
      const m = matcher;
      if (!m.equals && !m.startsWith && !m.regex) {
        throw new Error(`${exports2.ERR} ${label} requires at least one of "equals" | "startsWith" | "regex".`);
      }
    }
  }
});

// packages/@expo-workspaces/core/build/normalize.js
var require_normalize = __commonJS({
  "packages/@expo-workspaces/core/build/normalize.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.normalizeWorkspaceConfig = normalizeWorkspaceConfig;
    var guards_1 = require_guards();
    var validation_1 = require_validation();
    function asArray(value) {
      return Array.isArray(value) ? value : void 0;
    }
    function normalizeWorkspaceConfig(raw) {
      if (!(0, guards_1.isRecord)(raw)) {
        throw new Error(`${validation_1.ERR} Workspace config must export an object (received ${typeof raw}).`);
      }
      const nestedIos = (0, guards_1.isRecord)(raw.ios) ? raw.ios : void 0;
      const version = raw.schemaVersion ?? raw.manifestVersion ?? 1;
      if (version !== 1) {
        throw new Error(`${validation_1.ERR} Unsupported schemaVersion/manifestVersion: ${String(version)}. Expected 1.`);
      }
      const targets = pick(nestedIos?.targets, raw.targets);
      const targetsRoot = pick(nestedIos?.targetsRoot, raw.targetsRoot);
      const schemes = pick(nestedIos?.schemes, raw.schemes);
      const replaceExpoScheme = pick(nestedIos?.replaceExpoScheme, raw.replaceExpoScheme);
      const fixExtensionEmbedCycle = pick(nestedIos?.fixExtensionEmbedCycle, raw.fixExtensionEmbedCycle);
      const nestedXcode = (0, guards_1.isRecord)(nestedIos?.xcode) ? nestedIos.xcode : void 0;
      const xcodeEnv = pick(nestedXcode?.env, pick(nestedIos?.xcodeEnv, raw.xcodeEnv));
      const { localPods, remotePods } = splitPods(nestedIos, raw);
      const podBuildSettings = pick(nestedIos?.podBuildSettings, raw.podBuildSettings);
      const removePodBuildPhases = pick(nestedIos?.removePodBuildPhases, raw.removePodBuildPhases);
      const swiftPackages = mergeSwiftPackages(nestedIos, raw);
      const android = pick(raw.android, void 0);
      const patches = pick(raw.patches, void 0);
      const deploymentTarget = typeof nestedIos?.deploymentTarget === "string" ? nestedIos.deploymentTarget : void 0;
      const targetsWithDefault = applyDefaultDeploymentTarget(targets, deploymentTarget);
      const manifest = {
        manifestVersion: 1,
        schemaVersion: 1
      };
      assign(manifest, "targets", targetsWithDefault);
      assign(manifest, "targetsRoot", targetsRoot);
      assign(manifest, "schemes", schemes);
      assign(manifest, "replaceExpoScheme", replaceExpoScheme);
      assign(manifest, "fixExtensionEmbedCycle", fixExtensionEmbedCycle);
      assign(manifest, "xcodeEnv", xcodeEnv);
      assign(manifest, "localPods", localPods);
      assign(manifest, "remotePods", remotePods);
      assign(manifest, "podBuildSettings", podBuildSettings);
      assign(manifest, "removePodBuildPhases", removePodBuildPhases);
      assign(manifest, "swiftPackages", swiftPackages);
      assign(manifest, "android", android);
      assign(manifest, "patches", patches);
      assign(manifest, "iosDeploymentTarget", deploymentTarget);
      return manifest;
    }
    function pick(nested, flat) {
      return nested !== void 0 ? nested : flat;
    }
    function assign(target, key, value) {
      if (value !== void 0) {
        target[key] = value;
      }
    }
    function splitPods(nestedIos, raw) {
      const nestedPods = asArray(nestedIos?.pods);
      if (nestedPods) {
        const localPods = nestedPods.filter((pod) => typeof pod.path === "string" && pod.path);
        const remotePods = nestedPods.filter((pod) => !pod.path);
        return {
          localPods: localPods.length ? localPods : pick(nestedIos?.localPods, raw.localPods),
          remotePods: remotePods.length ? remotePods : pick(nestedIos?.remotePods, raw.remotePods)
        };
      }
      return {
        localPods: pick(nestedIos?.localPods, raw.localPods),
        remotePods: pick(nestedIos?.remotePods, raw.remotePods)
      };
    }
    function mergeSwiftPackages(nestedIos, raw) {
      const packages = asArray(nestedIos?.packages);
      const nestedSlice = (0, guards_1.isRecord)(nestedIos?.swiftPackages) ? nestedIos.swiftPackages : void 0;
      const flatSlice = (0, guards_1.isRecord)(raw.swiftPackages) ? raw.swiftPackages : void 0;
      const base = nestedSlice ?? flatSlice ?? {};
      if (!packages) {
        return Object.keys(base).length ? base : void 0;
      }
      const remote = [
        ...asArray(base.remote) ?? [],
        ...packages.filter((pkg) => typeof pkg.url === "string" && pkg.url)
      ];
      const local = [
        ...asArray(base.local) ?? [],
        ...packages.filter((pkg) => typeof pkg.path === "string" && pkg.path && !pkg.url)
      ];
      return {
        ...remote.length ? { remote } : {},
        ...local.length ? { local } : {}
      };
    }
    function applyDefaultDeploymentTarget(targets, deploymentTarget) {
      if (!deploymentTarget || !Array.isArray(targets)) {
        return targets;
      }
      return targets.map((target) => {
        if (!(0, guards_1.isRecord)(target) || typeof target.deploymentTarget === "string") {
          return target;
        }
        return { ...target, deploymentTarget };
      });
    }
  }
});

// packages/@expo-workspaces/core/build/loadConfig.js
var require_loadConfig = __commonJS({
  "packages/@expo-workspaces/core/build/loadConfig.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_MANIFEST_FILENAME = exports2.DEFAULT_CONFIG_FILENAMES = void 0;
    exports2.resolveConfigPath = resolveConfigPath;
    exports2.loadWorkspaceConfig = loadWorkspaceConfig;
    var fs_1 = __importDefault2(require("fs"));
    var path_12 = __importDefault2(require("path"));
    var normalize_1 = require_normalize();
    var validation_1 = require_validation();
    exports2.DEFAULT_CONFIG_FILENAMES = [
      "workspace.config.ts",
      "workspace.config.js",
      "workspace.config.mjs",
      "workspace.config.cjs",
      "workspace.manifest.ts",
      "workspace.manifest.js"
    ];
    exports2.DEFAULT_MANIFEST_FILENAME = "workspace.manifest.js";
    function resolveConfigPath(projectRoot, configPath) {
      if (configPath) {
        return path_12.default.resolve(projectRoot, configPath);
      }
      for (const name of exports2.DEFAULT_CONFIG_FILENAMES) {
        const candidate = path_12.default.resolve(projectRoot, name);
        if (fs_1.default.existsSync(candidate)) {
          return candidate;
        }
      }
      return path_12.default.resolve(projectRoot, exports2.DEFAULT_CONFIG_FILENAMES[0]);
    }
    function loadWorkspaceConfig(projectRoot, configPath) {
      const resolved = resolveConfigPath(projectRoot, configPath);
      if (!fs_1.default.existsSync(resolved)) {
        const searched = configPath ? resolved : exports2.DEFAULT_CONFIG_FILENAMES.map((name) => path_12.default.join(projectRoot, name)).join(", ");
        throw new Error(`${validation_1.ERR} Workspace config not found. Looked for: ${searched}. Create workspace.config.ts at the app root, or set the "configPath" plugin option.`);
      }
      const exported = loadModule(resolved);
      const manifest = (0, normalize_1.normalizeWorkspaceConfig)(exported);
      return {
        manifest,
        configPath: resolved,
        loadedAs: path_12.default.basename(resolved)
      };
    }
    function loadModule(filePath) {
      const ext = path_12.default.extname(filePath).toLowerCase();
      try {
        if (ext === ".ts" || ext === ".mts" || ext === ".tsx") {
          return unwrapDefault(loadTypeScript(filePath));
        }
        delete require.cache[require.resolve(filePath)];
        return unwrapDefault(require(filePath));
      } catch (error) {
        throw new Error(`${validation_1.ERR} Failed to load config ${filePath}: ${error.message}`);
      }
    }
    function unwrapDefault(mod) {
      if (mod && typeof mod === "object" && "default" in mod) {
        const def = mod.default;
        if (def !== void 0) {
          return def;
        }
      }
      return mod;
    }
    function loadTypeScript(filePath) {
      const jiti = require("jiti");
      return jiti(__filename, {
        interopDefault: false,
        alias: {
          "expo-workspaces": resolveExpoWorkspacesModule()
        }
      })(filePath);
    }
    function resolveExpoWorkspacesModule() {
      try {
        return require.resolve("expo-workspaces");
      } catch {
        const bundled = path_12.default.resolve(__dirname, "../../../../build/index.js");
        if (fs_1.default.existsSync(bundled))
          return bundled;
        try {
          return require.resolve("@expo-workspaces/meta");
        } catch {
          return path_12.default.resolve(__dirname, "..");
        }
      }
    }
  }
});

// packages/@expo-workspaces/core/build/pipeline.js
var require_pipeline = __commonJS({
  "packages/@expo-workspaces/core/build/pipeline.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.collectWorkspacePlan = collectWorkspacePlan;
    function collectWorkspacePlan(generators, ctx) {
      const working = { ...ctx, config: ctx.config };
      for (const generator of generators) {
        if (generator.contributeConfig) {
          working.config = generator.contributeConfig(working.config, working);
        }
      }
      const ops = [];
      const warnings = [];
      for (const generator of generators) {
        const result = generator.generate(working);
        ops.push(...result.ops);
        for (const warning of result.warnings ?? []) {
          warnings.push(`${generator.name}: ${warning}`);
        }
      }
      return {
        ops,
        warnings,
        config: working.config,
        configPath: working.configPath,
        projectRoot: working.projectRoot
      };
    }
  }
});

// packages/@expo-workspaces/core/build/report.js
var require_report = __commonJS({
  "packages/@expo-workspaces/core/build/report.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.reportChange = reportChange;
    exports2.reportSkip = reportSkip;
    exports2.reportInfo = reportInfo;
    exports2.reportWarning = reportWarning;
    var PREFIX = "[expo-workspaces]";
    function reportChange(label, file) {
      console.log(`${PREFIX} ${label} \u2192 ${file}`);
    }
    function reportSkip(label, file) {
      console.log(`${PREFIX} ${label} (unchanged) \u2192 ${file}`);
    }
    function reportInfo(message) {
      console.log(`${PREFIX} ${message}`);
    }
    function reportWarning(message) {
      console.warn(`${PREFIX} warning: ${message}`);
    }
  }
});

// packages/@expo-workspaces/core/build/createWorkspace.js
var require_createWorkspace = __commonJS({
  "packages/@expo-workspaces/core/build/createWorkspace.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createWorkspace = createWorkspace;
    exports2.createGeneratorContext = createGeneratorContext;
    var appConfig_1 = require_appConfig();
    var loadConfig_1 = require_loadConfig();
    var pipeline_1 = require_pipeline();
    var report_1 = require_report();
    function createWorkspace({ generators, executors }) {
      return (config, props = {}) => {
        const projectRoot = config._internal?.projectRoot ?? process.cwd();
        const loaded = (0, loadConfig_1.loadWorkspaceConfig)(projectRoot, props.configPath ?? props.manifestPath);
        (0, report_1.reportInfo)(`loaded ${loaded.loadedAs} (${loaded.configPath})`);
        const ctx = {
          manifest: loaded.manifest,
          config,
          projectRoot,
          configPath: loaded.configPath
        };
        const plan = (0, pipeline_1.collectWorkspacePlan)(generators, ctx);
        for (const warning of plan.warnings) {
          (0, report_1.reportWarning)(warning);
        }
        let next = plan.config;
        for (const executor of executors) {
          next = executor(next, plan.ops);
        }
        return next;
      };
    }
    function createGeneratorContext(projectRoot, configPath, appConfig) {
      const loaded = (0, loadConfig_1.loadWorkspaceConfig)(projectRoot, configPath);
      return {
        manifest: loaded.manifest,
        config: appConfig ?? (0, appConfig_1.loadAppConfig)(projectRoot),
        projectRoot,
        configPath: loaded.configPath
      };
    }
  }
});

// packages/@expo-workspaces/core/build/loadManifest.js
var require_loadManifest = __commonJS({
  "packages/@expo-workspaces/core/build/loadManifest.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_MANIFEST_FILENAME = void 0;
    exports2.resolveManifestPath = resolveManifestPath;
    exports2.loadManifest = loadManifest;
    var loadConfig_1 = require_loadConfig();
    Object.defineProperty(exports2, "DEFAULT_MANIFEST_FILENAME", { enumerable: true, get: function() {
      return loadConfig_1.DEFAULT_MANIFEST_FILENAME;
    } });
    function resolveManifestPath(projectRoot, manifestPath) {
      return (0, loadConfig_1.resolveConfigPath)(projectRoot, manifestPath);
    }
    function loadManifest(projectRoot, manifestPath) {
      return (0, loadConfig_1.loadWorkspaceConfig)(projectRoot, manifestPath).manifest;
    }
  }
});

// packages/@expo-workspaces/core/build/ops.js
var require_ops = __commonJS({
  "packages/@expo-workspaces/core/build/ops.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.withMeta = withMeta;
    exports2.toPlanOperation = toPlanOperation;
    function withMeta(op, meta) {
      return { ...op, meta };
    }
    function toPlanOperation(op, index) {
      const meta = op.meta;
      return {
        id: meta?.id ?? `${op.kind}:${index}`,
        platform: meta?.platform ?? inferPlatform(op),
        kind: meta?.semanticKind ?? op.kind,
        source: meta?.source ?? "(generator)",
        status: meta?.status ?? "add",
        label: op.label,
        files: meta?.files,
        risk: meta?.risk,
        desired: meta?.desired,
        current: meta?.current,
        phase: meta?.phase,
        executorKind: op.kind
      };
    }
    function inferPlatform(op) {
      const base = op.base;
      if (base === "android")
        return "android";
      if (base === "ios" || base === "project")
        return "ios";
      if (op.kind.startsWith("android"))
        return "android";
      if (op.kind === "pbx" || op.kind === "patch")
        return "ios";
      return "shared";
    }
  }
});

// packages/@expo-workspaces/core/build/secrets.js
var require_secrets = __commonJS({
  "packages/@expo-workspaces/core/build/secrets.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isEnvRef = isEnvRef;
    exports2.parseSecretInput = parseSecretInput;
    exports2.resolveSecret = resolveSecret;
    exports2.isLiteralSecret = isLiteralSecret;
    exports2.redactValue = redactValue;
    exports2.redactDeep = redactDeep;
    var validation_1 = require_validation();
    var SECRET_KEY = /password|secret|keyPassword|storePassword/i;
    function isEnvRef(value) {
      return Boolean(value) && typeof value === "object" && typeof value.env === "string";
    }
    function parseSecretInput(value) {
      if (value == null) {
        return void 0;
      }
      if (typeof value === "string") {
        if (value.startsWith("env:")) {
          return { env: value.slice(4) };
        }
        return value;
      }
      if (isEnvRef(value)) {
        return value;
      }
      throw new Error(`${validation_1.ERR} Secret field must be a string or { env: "VAR_NAME" }.`);
    }
    function resolveSecret(value, label) {
      const parsed = parseSecretInput(value);
      if (parsed == null) {
        return "";
      }
      if (isEnvRef(parsed)) {
        const resolved = process.env[parsed.env];
        if (!resolved) {
          throw new Error(`${validation_1.ERR} ${label} references missing environment variable "${parsed.env}".`);
        }
        return resolved;
      }
      return parsed;
    }
    function isLiteralSecret(value) {
      const parsed = parseSecretInput(value);
      return typeof parsed === "string" && parsed.length > 0;
    }
    function redactValue(value) {
      if (typeof value === "string" && value.length > 0) {
        return "********";
      }
      if (isEnvRef(value)) {
        return { env: value.env };
      }
      return value;
    }
    function redactDeep(value) {
      return redactWalk(value);
    }
    function redactWalk(value) {
      if (Array.isArray(value)) {
        return value.map(redactWalk);
      }
      if (value && typeof value === "object") {
        const out = {};
        for (const [key, nested] of Object.entries(value)) {
          out[key] = SECRET_KEY.test(key) ? redactValue(nested) : redactWalk(nested);
        }
        return out;
      }
      return value;
    }
  }
});

// packages/@expo-workspaces/core/build/plan.js
var require_plan = __commonJS({
  "packages/@expo-workspaces/core/build/plan.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.buildPlanDocument = buildPlanDocument;
    exports2.renderPlanHuman = renderPlanHuman;
    exports2.declaredTargetNames = declaredTargetNames;
    exports2.serializeOpsForCompare = serializeOpsForCompare;
    var ops_1 = require_ops();
    var secrets_1 = require_secrets();
    var guards_1 = require_guards();
    function buildPlanDocument(plan, warnings = plan.warnings) {
      const operations = (0, secrets_1.redactDeep)(plan.ops.map((op, index) => (0, ops_1.toPlanOperation)(op, index)));
      return {
        valid: true,
        configPath: plan.configPath,
        summary: {
          operations: operations.length,
          warnings: warnings.length,
          conflicts: 0
        },
        warnings,
        operations
      };
    }
    function renderPlanHuman(doc, verbose = false) {
      const lines = ["expo-workspaces", ""];
      const byPlatform = groupBy(doc.operations, (op) => op.platform);
      for (const platform of ["ios", "android", "shared"]) {
        const ops = byPlatform.get(platform);
        if (!ops?.length)
          continue;
        lines.push(platform === "ios" ? "iOS" : platform === "android" ? "Android" : "Shared");
        const byDomain = groupBy(ops, (op) => domainOf(op.kind));
        for (const [domain, domainOps] of byDomain) {
          lines.push(domain.toUpperCase());
          for (const op of domainOps) {
            lines.push(`  ${statusMark(op.status)} ${op.label}`);
            if (verbose) {
              lines.push(`      ${op.kind}  source=${op.source}  id=${op.id}`);
              if (op.files?.length) {
                lines.push(`      files  ${op.files.join(", ")}`);
              }
            } else if (op.source) {
              lines.push(`      ${op.source}`);
            }
          }
          lines.push("");
        }
      }
      lines.push(`${doc.summary.operations} native operations`);
      lines.push(`${doc.summary.conflicts} conflicts`);
      if (doc.warnings.length) {
        lines.push(`${doc.warnings.length} warnings`);
        for (const warning of doc.warnings) {
          lines.push(`  \u26A0 ${warning}`);
        }
      }
      lines.push(doc.valid ? "\u2713 Workspace valid" : "\u2717 Workspace invalid");
      return lines.join("\n");
    }
    function domainOf(kind) {
      const parts = kind.split(".");
      if (parts.length >= 2) {
        return parts[1];
      }
      return kind;
    }
    function statusMark(status) {
      switch (status) {
        case "add":
          return "+";
        case "update":
          return "~";
        case "remove":
          return "-";
        default:
          return "\xB7";
      }
    }
    function groupBy(items, key) {
      const map = /* @__PURE__ */ new Map();
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
    function declaredTargetNames(operations) {
      const names = /* @__PURE__ */ new Set();
      for (const op of operations) {
        if (op.kind !== "ios.target.add" || op.desired == null)
          continue;
        for (const name of namesFromDesired(op.desired)) {
          names.add(name);
        }
      }
      return [...names];
    }
    function namesFromDesired(desired) {
      if (Array.isArray(desired)) {
        return desired.flatMap(namesFromDesired);
      }
      if ((0, guards_1.isRecord)(desired) && typeof desired.name === "string" && desired.name) {
        return [desired.name];
      }
      return [];
    }
    function serializeOpsForCompare(ops) {
      return JSON.stringify(ops.map((op, index) => (0, ops_1.toPlanOperation)(op, index)));
    }
  }
});

// packages/@expo-workspaces/core/build/doctor.js
var require_doctor = __commonJS({
  "packages/@expo-workspaces/core/build/doctor.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.builtinDoctorRules = void 0;
    exports2.runDoctor = runDoctor;
    var fs_1 = __importDefault2(require("fs"));
    var path_12 = __importDefault2(require("path"));
    var guards_1 = require_guards();
    var secrets_1 = require_secrets();
    var MIN_NODE = [20, 19, 4];
    var MIN_EXPO_SDK = 56;
    exports2.builtinDoctorRules = [
      {
        id: "config-loaded",
        title: "Config file can be loaded",
        run({ configPath }) {
          if (!fs_1.default.existsSync(configPath)) {
            return [
              {
                id: "config-loaded",
                severity: "error",
                message: `Workspace config not found at ${configPath}`,
                hint: "Create workspace.config.ts at the app root."
              }
            ];
          }
          return [];
        }
      },
      {
        id: "node-version",
        title: "Supported Node version",
        run({ nodeVersion }) {
          const [major, minor, patch] = nodeVersion.split(".").map((p) => Number.parseInt(p, 10));
          const ok = major > MIN_NODE[0] || major === MIN_NODE[0] && minor > MIN_NODE[1] || major === MIN_NODE[0] && minor === MIN_NODE[1] && patch >= MIN_NODE[2];
          if (!ok) {
            return [
              {
                id: "node-version",
                severity: "error",
                message: `Node ${nodeVersion} is below the minimum ${MIN_NODE.join(".")}`
              }
            ];
          }
          return [];
        }
      },
      {
        id: "expo-sdk",
        title: "Supported Expo SDK",
        run({ projectRoot }) {
          const sdk = readExpoSdk(projectRoot);
          if (sdk == null) {
            return [
              {
                id: "expo-sdk",
                severity: "warning",
                message: "Could not determine Expo SDK version from node_modules/expo or package.json"
              }
            ];
          }
          if (sdk < MIN_EXPO_SDK) {
            return [
              {
                id: "expo-sdk",
                severity: "error",
                message: `Expo SDK ${sdk} is below the minimum supported SDK ${MIN_EXPO_SDK}`
              }
            ];
          }
          return [];
        }
      },
      {
        id: "unique-target-names",
        title: "Target names are unique",
        run({ manifest }) {
          const names = targetList(manifest).map((t) => String(t.name ?? ""));
          return duplicateDiagnostics("unique-target-names", names, "Duplicate target name");
        }
      },
      {
        id: "unique-bundle-ids",
        title: "Target bundle identifiers are unique",
        run({ manifest }) {
          const ids = targetList(manifest).map((t) => typeof t.bundleIdentifier === "string" ? t.bundleIdentifier : "").filter(Boolean);
          return duplicateDiagnostics("unique-bundle-ids", ids, "Duplicate bundle identifier");
        }
      },
      {
        id: "deployment-target",
        title: "Extension deployment targets are not lower than the workspace default",
        run({ manifest }) {
          const floor = typeof manifest.iosDeploymentTarget === "string" ? manifest.iosDeploymentTarget : void 0;
          if (!floor)
            return [];
          const diagnostics = [];
          targetList(manifest).forEach((target, index) => {
            const dt = typeof target.deploymentTarget === "string" ? target.deploymentTarget : void 0;
            if (dt && (0, guards_1.compareDottedVersions)(dt, floor) < 0) {
              diagnostics.push({
                id: "deployment-target",
                severity: "warning",
                source: `ios.targets[${index}]`,
                message: `${target.name} deployment target ${dt} is lower than workspace ${floor}`,
                hint: "Extensions should match or exceed the application deployment target."
              });
            }
          });
          return diagnostics;
        }
      },
      {
        id: "app-groups",
        title: "App Group entitlements are consistent with the parent app",
        run({ manifest, appConfig }) {
          const appGroups = (0, guards_1.asStringArray)(appConfig.ios?.entitlements?.["com.apple.security.application-groups"]);
          const diagnostics = [];
          targetList(manifest).forEach((target, index) => {
            const groups = (0, guards_1.asStringArray)((0, guards_1.isRecord)(target.entitlements) ? target.entitlements["com.apple.security.application-groups"] : void 0);
            for (const group of groups) {
              if (appGroups.length > 0 && !appGroups.includes(group)) {
                diagnostics.push({
                  id: "app-groups",
                  severity: "error",
                  source: `ios.targets[${index}]`,
                  message: `${target.name} requires ${group} but the main target does not declare that App Group`,
                  hint: "Add the group to expo.ios.entitlements in app.json, or to the extension only if it is exclusive."
                });
              }
            }
          });
          return diagnostics;
        }
      },
      {
        id: "spm-targets",
        title: "Declared Swift Package products resolve to intended targets",
        run({ manifest }) {
          const targetNames = new Set(targetList(manifest).map((t) => String(t.name)));
          const diagnostics = [];
          const slice = (0, guards_1.isRecord)(manifest.swiftPackages) ? manifest.swiftPackages : {};
          const packages = [
            ...(0, guards_1.asRecordArray)(slice.remote).map((pkg, i) => ({ pkg, source: `ios.packages.remote[${i}]` })),
            ...(0, guards_1.asRecordArray)(slice.local).map((pkg, i) => ({ pkg, source: `ios.packages.local[${i}]` }))
          ];
          for (const { pkg, source } of packages) {
            for (const name of (0, guards_1.asStringArray)(pkg.target)) {
              if (targetNames.size > 0 && !targetNames.has(name)) {
                diagnostics.push({
                  id: "spm-targets",
                  severity: "error",
                  source,
                  message: `Swift package product is linked to unknown target "${name}"`
                });
              }
            }
          }
          return diagnostics;
        }
      },
      {
        id: "signing-secrets",
        title: "Signing secrets are not committed as literals",
        run({ manifest }) {
          const android = (0, guards_1.isRecord)(manifest.android) ? manifest.android : void 0;
          const signing = android && (0, guards_1.isRecord)(android.signing) ? android.signing : void 0;
          if (!signing)
            return [];
          const diagnostics = [];
          for (const field of ["storePassword", "keyPassword"]) {
            if ((0, secrets_1.isLiteralSecret)(signing[field])) {
              diagnostics.push({
                id: "signing-secrets",
                severity: "warning",
                source: `android.signing.${field}`,
                message: `${field} is a literal value. Prefer { env: "VAR" } or "env:VAR".`,
                hint: "Literal secrets in git are unsafe. Use EAS Secrets or environment variables."
              });
            }
          }
          return diagnostics;
        }
      }
    ];
    function runDoctor(ctx, rules = exports2.builtinDoctorRules) {
      const diagnostics = [];
      for (const rule of rules) {
        diagnostics.push(...rule.run(ctx));
      }
      return diagnostics;
    }
    function targetList(manifest) {
      return (0, guards_1.asRecordArray)(manifest.targets);
    }
    function duplicateDiagnostics(id, values, label) {
      const seen = /* @__PURE__ */ new Set();
      const diagnostics = [];
      for (const value of values) {
        if (!value)
          continue;
        if (seen.has(value)) {
          diagnostics.push({ id, severity: "error", message: `${label} "${value}"` });
        }
        seen.add(value);
      }
      return diagnostics;
    }
    function readExpoSdk(projectRoot) {
      const expoPkg = path_12.default.join(projectRoot, "node_modules", "expo", "package.json");
      if (fs_1.default.existsSync(expoPkg)) {
        try {
          const json = JSON.parse(fs_1.default.readFileSync(expoPkg, "utf8"));
          const major = Number.parseInt(String(json.version ?? "").split(".")[0], 10);
          return Number.isFinite(major) ? major : null;
        } catch {
          return null;
        }
      }
      const pkg = path_12.default.join(projectRoot, "package.json");
      if (!fs_1.default.existsSync(pkg))
        return null;
      try {
        const json = JSON.parse(fs_1.default.readFileSync(pkg, "utf8"));
        const range = json.dependencies?.expo ?? json.devDependencies?.expo;
        if (!range)
          return null;
        const match = range.match(/(\d+)/);
        return match ? Number.parseInt(match[1], 10) : null;
      } catch {
        return null;
      }
    }
  }
});

// packages/@expo-workspaces/core/build/diagnostics.js
var require_diagnostics = __commonJS({
  "packages/@expo-workspaces/core/build/diagnostics.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.EXIT_TOOL_FAILURE = exports2.EXIT_ERROR = exports2.EXIT_OK = void 0;
    exports2.exitCodeFor = exitCodeFor;
    exports2.EXIT_OK = 0;
    exports2.EXIT_ERROR = 1;
    exports2.EXIT_TOOL_FAILURE = 2;
    function exitCodeFor(diagnostics, toolFailed = false) {
      if (toolFailed)
        return exports2.EXIT_TOOL_FAILURE;
      if (diagnostics.some((d) => d.severity === "error"))
        return exports2.EXIT_ERROR;
      return exports2.EXIT_OK;
    }
  }
});

// packages/@expo-workspaces/core/build/types.js
var require_types = __commonJS({
  "packages/@expo-workspaces/core/build/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FILE_OP_KINDS = void 0;
    exports2.isFileOp = isFileOp;
    exports2.FILE_OP_KINDS = /* @__PURE__ */ new Set(["writeFile", "mergeBlock", "appendOnce", "deleteGlob"]);
    function isFileOp(op) {
      return exports2.FILE_OP_KINDS.has(op.kind);
    }
  }
});

// packages/@expo-workspaces/core/build/fileExecutor.js
var require_fileExecutor = __commonJS({
  "packages/@expo-workspaces/core/build/fileExecutor.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fileExecutor = void 0;
    var fs_1 = __importDefault2(require("fs"));
    var path_12 = __importDefault2(require("path"));
    var config_plugins_1 = require("@expo/config-plugins");
    var generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
    var report_1 = require_report();
    var types_1 = require_types();
    var ERR = "[expo-workspaces]";
    function applyFileOps(platform, ops) {
      return (config) => (0, config_plugins_1.withDangerousMod)(config, [
        platform,
        async (config2) => {
          const { platformProjectRoot, projectRoot } = config2.modRequest;
          const baseDir = (base) => base === "project" ? projectRoot : platformProjectRoot;
          for (const op of ops) {
            if (op.kind === "writeFile") {
              const filePath = path_12.default.resolve(baseDir(op.base), op.path);
              if (op.overwrite === "ifAbsent" && fs_1.default.existsSync(filePath)) {
                (0, report_1.reportSkip)(op.label, filePath);
                continue;
              }
              if (fs_1.default.existsSync(filePath) && fs_1.default.readFileSync(filePath, "utf8") === op.contents) {
                (0, report_1.reportSkip)(op.label, filePath);
                continue;
              }
              fs_1.default.mkdirSync(path_12.default.dirname(filePath), { recursive: true });
              fs_1.default.writeFileSync(filePath, op.contents, "utf8");
              (0, report_1.reportChange)(op.label, filePath);
              continue;
            }
            if (op.kind === "mergeBlock") {
              const filePath = path_12.default.resolve(baseDir(op.base), op.path);
              if (!fs_1.default.existsSync(filePath)) {
                throw new Error(`${ERR} ${op.label}: file not found at ${filePath}.`);
              }
              const original = fs_1.default.readFileSync(filePath, "utf8");
              const result = (0, generateCode_1.mergeContents)({
                tag: op.tag,
                src: original,
                newSrc: op.newSrc,
                anchor: op.anchor,
                offset: op.offset,
                comment: op.comment
              });
              let contents;
              if (!result.didMerge && !result.didClear) {
                const beginMarker = `${op.comment} @generated begin ${op.tag}`;
                if (original.includes(beginMarker)) {
                  (0, report_1.reportSkip)(op.label, filePath);
                  continue;
                }
                if (!op.appendIfNoAnchor) {
                  throw new Error(`${ERR} ${op.label}: anchor ${op.anchor} not found in ${filePath}.`);
                }
                contents = `${original.trimEnd()}

${op.comment} ${op.tag}
${op.newSrc}
`;
              } else {
                contents = result.contents;
              }
              if (contents !== original) {
                fs_1.default.writeFileSync(filePath, contents, "utf8");
                (0, report_1.reportChange)(op.label, filePath);
              } else {
                (0, report_1.reportSkip)(op.label, filePath);
              }
              continue;
            }
            if (op.kind === "appendOnce") {
              const filePath = path_12.default.resolve(baseDir(op.base), op.path);
              if (!fs_1.default.existsSync(filePath)) {
                throw new Error(`${ERR} ${op.label}: file not found at ${filePath}.`);
              }
              const original = fs_1.default.readFileSync(filePath, "utf8");
              if (original.includes(op.marker)) {
                (0, report_1.reportSkip)(op.label, filePath);
                continue;
              }
              fs_1.default.writeFileSync(filePath, `${original}

${op.contents}`, "utf8");
              (0, report_1.reportChange)(op.label, filePath);
              continue;
            }
            const dirPath = path_12.default.resolve(baseDir(op.base), op.dir);
            if (!fs_1.default.existsSync(dirPath)) {
              continue;
            }
            for (const entry of fs_1.default.readdirSync(dirPath)) {
              if (op.match(entry)) {
                fs_1.default.unlinkSync(path_12.default.join(dirPath, entry));
                (0, report_1.reportChange)(op.label, path_12.default.join(dirPath, entry));
              }
            }
          }
          return config2;
        }
      ]);
    }
    var fileExecutor = (config, ops) => {
      const fileOps = ops.filter(types_1.isFileOp);
      if (fileOps.length === 0) {
        return config;
      }
      const iosOps = fileOps.filter((o) => (o.base ?? "ios") !== "android");
      const androidOps = fileOps.filter((o) => o.base === "android");
      if (iosOps.length > 0) {
        config = applyFileOps("ios", iosOps)(config, void 0);
      }
      if (androidOps.length > 0) {
        config = applyFileOps("android", androidOps)(config, void 0);
      }
      return config;
    };
    exports2.fileExecutor = fileExecutor;
  }
});

// packages/@expo-workspaces/core/build/index.js
var require_build = __commonJS({
  "packages/@expo-workspaces/core/build/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isFileOp = exports2.FILE_OP_KINDS = exports2.compareDottedVersions = exports2.asStringArray = exports2.asRecordArray = exports2.isRecord = exports2.rubyLiteral = exports2.nameMatcherToRuby = exports2.assertNameMatcher = exports2.assertBuildConfiguration = exports2.ERR = exports2.reportWarning = exports2.reportInfo = exports2.reportSkip = exports2.reportChange = exports2.fileExecutor = exports2.exitCodeFor = exports2.EXIT_TOOL_FAILURE = exports2.EXIT_ERROR = exports2.EXIT_OK = exports2.redactDeep = exports2.redactValue = exports2.isLiteralSecret = exports2.resolveSecret = exports2.parseSecretInput = exports2.isEnvRef = exports2.builtinDoctorRules = exports2.runDoctor = exports2.loadAppConfig = exports2.declaredTargetNames = exports2.serializeOpsForCompare = exports2.renderPlanHuman = exports2.buildPlanDocument = exports2.toPlanOperation = exports2.withMeta = exports2.collectWorkspacePlan = exports2.normalizeWorkspaceConfig = exports2.DEFAULT_CONFIG_FILENAMES = exports2.resolveConfigPath = exports2.loadWorkspaceConfig = exports2.DEFAULT_MANIFEST_FILENAME = exports2.resolveManifestPath = exports2.loadManifest = exports2.createGeneratorContext = exports2.createWorkspace = void 0;
    var createWorkspace_1 = require_createWorkspace();
    Object.defineProperty(exports2, "createWorkspace", { enumerable: true, get: function() {
      return createWorkspace_1.createWorkspace;
    } });
    Object.defineProperty(exports2, "createGeneratorContext", { enumerable: true, get: function() {
      return createWorkspace_1.createGeneratorContext;
    } });
    var loadManifest_1 = require_loadManifest();
    Object.defineProperty(exports2, "loadManifest", { enumerable: true, get: function() {
      return loadManifest_1.loadManifest;
    } });
    Object.defineProperty(exports2, "resolveManifestPath", { enumerable: true, get: function() {
      return loadManifest_1.resolveManifestPath;
    } });
    Object.defineProperty(exports2, "DEFAULT_MANIFEST_FILENAME", { enumerable: true, get: function() {
      return loadManifest_1.DEFAULT_MANIFEST_FILENAME;
    } });
    var loadConfig_1 = require_loadConfig();
    Object.defineProperty(exports2, "loadWorkspaceConfig", { enumerable: true, get: function() {
      return loadConfig_1.loadWorkspaceConfig;
    } });
    Object.defineProperty(exports2, "resolveConfigPath", { enumerable: true, get: function() {
      return loadConfig_1.resolveConfigPath;
    } });
    Object.defineProperty(exports2, "DEFAULT_CONFIG_FILENAMES", { enumerable: true, get: function() {
      return loadConfig_1.DEFAULT_CONFIG_FILENAMES;
    } });
    var normalize_1 = require_normalize();
    Object.defineProperty(exports2, "normalizeWorkspaceConfig", { enumerable: true, get: function() {
      return normalize_1.normalizeWorkspaceConfig;
    } });
    var pipeline_1 = require_pipeline();
    Object.defineProperty(exports2, "collectWorkspacePlan", { enumerable: true, get: function() {
      return pipeline_1.collectWorkspacePlan;
    } });
    var ops_1 = require_ops();
    Object.defineProperty(exports2, "withMeta", { enumerable: true, get: function() {
      return ops_1.withMeta;
    } });
    Object.defineProperty(exports2, "toPlanOperation", { enumerable: true, get: function() {
      return ops_1.toPlanOperation;
    } });
    var plan_1 = require_plan();
    Object.defineProperty(exports2, "buildPlanDocument", { enumerable: true, get: function() {
      return plan_1.buildPlanDocument;
    } });
    Object.defineProperty(exports2, "renderPlanHuman", { enumerable: true, get: function() {
      return plan_1.renderPlanHuman;
    } });
    Object.defineProperty(exports2, "serializeOpsForCompare", { enumerable: true, get: function() {
      return plan_1.serializeOpsForCompare;
    } });
    Object.defineProperty(exports2, "declaredTargetNames", { enumerable: true, get: function() {
      return plan_1.declaredTargetNames;
    } });
    var appConfig_1 = require_appConfig();
    Object.defineProperty(exports2, "loadAppConfig", { enumerable: true, get: function() {
      return appConfig_1.loadAppConfig;
    } });
    var doctor_1 = require_doctor();
    Object.defineProperty(exports2, "runDoctor", { enumerable: true, get: function() {
      return doctor_1.runDoctor;
    } });
    Object.defineProperty(exports2, "builtinDoctorRules", { enumerable: true, get: function() {
      return doctor_1.builtinDoctorRules;
    } });
    var secrets_1 = require_secrets();
    Object.defineProperty(exports2, "isEnvRef", { enumerable: true, get: function() {
      return secrets_1.isEnvRef;
    } });
    Object.defineProperty(exports2, "parseSecretInput", { enumerable: true, get: function() {
      return secrets_1.parseSecretInput;
    } });
    Object.defineProperty(exports2, "resolveSecret", { enumerable: true, get: function() {
      return secrets_1.resolveSecret;
    } });
    Object.defineProperty(exports2, "isLiteralSecret", { enumerable: true, get: function() {
      return secrets_1.isLiteralSecret;
    } });
    Object.defineProperty(exports2, "redactValue", { enumerable: true, get: function() {
      return secrets_1.redactValue;
    } });
    Object.defineProperty(exports2, "redactDeep", { enumerable: true, get: function() {
      return secrets_1.redactDeep;
    } });
    var diagnostics_1 = require_diagnostics();
    Object.defineProperty(exports2, "EXIT_OK", { enumerable: true, get: function() {
      return diagnostics_1.EXIT_OK;
    } });
    Object.defineProperty(exports2, "EXIT_ERROR", { enumerable: true, get: function() {
      return diagnostics_1.EXIT_ERROR;
    } });
    Object.defineProperty(exports2, "EXIT_TOOL_FAILURE", { enumerable: true, get: function() {
      return diagnostics_1.EXIT_TOOL_FAILURE;
    } });
    Object.defineProperty(exports2, "exitCodeFor", { enumerable: true, get: function() {
      return diagnostics_1.exitCodeFor;
    } });
    var fileExecutor_1 = require_fileExecutor();
    Object.defineProperty(exports2, "fileExecutor", { enumerable: true, get: function() {
      return fileExecutor_1.fileExecutor;
    } });
    var report_1 = require_report();
    Object.defineProperty(exports2, "reportChange", { enumerable: true, get: function() {
      return report_1.reportChange;
    } });
    Object.defineProperty(exports2, "reportSkip", { enumerable: true, get: function() {
      return report_1.reportSkip;
    } });
    Object.defineProperty(exports2, "reportInfo", { enumerable: true, get: function() {
      return report_1.reportInfo;
    } });
    Object.defineProperty(exports2, "reportWarning", { enumerable: true, get: function() {
      return report_1.reportWarning;
    } });
    var validation_1 = require_validation();
    Object.defineProperty(exports2, "ERR", { enumerable: true, get: function() {
      return validation_1.ERR;
    } });
    Object.defineProperty(exports2, "assertBuildConfiguration", { enumerable: true, get: function() {
      return validation_1.assertBuildConfiguration;
    } });
    Object.defineProperty(exports2, "assertNameMatcher", { enumerable: true, get: function() {
      return validation_1.assertNameMatcher;
    } });
    Object.defineProperty(exports2, "nameMatcherToRuby", { enumerable: true, get: function() {
      return validation_1.nameMatcherToRuby;
    } });
    Object.defineProperty(exports2, "rubyLiteral", { enumerable: true, get: function() {
      return validation_1.rubyLiteral;
    } });
    var guards_1 = require_guards();
    Object.defineProperty(exports2, "isRecord", { enumerable: true, get: function() {
      return guards_1.isRecord;
    } });
    Object.defineProperty(exports2, "asRecordArray", { enumerable: true, get: function() {
      return guards_1.asRecordArray;
    } });
    Object.defineProperty(exports2, "asStringArray", { enumerable: true, get: function() {
      return guards_1.asStringArray;
    } });
    Object.defineProperty(exports2, "compareDottedVersions", { enumerable: true, get: function() {
      return guards_1.compareDottedVersions;
    } });
    var types_1 = require_types();
    Object.defineProperty(exports2, "FILE_OP_KINDS", { enumerable: true, get: function() {
      return types_1.FILE_OP_KINDS;
    } });
    Object.defineProperty(exports2, "isFileOp", { enumerable: true, get: function() {
      return types_1.isFileOp;
    } });
  }
});

// packages/@expo-workspaces/android/build/dependencies.js
var require_dependencies = __commonJS({
  "packages/@expo-workspaces/android/build/dependencies.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.androidLibrary = androidLibrary;
    exports2.renderAndroidDependency = renderAndroidDependency;
    exports2.renderAndroidDependencies = renderAndroidDependencies;
    var core_12 = require_build();
    var CONFIGURATIONS = /* @__PURE__ */ new Set([
      "implementation",
      "api",
      "compileOnly",
      "runtimeOnly",
      "debugImplementation",
      "releaseImplementation"
    ]);
    function androidLibrary(module3, configuration = "implementation") {
      return { module: module3, configuration };
    }
    function renderAndroidDependency(dep, label) {
      if (typeof dep === "string") {
        const line = dep.trim();
        if (!line) {
          throw new Error(`${core_12.ERR} ${label} cannot be empty.`);
        }
        return line;
      }
      if (!dep || typeof dep !== "object" || !dep.module?.trim()) {
        throw new Error(`${core_12.ERR} ${label} requires a non-empty "module".`);
      }
      const configuration = dep.configuration ?? "implementation";
      if (!CONFIGURATIONS.has(configuration)) {
        throw new Error(`${core_12.ERR} ${label}.configuration "${configuration}" is not supported.`);
      }
      return `${configuration} '${dep.module.trim()}'`;
    }
    function renderAndroidDependencies(deps) {
      if (!deps?.length) {
        return { lines: [], desired: [] };
      }
      const lines = [];
      const desired = [];
      deps.forEach((dep, index) => {
        const line = renderAndroidDependency(dep, `android.dependencies[${index}]`);
        lines.push(`    ${line}`);
        desired.push(typeof dep === "string" ? parseGradleCoordinate(line) : {
          configuration: dep.configuration ?? "implementation",
          module: dep.module.trim()
        });
      });
      return { lines, desired };
    }
    function parseGradleCoordinate(line) {
      const match = line.match(/^(implementation|api|compileOnly|runtimeOnly|debugImplementation|releaseImplementation)\s+['"]([^'"]+)['"]$/);
      if (match) {
        return { configuration: match[1], module: match[2] };
      }
      return { configuration: "implementation", module: line };
    }
  }
});

// packages/@expo-workspaces/android/build/features.js
var require_features = __commonJS({
  "packages/@expo-workspaces/android/build/features.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.androidFeature = androidFeature;
    exports2.normalizeAndroidFeatures = normalizeAndroidFeatures;
    var core_12 = require_build();
    function androidFeature(name, required = true) {
      return { name, required };
    }
    function normalizeAndroidFeatures(features) {
      if (!features?.length)
        return [];
      return features.map((feature, index) => {
        const label = `android.features[${index}]`;
        if (typeof feature === "string") {
          if (!feature.trim()) {
            throw new Error(`${core_12.ERR} ${label} cannot be empty.`);
          }
          return { name: feature.trim(), required: true };
        }
        if (!feature?.name?.trim()) {
          throw new Error(`${core_12.ERR} ${label} requires a non-empty "name".`);
        }
        return {
          name: feature.name.trim(),
          ...feature.required !== void 0 ? { required: feature.required } : {},
          ...feature.glEsVersion ? { glEsVersion: feature.glEsVersion } : {}
        };
      });
    }
  }
});

// packages/@expo-workspaces/android/build/generators/android.js
var require_android = __commonJS({
  "packages/@expo-workspaces/android/build/generators/android.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.androidGenerator = void 0;
    var core_12 = require_build();
    var dependencies_1 = require_dependencies();
    var features_1 = require_features();
    var SIGNING_KEYS = {
      storeFile: "EXPO_WORKSPACE_RELEASE_STORE_FILE",
      storePassword: "EXPO_WORKSPACE_RELEASE_STORE_PASSWORD",
      keyAlias: "EXPO_WORKSPACE_RELEASE_KEY_ALIAS",
      keyPassword: "EXPO_WORKSPACE_RELEASE_KEY_PASSWORD"
    };
    function tag(op, meta) {
      return (0, core_12.withMeta)(op, { platform: "android", status: meta.status ?? "add", ...meta });
    }
    function gradleProperty(key, value) {
      return {
        kind: "androidGradleProperty",
        key,
        value: String(value),
        label: `android:gradleProperty:${key}`
      };
    }
    exports2.androidGenerator = {
      name: "android",
      generate({ manifest }) {
        const slice = manifest.android;
        if (!slice || typeof slice !== "object") {
          return { ops: [] };
        }
        const ops = [];
        const warnings = [];
        const sdkFields = [
          ["minSdkVersion", "android.minSdkVersion"],
          ["compileSdkVersion", "android.compileSdkVersion"],
          ["targetSdkVersion", "android.targetSdkVersion"],
          ["buildToolsVersion", "android.buildToolsVersion"],
          ["ndkVersion", "android.ndkVersion"],
          ["kotlinVersion", "android.kotlinVersion"]
        ];
        for (const [key, gradleKey] of sdkFields) {
          const value = slice[key];
          if (value === void 0)
            continue;
          ops.push(tag(gradleProperty(gradleKey, value), {
            id: `android.sdk.${key}`,
            semanticKind: "android.sdk.set",
            source: `android.${key}`,
            status: "update",
            files: ["android/gradle.properties"],
            desired: value
          }));
        }
        if (slice.gradleProperties) {
          for (const [key, value] of Object.entries(slice.gradleProperties)) {
            ops.push(tag(gradleProperty(key, value), {
              id: `android.gradleProperty.${key}`,
              semanticKind: "android.gradle.property.set",
              source: `android.gradleProperties.${key}`,
              status: "update",
              files: ["android/gradle.properties"],
              desired: value
            }));
          }
        }
        for (const permission of slice.permissions ?? []) {
          if (typeof permission !== "string" || !permission.trim()) {
            throw new Error(`${core_12.ERR} android.permissions entries must be non-empty strings.`);
          }
          const name = permission.trim();
          ops.push(tag({ kind: "androidManifestPermission", permission: name, label: `android:permission:${name}` }, {
            id: `android.permission.${name}`,
            semanticKind: "android.permission.add",
            source: "android.permissions",
            files: ["android/app/src/main/AndroidManifest.xml"],
            desired: name
          }));
        }
        if (slice.applicationAttributes) {
          for (const [name, value] of Object.entries(slice.applicationAttributes)) {
            ops.push(tag({
              kind: "androidManifestAppAttribute",
              name,
              value: String(value),
              label: `android:appAttribute:${name}`
            }, {
              id: `android.appAttribute.${name}`,
              semanticKind: "android.manifest.attribute.set",
              source: `android.applicationAttributes.${name}`,
              status: "update",
              files: ["android/app/src/main/AndroidManifest.xml"],
              desired: value
            }));
          }
        }
        for (const feature of (0, features_1.normalizeAndroidFeatures)(slice.features)) {
          ops.push(tag({
            kind: "androidManifestUsesFeature",
            name: feature.name,
            required: feature.required,
            glEsVersion: feature.glEsVersion,
            label: `android:feature:${feature.name}`
          }, {
            id: `android.feature.${feature.name}`,
            semanticKind: "android.manifest.feature.add",
            source: "android.features",
            files: ["android/app/src/main/AndroidManifest.xml"],
            desired: feature
          }));
        }
        const { lines, desired } = (0, dependencies_1.renderAndroidDependencies)(slice.dependencies);
        if (lines.length) {
          ops.push(tag({
            kind: "androidGradleBlock",
            file: "app",
            tag: "expo-workspace-android-dependencies",
            anchor: "dependencies\\s*\\{",
            offset: 1,
            comment: "//",
            contents: lines.join("\n"),
            label: "android:dependencies"
          }, {
            id: "android.dependencies",
            semanticKind: "android.dependency.add",
            source: "android.dependencies",
            files: ["android/app/build.gradle"],
            desired
          }));
        }
        if (slice.signing) {
          const s = slice.signing;
          if (!s.storeFile?.trim() || !s.keyAlias?.trim()) {
            throw new Error(`${core_12.ERR} android.signing requires "storeFile" and "keyAlias".`);
          }
          const storePassword = tryResolveSecret(s.storePassword, "android.signing.storePassword", warnings);
          const keyPassword = tryResolveSecret(s.keyPassword, "android.signing.keyPassword", warnings);
          ops.push(tag(gradleProperty(SIGNING_KEYS.storeFile, s.storeFile), {
            id: "android.signing.storeFile",
            semanticKind: "android.signing.set",
            source: "android.signing",
            status: "update",
            files: ["android/gradle.properties"],
            desired: s.storeFile
          }));
          ops.push(tag(gradleProperty(SIGNING_KEYS.storePassword, storePassword), {
            id: "android.signing.storePassword",
            semanticKind: "android.signing.set",
            source: "android.signing.storePassword",
            status: "update",
            files: ["android/gradle.properties"],
            desired: s.storePassword,
            risk: "high"
          }));
          ops.push(tag(gradleProperty(SIGNING_KEYS.keyAlias, s.keyAlias), {
            id: "android.signing.keyAlias",
            semanticKind: "android.signing.set",
            source: "android.signing",
            status: "update",
            files: ["android/gradle.properties"],
            desired: s.keyAlias
          }));
          ops.push(tag(gradleProperty(SIGNING_KEYS.keyPassword, keyPassword), {
            id: "android.signing.keyPassword",
            semanticKind: "android.signing.set",
            source: "android.signing.keyPassword",
            status: "update",
            files: ["android/gradle.properties"],
            desired: s.keyPassword,
            risk: "high"
          }));
          const releaseBlock = [
            "        release {",
            `            storeFile file(${SIGNING_KEYS.storeFile})`,
            `            storePassword ${SIGNING_KEYS.storePassword}`,
            `            keyAlias ${SIGNING_KEYS.keyAlias}`,
            `            keyPassword ${SIGNING_KEYS.keyPassword}`,
            "        }"
          ].join("\n");
          ops.push(tag({
            kind: "androidGradleBlock",
            file: "app",
            tag: "expo-workspace-android-signing",
            anchor: "signingConfigs\\s*\\{",
            offset: 1,
            comment: "//",
            contents: releaseBlock,
            label: "android:signingConfig"
          }, {
            id: "android.signing.config",
            semanticKind: "android.signing.set",
            source: "android.signing",
            status: "update",
            files: ["android/app/build.gradle"],
            risk: "high"
          }));
          ops.push(tag({
            kind: "androidGradleReplace",
            file: "app",
            find: "signingConfig signingConfigs\\.debug",
            replacement: "signingConfig signingConfigs.release",
            all: false,
            label: "android:signingConfig:release"
          }, {
            id: "android.signing.release",
            semanticKind: "android.signing.set",
            source: "android.signing",
            status: "update",
            files: ["android/app/build.gradle"]
          }));
        }
        return { ops, warnings };
      }
    };
    function tryResolveSecret(value, label, warnings) {
      try {
        return (0, core_12.resolveSecret)(value, label);
      } catch (error) {
        warnings.push(error.message.replace(/^\[expo-workspaces\]\s*/, ""));
        return "";
      }
    }
  }
});

// packages/@expo-workspaces/android/build/types.js
var require_types2 = __commonJS({
  "packages/@expo-workspaces/android/build/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isAndroidOp = isAndroidOp;
    var ANDROID_KINDS = /* @__PURE__ */ new Set([
      "androidGradleProperty",
      "androidGradleBlock",
      "androidGradleReplace",
      "androidManifestPermission",
      "androidManifestAppAttribute",
      "androidManifestUsesFeature"
    ]);
    function isAndroidOp(op) {
      return ANDROID_KINDS.has(op.kind);
    }
  }
});

// packages/@expo-workspaces/android/build/androidExecutor.js
var require_androidExecutor = __commonJS({
  "packages/@expo-workspaces/android/build/androidExecutor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.androidExecutor = void 0;
    var config_plugins_1 = require("@expo/config-plugins");
    var generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
    var types_1 = require_types2();
    function applyGradleProperties(modResults, ops) {
      for (const op of ops) {
        const existing = modResults.find((item) => item.type === "property" && item.key === op.key);
        if (existing) {
          existing.value = op.value;
        } else {
          modResults.push({ type: "property", key: op.key, value: op.value });
        }
      }
    }
    function applyGradleText(contents, blocks, replaces) {
      let next = contents;
      for (const op of blocks) {
        const result = (0, generateCode_1.mergeContents)({
          tag: op.tag,
          src: next,
          newSrc: op.contents,
          anchor: new RegExp(op.anchor),
          offset: op.offset,
          comment: op.comment
        });
        next = result.contents;
      }
      for (const op of replaces) {
        next = next.replace(new RegExp(op.find, op.all ? "g" : ""), op.replacement);
      }
      return next;
    }
    function gradleMod(file, blocks, replaces) {
      return (config) => {
        const wrap = file === "app" ? config_plugins_1.withAppBuildGradle : config_plugins_1.withProjectBuildGradle;
        return wrap(config, (cfg) => {
          cfg.modResults.contents = applyGradleText(cfg.modResults.contents, blocks, replaces);
          return cfg;
        });
      };
    }
    function applyManifest(manifest, permissions, attributes, features) {
      for (const op of permissions) {
        config_plugins_1.AndroidConfig.Permissions.ensurePermission(manifest, op.permission);
      }
      if (attributes.length > 0) {
        const application = config_plugins_1.AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
        application.$ = application.$ ?? {};
        for (const op of attributes) {
          application.$[op.name] = op.value;
        }
      }
      for (const op of features) {
        ensureUsesFeature(manifest, op);
      }
    }
    function ensureUsesFeature(manifest, op) {
      const root = manifest.manifest;
      const existing = root["uses-feature"];
      const list = Array.isArray(existing) ? existing : existing ? [existing] : [];
      if (list.some((entry) => entry.$?.["android:name"] === op.name)) {
        return;
      }
      const attrs = { "android:name": op.name };
      if (op.required === false) {
        attrs["android:required"] = "false";
      }
      if (op.glEsVersion) {
        attrs["android:glEsVersion"] = op.glEsVersion;
      }
      list.push({ $: attrs });
      root["uses-feature"] = list;
    }
    var androidExecutor = (config, ops) => {
      const androidOps = ops.filter(types_1.isAndroidOp);
      if (androidOps.length === 0) {
        return config;
      }
      const properties = androidOps.filter((o) => o.kind === "androidGradleProperty");
      const blocks = androidOps.filter((o) => o.kind === "androidGradleBlock");
      const replaces = androidOps.filter((o) => o.kind === "androidGradleReplace");
      const permissions = androidOps.filter((o) => o.kind === "androidManifestPermission");
      const attributes = androidOps.filter((o) => o.kind === "androidManifestAppAttribute");
      const features = androidOps.filter((o) => o.kind === "androidManifestUsesFeature");
      if (properties.length > 0) {
        config = (0, config_plugins_1.withGradleProperties)(config, (cfg) => {
          applyGradleProperties(cfg.modResults, properties);
          return cfg;
        });
      }
      for (const file of ["app", "project"]) {
        const fileBlocks = blocks.filter((o) => o.file === file);
        const fileReplaces = replaces.filter((o) => o.file === file);
        if (fileBlocks.length > 0 || fileReplaces.length > 0) {
          config = gradleMod(file, fileBlocks, fileReplaces)(config);
        }
      }
      if (permissions.length > 0 || attributes.length > 0 || features.length > 0) {
        config = (0, config_plugins_1.withAndroidManifest)(config, (cfg) => {
          applyManifest(cfg.modResults, permissions, attributes, features);
          return cfg;
        });
      }
      return config;
    };
    exports2.androidExecutor = androidExecutor;
  }
});

// packages/@expo-workspaces/android/build/index.js
var require_build2 = __commonJS({
  "packages/@expo-workspaces/android/build/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.normalizeAndroidFeatures = exports2.androidFeature = exports2.renderAndroidDependencies = exports2.renderAndroidDependency = exports2.androidLibrary = exports2.isAndroidOp = exports2.androidExecutor = exports2.androidGenerator = void 0;
    var android_1 = require_android();
    Object.defineProperty(exports2, "androidGenerator", { enumerable: true, get: function() {
      return android_1.androidGenerator;
    } });
    var androidExecutor_1 = require_androidExecutor();
    Object.defineProperty(exports2, "androidExecutor", { enumerable: true, get: function() {
      return androidExecutor_1.androidExecutor;
    } });
    var types_1 = require_types2();
    Object.defineProperty(exports2, "isAndroidOp", { enumerable: true, get: function() {
      return types_1.isAndroidOp;
    } });
    var dependencies_1 = require_dependencies();
    Object.defineProperty(exports2, "androidLibrary", { enumerable: true, get: function() {
      return dependencies_1.androidLibrary;
    } });
    Object.defineProperty(exports2, "renderAndroidDependency", { enumerable: true, get: function() {
      return dependencies_1.renderAndroidDependency;
    } });
    Object.defineProperty(exports2, "renderAndroidDependencies", { enumerable: true, get: function() {
      return dependencies_1.renderAndroidDependencies;
    } });
    var features_1 = require_features();
    Object.defineProperty(exports2, "androidFeature", { enumerable: true, get: function() {
      return features_1.androidFeature;
    } });
    Object.defineProperty(exports2, "normalizeAndroidFeatures", { enumerable: true, get: function() {
      return features_1.normalizeAndroidFeatures;
    } });
  }
});

// packages/@expo-workspaces/ios-pods/build/validate.js
var require_validate = __commonJS({
  "packages/@expo-workspaces/ios-pods/build/validate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.normalizeLocalPods = normalizeLocalPods;
    exports2.normalizeRemotePods = normalizeRemotePods;
    exports2.normalizePodBuildSettingsRules = normalizePodBuildSettingsRules;
    exports2.normalizeRemovePodBuildPhases = normalizeRemovePodBuildPhases;
    var core_12 = require_build();
    function normalizeLocalPods(pods) {
      if (!Array.isArray(pods) || pods.length === 0) {
        return [];
      }
      return pods.map((entry, index) => {
        if (!entry?.pod?.trim() || !entry?.path?.trim()) {
          throw new Error(`${core_12.ERR} localPods[${index}] requires "pod" and "path" (relative to ios/).`);
        }
        const podPath = entry.path.trim();
        if (podPath.startsWith("/") || /^[A-Za-z]:/.test(podPath)) {
          throw new Error(`${core_12.ERR} localPods[${index}].path must be relative to ios/, not absolute: "${podPath}"`);
        }
        return { pod: entry.pod.trim(), path: podPath };
      });
    }
    function normalizeRemotePods(pods) {
      if (!Array.isArray(pods) || pods.length === 0) {
        return [];
      }
      return pods.map((entry, index) => {
        if (!entry?.pod?.trim()) {
          throw new Error(`${core_12.ERR} remotePods[${index}] requires "pod".`);
        }
        if (entry.configurations && !Array.isArray(entry.configurations)) {
          throw new Error(`${core_12.ERR} remotePods[${index}].configurations must be an array.`);
        }
        return { ...entry, pod: entry.pod.trim() };
      });
    }
    function normalizePodBuildSettingsRules(rules) {
      if (!Array.isArray(rules) || rules.length === 0) {
        return [];
      }
      return rules.map((rule, index) => {
        (0, core_12.assertNameMatcher)(rule?.target, `podBuildSettings[${index}].target`);
        const settings = rule?.settings ?? {};
        const entries = Object.entries(settings);
        if (entries.length === 0) {
          throw new Error(`${core_12.ERR} podBuildSettings[${index}] requires non-empty "settings".`);
        }
        for (const [key, value] of entries) {
          if (!key.trim()) {
            throw new Error(`${core_12.ERR} podBuildSettings[${index}] has an empty build setting key.`);
          }
          if (typeof value !== "string") {
            throw new Error(`${core_12.ERR} podBuildSettings[${index}].settings["${key}"] must be a string value.`);
          }
        }
        const configurations = rule.configurations?.map((configuration, configIndex) => {
          (0, core_12.assertBuildConfiguration)(configuration, `podBuildSettings[${index}].configurations[${configIndex}]`);
          return configuration;
        });
        return { ...rule, target: rule.target, settings, configurations };
      });
    }
    function normalizeRemovePodBuildPhases(rules) {
      if (!Array.isArray(rules) || rules.length === 0) {
        return [];
      }
      return rules.map((rule, index) => {
        (0, core_12.assertNameMatcher)(rule?.target, `removePodBuildPhases[${index}].target`);
        if (!rule.phase?.trim()) {
          throw new Error(`${core_12.ERR} removePodBuildPhases[${index}] requires a non-empty "phase".`);
        }
        return { target: rule.target, phase: rule.phase.trim() };
      });
    }
  }
});

// packages/@expo-workspaces/ios-pods/build/generators/pods.js
var require_pods = __commonJS({
  "packages/@expo-workspaces/ios-pods/build/generators/pods.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.podsGenerator = void 0;
    var core_12 = require_build();
    var validate_1 = require_validate();
    var LOCAL_PODS_TAG = "declarative-workspace-local-pods";
    var REMOTE_PODS_TAG = "declarative-workspace-remote-pods";
    var POD_BUILD_SETTINGS_TAG = "declarative-workspace-pod-build-settings";
    var POD_REMOVE_BUILD_PHASES_TAG = "declarative-workspace-pod-remove-build-phases";
    var USE_EXPO_MODULES = /use_expo_modules!/;
    var POST_INSTALL = /post_install do \|installer\|/;
    function localPodLines(pods) {
      return pods.map(({ pod, path }) => `  pod '${pod}', :path => '${path}'`).join("\n");
    }
    function remotePodLine(p) {
      const parts = [`pod ${(0, core_12.rubyLiteral)(p.pod)}`];
      if (p.version) {
        parts.push((0, core_12.rubyLiteral)(p.version));
      }
      if (p.git) {
        parts.push(`:git => ${(0, core_12.rubyLiteral)(p.git)}`);
      }
      if (p.branch) {
        parts.push(`:branch => ${(0, core_12.rubyLiteral)(p.branch)}`);
      }
      if (p.tag) {
        parts.push(`:tag => ${(0, core_12.rubyLiteral)(p.tag)}`);
      }
      if (p.commit) {
        parts.push(`:commit => ${(0, core_12.rubyLiteral)(p.commit)}`);
      }
      if (p.configurations?.length) {
        parts.push(`:configurations => [${p.configurations.map((c) => (0, core_12.rubyLiteral)(c)).join(", ")}]`);
      }
      if (p.modularHeaders != null) {
        parts.push(`:modular_headers => ${p.modularHeaders}`);
      }
      return `  ${parts.join(", ")}`;
    }
    function podBuildSettingsLines(rules) {
      const targetCondition = rules.map((rule) => `(${(0, core_12.nameMatcherToRuby)(rule.target)})`).join(" || ");
      const lines = [
        "  installer.pods_project.targets.each do |target|",
        `    next unless ${targetCondition}`,
        "    target.build_configurations.each do |config|"
      ];
      for (const rule of rules) {
        lines.push(`      if ${(0, core_12.nameMatcherToRuby)(rule.target)}`);
        if (rule.configurations?.length) {
          const names = rule.configurations.map((value) => (0, core_12.rubyLiteral)(value)).join(", ");
          lines.push(`        next unless [${names}].include?(config.name)`);
        }
        for (const [key, value] of Object.entries(rule.settings)) {
          lines.push(`        config.build_settings[${(0, core_12.rubyLiteral)(key)}] = ${(0, core_12.rubyLiteral)(value)}`);
        }
        lines.push("      end");
      }
      lines.push("    end");
      lines.push("  end");
      return lines.join("\n");
    }
    function podRemoveBuildPhasesLines(rules) {
      return rules.map((rule) => [
        "  installer.pods_project.targets.each do |target|",
        `    next unless ${(0, core_12.nameMatcherToRuby)(rule.target)}`,
        "    target.build_phases.delete_if do |phase|",
        `      phase.respond_to?(:name) && phase.name == ${(0, core_12.rubyLiteral)(rule.phase)}`,
        "    end",
        "  end"
      ].join("\n")).join("\n");
    }
    function mergeBlock(tag, newSrc, anchor, label) {
      return { kind: "mergeBlock", path: "Podfile", tag, newSrc, anchor, offset: 1, comment: "#", label };
    }
    exports2.podsGenerator = {
      name: "pods",
      generate({ manifest }) {
        const localPods = (0, validate_1.normalizeLocalPods)(manifest.localPods);
        const remotePods = (0, validate_1.normalizeRemotePods)(manifest.remotePods);
        const podBuildSettings = (0, validate_1.normalizePodBuildSettingsRules)(manifest.podBuildSettings);
        const removePodBuildPhases = (0, validate_1.normalizeRemovePodBuildPhases)(manifest.removePodBuildPhases);
        const ops = [];
        if (localPods.length > 0) {
          ops.push((0, core_12.withMeta)(mergeBlock(LOCAL_PODS_TAG, localPodLines(localPods), USE_EXPO_MODULES, "localPods"), {
            id: "pod:local",
            platform: "ios",
            semanticKind: "ios.pod.add",
            source: "ios.pods",
            status: "add",
            files: ["ios/Podfile"],
            desired: localPods
          }));
        }
        if (remotePods.length > 0) {
          ops.push((0, core_12.withMeta)(mergeBlock(REMOTE_PODS_TAG, remotePods.map(remotePodLine).join("\n"), USE_EXPO_MODULES, "remotePods"), {
            id: "pod:remote",
            platform: "ios",
            semanticKind: "ios.pod.add",
            source: "ios.pods",
            status: "add",
            files: ["ios/Podfile"],
            desired: remotePods
          }));
        }
        if (podBuildSettings.length > 0) {
          ops.push((0, core_12.withMeta)(mergeBlock(POD_BUILD_SETTINGS_TAG, podBuildSettingsLines(podBuildSettings), POST_INSTALL, "podBuildSettings"), {
            id: "pod:buildSettings",
            platform: "ios",
            semanticKind: "ios.pod.buildSetting.set",
            source: "ios.podBuildSettings",
            status: "update",
            files: ["ios/Podfile"],
            desired: podBuildSettings
          }));
        }
        if (removePodBuildPhases.length > 0) {
          ops.push((0, core_12.withMeta)(mergeBlock(POD_REMOVE_BUILD_PHASES_TAG, podRemoveBuildPhasesLines(removePodBuildPhases), POST_INSTALL, "removePodBuildPhases"), {
            id: "pod:removeBuildPhases",
            platform: "ios",
            semanticKind: "ios.pod.buildPhase.remove",
            source: "ios.removePodBuildPhases",
            status: "remove",
            files: ["ios/Podfile"],
            desired: removePodBuildPhases
          }));
        }
        return { ops };
      }
    };
  }
});

// packages/@expo-workspaces/ios-pods/build/index.js
var require_build3 = __commonJS({
  "packages/@expo-workspaces/ios-pods/build/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.normalizeRemovePodBuildPhases = exports2.normalizePodBuildSettingsRules = exports2.normalizeRemotePods = exports2.normalizeLocalPods = exports2.podsGenerator = void 0;
    var pods_1 = require_pods();
    Object.defineProperty(exports2, "podsGenerator", { enumerable: true, get: function() {
      return pods_1.podsGenerator;
    } });
    var validate_1 = require_validate();
    Object.defineProperty(exports2, "normalizeLocalPods", { enumerable: true, get: function() {
      return validate_1.normalizeLocalPods;
    } });
    Object.defineProperty(exports2, "normalizeRemotePods", { enumerable: true, get: function() {
      return validate_1.normalizeRemotePods;
    } });
    Object.defineProperty(exports2, "normalizePodBuildSettingsRules", { enumerable: true, get: function() {
      return validate_1.normalizePodBuildSettingsRules;
    } });
    Object.defineProperty(exports2, "normalizeRemovePodBuildPhases", { enumerable: true, get: function() {
      return validate_1.normalizeRemovePodBuildPhases;
    } });
  }
});

// packages/@expo-workspaces/ios-xcode/build/openProject.js
var require_openProject = __commonJS({
  "packages/@expo-workspaces/ios-xcode/build/openProject.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.openXcodeProject = openXcodeProject;
    exports2.serializeXcodeProject = serializeXcodeProject;
    var fs_1 = __importDefault2(require("fs"));
    var path_12 = __importDefault2(require("path"));
    var config_plugins_1 = require("@expo/config-plugins");
    var xcode_1 = require("@bacons/xcode");
    var { build: buildPbxproj } = require("@bacons/xcode/json");
    function openXcodeProject(appProjectRoot) {
      const pbxprojPath = config_plugins_1.IOSConfig.Paths.getPBXProjectPath(appProjectRoot);
      if (!fs_1.default.existsSync(pbxprojPath)) {
        throw new Error(`[expo-workspaces] PBX project not found at ${pbxprojPath}. Run "expo prebuild" for iOS first.`);
      }
      const xcodeprojPath = config_plugins_1.IOSConfig.Paths.getXcodeProjectPath(appProjectRoot);
      const xcodeprojBasename = path_12.default.basename(xcodeprojPath);
      const schemesDirectory = path_12.default.join(xcodeprojPath, "xcshareddata", "xcschemes");
      return {
        project: xcode_1.XcodeProject.open(pbxprojPath),
        pbxprojPath,
        xcodeprojPath,
        xcodeprojBasename,
        schemesDirectory
      };
    }
    function serializeXcodeProject(project) {
      return buildPbxproj(project.toJSON());
    }
  }
});

// packages/@expo-workspaces/ios-xcode/build/pbxOp.js
var require_pbxOp = __commonJS({
  "packages/@expo-workspaces/ios-xcode/build/pbxOp.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isPbxOp = isPbxOp;
    exports2.pbxOp = pbxOp;
    function isPbxOp(op) {
      return op.kind === "pbx";
    }
    function pbxOp(label, apply, meta) {
      return { kind: "pbx", label, apply, meta };
    }
  }
});

// packages/@expo-workspaces/ios-xcode/build/pbxExecutor.js
var require_pbxExecutor = __commonJS({
  "packages/@expo-workspaces/ios-xcode/build/pbxExecutor.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.pbxExecutor = void 0;
    var fs_1 = __importDefault2(require("fs"));
    var config_plugins_1 = require("@expo/config-plugins");
    var core_12 = require_build();
    var openProject_1 = require_openProject();
    var pbxOp_1 = require_pbxOp();
    var pbxExecutor = (config, ops) => {
      const pbxOps = ops.filter(pbxOp_1.isPbxOp);
      if (pbxOps.length === 0) {
        return config;
      }
      return (0, config_plugins_1.withMod)(config, {
        platform: "ios",
        mod: "finalized",
        async action(config2) {
          const { projectRoot, platformProjectRoot } = config2.modRequest;
          const { project, pbxprojPath } = (0, openProject_1.openXcodeProject)(projectRoot);
          const original = fs_1.default.readFileSync(pbxprojPath, "utf8");
          for (const op of pbxOps) {
            op.apply({ project, projectRoot, platformProjectRoot });
          }
          const next = (0, openProject_1.serializeXcodeProject)(project);
          if (next.trim().length > 0 && next !== original) {
            fs_1.default.writeFileSync(pbxprojPath, next);
            (0, core_12.reportChange)("pbxproj", pbxprojPath);
          } else {
            (0, core_12.reportSkip)("pbxproj", pbxprojPath);
          }
          return config2;
        }
      });
    };
    exports2.pbxExecutor = pbxExecutor;
  }
});

// packages/@expo-workspaces/ios-xcode/build/inspect.js
var require_inspect = __commonJS({
  "packages/@expo-workspaces/ios-xcode/build/inspect.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.inspectXcodeProject = inspectXcodeProject;
    var fs_1 = __importDefault2(require("fs"));
    var path_12 = __importDefault2(require("path"));
    var xcode_1 = require("@bacons/xcode");
    function inspectXcodeProject(iosDir) {
      const empty = { targets: [], swiftPackages: [], schemes: [] };
      if (!fs_1.default.existsSync(iosDir))
        return empty;
      const xcodeproj = fs_1.default.readdirSync(iosDir).find((name) => name.endsWith(".xcodeproj"));
      if (!xcodeproj)
        return empty;
      const xcodeprojPath = path_12.default.join(iosDir, xcodeproj);
      const pbxprojPath = path_12.default.join(xcodeprojPath, "project.pbxproj");
      if (!fs_1.default.existsSync(pbxprojPath))
        return empty;
      const project = xcode_1.XcodeProject.open(pbxprojPath);
      const targets = [];
      for (const target of project.rootObject.props.targets ?? []) {
        if (!xcode_1.PBXNativeTarget.is(target))
          continue;
        const name = String(target.props.name ?? "").replace(/"/g, "");
        if (name && !targets.includes(name))
          targets.push(name);
      }
      const swiftPackages = [];
      const refs = project.rootObject.props.packageReferences;
      if (Array.isArray(refs)) {
        for (const ref of refs) {
          const url = packageReferenceUrl(ref);
          if (url && !swiftPackages.includes(url))
            swiftPackages.push(url);
        }
      }
      const schemesDir = path_12.default.join(xcodeprojPath, "xcshareddata", "xcschemes");
      const schemes = fs_1.default.existsSync(schemesDir) ? fs_1.default.readdirSync(schemesDir).filter((name) => name.endsWith(".xcscheme")).map((name) => name.replace(/\.xcscheme$/, "")) : [];
      return { targets, swiftPackages, schemes };
    }
    function packageReferenceUrl(ref) {
      if (!ref || typeof ref !== "object")
        return void 0;
      const props = ref.props;
      const url = props?.repositoryURL;
      return typeof url === "string" && url.length > 0 ? url : void 0;
    }
  }
});

// packages/@expo-workspaces/ios-xcode/build/validate.js
var require_validate2 = __commonJS({
  "packages/@expo-workspaces/ios-xcode/build/validate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.normalizeSchemeDefinitions = normalizeSchemeDefinitions;
    var core_12 = require_build();
    var INVALID_SCHEME_CHARS = /[\\/:*?"<>|]/;
    function normalizeSchemeDefinitions(schemes) {
      if (!Array.isArray(schemes) || schemes.length === 0) {
        return [];
      }
      const seen = /* @__PURE__ */ new Set();
      return schemes.map((scheme, index) => {
        if (!scheme?.name?.trim() || !scheme.configuration) {
          throw new Error(`${core_12.ERR} schemes[${index}] requires "name" and "configuration" ("Debug" | "Release").`);
        }
        const name = scheme.name.trim();
        if (INVALID_SCHEME_CHARS.test(name)) {
          throw new Error(`${core_12.ERR} schemes[${index}].name contains invalid path characters: "${name}"`);
        }
        if (seen.has(name)) {
          throw new Error(`${core_12.ERR} Duplicate scheme name "${name}" in schemes configuration.`);
        }
        seen.add(name);
        (0, core_12.assertBuildConfiguration)(scheme.configuration, `schemes[${index}].configuration`);
        if (scheme.archive) {
          (0, core_12.assertBuildConfiguration)(scheme.archive, `schemes[${index}].archive`);
        }
        if (scheme.analyze) {
          (0, core_12.assertBuildConfiguration)(scheme.analyze, `schemes[${index}].analyze`);
        }
        return { ...scheme, name };
      });
    }
  }
});

// packages/@expo-workspaces/ios-xcode/build/generators/schemes.js
var require_schemes = __commonJS({
  "packages/@expo-workspaces/ios-xcode/build/generators/schemes.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.schemesGenerator = void 0;
    var fs_1 = __importDefault2(require("fs"));
    var path_12 = __importDefault2(require("path"));
    var xcode_1 = require("@bacons/xcode");
    var pbxOp_1 = require_pbxOp();
    var validate_1 = require_validate2();
    var UNIT_TEST_PRODUCT_TYPE = "com.apple.product-type.bundle.unit-test";
    function cleanName(value) {
      return String(value ?? "").replace(/"/g, "");
    }
    exports2.schemesGenerator = {
      name: "schemes",
      generate({ manifest }) {
        const schemes = (0, validate_1.normalizeSchemeDefinitions)(manifest.schemes);
        if (schemes.length === 0) {
          return { ops: [] };
        }
        const replaceExpoScheme = Boolean(manifest.replaceExpoScheme);
        return {
          ops: [
            (0, pbxOp_1.pbxOp)("schemes", ({ project }) => {
              const app = project.rootObject.getMainAppTarget("ios");
              if (!app) {
                throw new Error("[expo-workspaces] Could not find the main iOS application target for schemes.");
              }
              fs_1.default.mkdirSync(project.getSharedSchemesDir(), { recursive: true });
              if (replaceExpoScheme) {
                for (const existing of project.getSchemes()) {
                  project.deleteScheme(existing.name, { shared: true });
                }
              }
              const testTarget = project.rootObject.props.targets.find((target) => xcode_1.PBXNativeTarget.is(target) && cleanName(target.props.productType) === UNIT_TEST_PRODUCT_TYPE);
              const container = `container:${path_12.default.basename(path_12.default.dirname(project.filePath))}`;
              for (const scheme of schemes) {
                const xcscheme = project.createSchemeForTarget(app, scheme.name);
                xcscheme.props.lastUpgradeVersion = "1130";
                xcscheme.props.launchAction.buildConfiguration = scheme.configuration;
                xcscheme.props.profileAction.buildConfiguration = scheme.archive ?? "Release";
                xcscheme.props.analyzeAction.buildConfiguration = scheme.analyze ?? "Debug";
                xcscheme.props.archiveAction.buildConfiguration = scheme.archive ?? "Release";
                xcscheme.props.testAction.buildConfiguration = "Debug";
                if (scheme.includeUnitTestTarget && testTarget) {
                  xcscheme.addTestTarget((0, xcode_1.createBuildableReference)(testTarget, container));
                }
                project.saveScheme(xcscheme, { shared: true });
              }
            }, {
              id: "scheme:all",
              platform: "ios",
              semanticKind: "ios.scheme.add",
              source: "ios.schemes",
              status: "add",
              files: ["ios/*.xcodeproj/xcshareddata/xcschemes"],
              desired: schemes.map((s) => s.name),
              phase: "finalized"
            })
          ]
        };
      }
    };
  }
});

// packages/@expo-workspaces/ios-xcode/build/generators/xcodeEnv.js
var require_xcodeEnv = __commonJS({
  "packages/@expo-workspaces/ios-xcode/build/generators/xcodeEnv.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.xcodeEnvGenerator = void 0;
    var core_12 = require_build();
    var XCODE_ENV_TAG = "declarative-workspace-xcode-env";
    function formatExportLine(key, value) {
      const safeKey = key.replace(/[^A-Za-z0-9_]/g, "");
      if (!safeKey) {
        throw new Error(`[expo-workspaces] Invalid xcodeEnv export key: "${key}"`);
      }
      const raw = String(value);
      if (/^[A-Za-z0-9_.-]+$/.test(raw)) {
        return `export ${safeKey}=${raw}`;
      }
      const escaped = raw.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      return `export ${safeKey}="${escaped}"`;
    }
    function buildXcodeEnvBlock(spec) {
      const lines = [];
      if (spec.exports) {
        for (const [key, value] of Object.entries(spec.exports)) {
          lines.push(formatExportLine(key, value));
        }
      }
      if (spec.lines?.length) {
        lines.push(...spec.lines);
      }
      return lines.join("\n");
    }
    exports2.xcodeEnvGenerator = {
      name: "xcodeEnv",
      generate({ manifest }) {
        const spec = manifest.xcodeEnv;
        if (!spec) {
          return { ops: [] };
        }
        const block = buildXcodeEnvBlock(spec);
        if (!block.trim()) {
          return { ops: [] };
        }
        const op = {
          kind: "mergeBlock",
          path: ".xcode.env",
          tag: XCODE_ENV_TAG,
          newSrc: block,
          anchor: /export NODE_BINARY=/,
          offset: 1,
          comment: "#",
          appendIfNoAnchor: true,
          label: "xcodeEnv"
        };
        return {
          ops: [
            (0, core_12.withMeta)(op, {
              id: "xcode.env",
              platform: "ios",
              semanticKind: "ios.xcode.env.set",
              source: "ios.xcode.env",
              status: "update",
              files: ["ios/.xcode.env"],
              desired: spec
            })
          ]
        };
      }
    };
  }
});

// packages/@expo-workspaces/ios-xcode/build/generators/fixEmbedCycle.js
var require_fixEmbedCycle = __commonJS({
  "packages/@expo-workspaces/ios-xcode/build/generators/fixEmbedCycle.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fixEmbedCycleGenerator = void 0;
    var pbxOp_1 = require_pbxOp();
    var EMBED_PHASE_NAME = "Embed Foundation Extensions";
    var APP_PRODUCT_TYPE = "com.apple.product-type.application";
    function isa(model) {
      return String(model?.props?.isa ?? "");
    }
    function cleanName(value) {
      return String(value ?? "").replace(/"/g, "");
    }
    exports2.fixEmbedCycleGenerator = {
      name: "fixEmbedCycle",
      generate({ manifest }) {
        if (manifest.fixExtensionEmbedCycle === false) {
          return { ops: [] };
        }
        return {
          ops: [
            (0, pbxOp_1.pbxOp)("fixEmbedCycle", ({ project }) => {
              for (const target of project.rootObject.props.targets) {
                const productType = cleanName(target.props.productType);
                if (productType !== APP_PRODUCT_TYPE) {
                  continue;
                }
                const buildPhases = target.props.buildPhases;
                if (!Array.isArray(buildPhases) || buildPhases.length === 0) {
                  continue;
                }
                const embedIndex = buildPhases.findIndex((phase) => isa(phase) === "PBXCopyFilesBuildPhase" && cleanName(phase.props?.name) === EMBED_PHASE_NAME);
                if (embedIndex < 0) {
                  continue;
                }
                const [embedPhase] = buildPhases.splice(embedIndex, 1);
                const resourcesIndex = buildPhases.findIndex((phase) => isa(phase) === "PBXResourcesBuildPhase");
                if (resourcesIndex < 0) {
                  buildPhases.splice(embedIndex, 0, embedPhase);
                  continue;
                }
                buildPhases.splice(resourcesIndex + 1, 0, embedPhase);
              }
            }, {
              id: "xcode.embedCycle",
              platform: "ios",
              semanticKind: "ios.xcode.embedCycle.fix",
              source: "ios.xcode",
              status: "update",
              files: ["ios/*.xcodeproj/project.pbxproj"],
              phase: "finalized",
              risk: "low"
            })
          ]
        };
      }
    };
  }
});

// packages/@expo-workspaces/ios-xcode/build/index.js
var require_build4 = __commonJS({
  "packages/@expo-workspaces/ios-xcode/build/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fixEmbedCycleGenerator = exports2.xcodeEnvGenerator = exports2.schemesGenerator = exports2.normalizeSchemeDefinitions = exports2.inspectXcodeProject = exports2.serializeXcodeProject = exports2.openXcodeProject = exports2.isPbxOp = exports2.pbxOp = exports2.pbxExecutor = void 0;
    var pbxExecutor_1 = require_pbxExecutor();
    Object.defineProperty(exports2, "pbxExecutor", { enumerable: true, get: function() {
      return pbxExecutor_1.pbxExecutor;
    } });
    var pbxOp_1 = require_pbxOp();
    Object.defineProperty(exports2, "pbxOp", { enumerable: true, get: function() {
      return pbxOp_1.pbxOp;
    } });
    Object.defineProperty(exports2, "isPbxOp", { enumerable: true, get: function() {
      return pbxOp_1.isPbxOp;
    } });
    var openProject_1 = require_openProject();
    Object.defineProperty(exports2, "openXcodeProject", { enumerable: true, get: function() {
      return openProject_1.openXcodeProject;
    } });
    Object.defineProperty(exports2, "serializeXcodeProject", { enumerable: true, get: function() {
      return openProject_1.serializeXcodeProject;
    } });
    var inspect_1 = require_inspect();
    Object.defineProperty(exports2, "inspectXcodeProject", { enumerable: true, get: function() {
      return inspect_1.inspectXcodeProject;
    } });
    var validate_1 = require_validate2();
    Object.defineProperty(exports2, "normalizeSchemeDefinitions", { enumerable: true, get: function() {
      return validate_1.normalizeSchemeDefinitions;
    } });
    var schemes_1 = require_schemes();
    Object.defineProperty(exports2, "schemesGenerator", { enumerable: true, get: function() {
      return schemes_1.schemesGenerator;
    } });
    var xcodeEnv_1 = require_xcodeEnv();
    Object.defineProperty(exports2, "xcodeEnvGenerator", { enumerable: true, get: function() {
      return xcodeEnv_1.xcodeEnvGenerator;
    } });
    var fixEmbedCycle_1 = require_fixEmbedCycle();
    Object.defineProperty(exports2, "fixEmbedCycleGenerator", { enumerable: true, get: function() {
      return fixEmbedCycle_1.fixEmbedCycleGenerator;
    } });
  }
});

// packages/@expo-workspaces/ios-spm/build/validate.js
var require_validate3 = __commonJS({
  "packages/@expo-workspaces/ios-spm/build/validate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.normalizeTargetRef = normalizeTargetRef;
    exports2.normalizeRemotePackages = normalizeRemotePackages;
    exports2.normalizeLocalPackages = normalizeLocalPackages;
    var core_12 = require_build();
    var REQUIREMENT_KINDS = /* @__PURE__ */ new Set([
      "upToNextMajorVersion",
      "upToNextMinorVersion",
      "versionRange",
      "exactVersion",
      "branch",
      "revision"
    ]);
    function assertRequirement(req, label) {
      if (!req || typeof req !== "object" || !REQUIREMENT_KINDS.has(req.kind ?? "")) {
        throw new Error(`${core_12.ERR} ${label}.requirement.kind must be one of ${[...REQUIREMENT_KINDS].join(", ")}.`);
      }
    }
    function assertProducts(products, label) {
      if (!Array.isArray(products) || products.length === 0 || products.some((p) => typeof p !== "string" || !p.trim())) {
        throw new Error(`${core_12.ERR} ${label}.products must be a non-empty array of product names.`);
      }
    }
    function normalizeTargetRef(target, label) {
      if (target === void 0) {
        return void 0;
      }
      if (typeof target === "string") {
        const trimmed = target.trim();
        if (!trimmed) {
          throw new Error(`${core_12.ERR} ${label}.target must be a non-empty string.`);
        }
        return [trimmed];
      }
      if (!Array.isArray(target) || target.length === 0) {
        throw new Error(`${core_12.ERR} ${label}.target must be a non-empty string or array of strings.`);
      }
      const normalized = [];
      for (let i = 0; i < target.length; i += 1) {
        const entry = target[i];
        if (typeof entry !== "string" || !entry.trim()) {
          throw new Error(`${core_12.ERR} ${label}.target[${i}] must be a non-empty string.`);
        }
        normalized.push(entry.trim());
      }
      return normalized;
    }
    function normalizeRemotePackages(packages) {
      if (!Array.isArray(packages) || packages.length === 0) {
        return [];
      }
      return packages.map((pkg, index) => {
        const label = `swiftPackages.remote[${index}]`;
        if (!pkg?.url?.trim()) {
          throw new Error(`${core_12.ERR} ${label} requires a "url".`);
        }
        assertRequirement(pkg.requirement, label);
        assertProducts(pkg.products, label);
        return {
          ...pkg,
          url: pkg.url.trim(),
          target: normalizeTargetRef(pkg.target, label),
          podTarget: normalizeTargetRef(pkg.podTarget, `${label}.podTarget`)
        };
      });
    }
    function normalizeLocalPackages(packages) {
      if (!Array.isArray(packages) || packages.length === 0) {
        return [];
      }
      return packages.map((pkg, index) => {
        const label = `swiftPackages.local[${index}]`;
        if (!pkg?.path?.trim()) {
          throw new Error(`${core_12.ERR} ${label} requires a "path".`);
        }
        assertProducts(pkg.products, label);
        return {
          ...pkg,
          path: pkg.path.trim(),
          target: normalizeTargetRef(pkg.target, label),
          podTarget: normalizeTargetRef(pkg.podTarget, `${label}.podTarget`)
        };
      });
    }
  }
});

// packages/@expo-workspaces/ios-spm/build/generators/spm.js
var require_spm = __commonJS({
  "packages/@expo-workspaces/ios-spm/build/generators/spm.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.spmGenerator = void 0;
    var xcode_1 = require("@bacons/xcode");
    var core_12 = require_build();
    var ios_xcode_1 = require_build4();
    var validate_1 = require_validate3();
    function findTarget(project, name) {
      if (name) {
        const match = project.rootObject.props.targets.find((t) => xcode_1.PBXNativeTarget.is(t) && t.props.name === name);
        if (!match) {
          throw new Error(`[expo-workspaces] swiftPackages: target "${name}" not found.`);
        }
        return match;
      }
      const app = project.rootObject.getMainAppTarget("ios");
      if (!app) {
        throw new Error("[expo-workspaces] swiftPackages: no main app target found.");
      }
      return app;
    }
    function addPackageReference(project, ref) {
      const root = project.rootObject.props;
      root.packageReferences = root.packageReferences ?? [];
      root.packageReferences.push(ref);
    }
    function linkProductsToTarget(project, pkgRef, products, targetName) {
      const target = findTarget(project, targetName);
      const targetProps = target.props;
      targetProps.packageProductDependencies = targetProps.packageProductDependencies ?? [];
      for (const productName of products) {
        const dependency = xcode_1.XCSwiftPackageProductDependency.create(project, {
          package: pkgRef,
          productName
        });
        targetProps.packageProductDependencies.push(dependency);
        const buildFile = xcode_1.PBXBuildFile.create(project, { productRef: dependency });
        target.getFrameworksBuildPhase().props.files.push(buildFile);
      }
    }
    function linkProducts(project, pkgRef, products, targets) {
      if (!targets || targets.length === 0) {
        linkProductsToTarget(project, pkgRef, products, void 0);
        return;
      }
      for (const targetName of targets) {
        linkProductsToTarget(project, pkgRef, products, targetName);
      }
    }
    var POD_TARGET_ANCHOR = /post_install do \|installer\|/;
    var rubyString = (value) => `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
    var rubyArray = (values) => `[${values.map(rubyString).join(", ")}]`;
    function slugify(value) {
      return value.toLowerCase().replace(/^https?:\/\//, "").replace(/\.git$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    }
    function rubyRequirement(req) {
      const entries = Object.entries(req).map(([k, v]) => `${rubyString(k)} => ${rubyString(String(v))}`);
      return `{ ${entries.join(", ")} }`;
    }
    function renderPodTargetSpmRuby(spec) {
      const klass = spec.kind === "local" ? "Xcodeproj::Project::Object::XCLocalSwiftPackageReference" : "Xcodeproj::Project::Object::XCRemoteSwiftPackageReference";
      const prop = spec.kind === "local" ? "relative_path" : "repositoryURL";
      const idLit = rubyString(spec.identifier);
      const requirementLine = spec.kind === "remote" && spec.requirement ? `      ref.requirement = ${rubyRequirement(spec.requirement)}
` : "";
      return [
        `  # SPM \u2192 pod target(s): ${spec.identifier}`,
        `  begin`,
        `    spm_pkg_ref = installer.pods_project.root_object.package_references.find do |ref|`,
        `      ref.respond_to?(:${prop}) && ref.${prop} == ${idLit}`,
        `    end`,
        `    spm_pkg_ref ||= begin`,
        `      ref = installer.pods_project.new(${klass})`,
        `      ref.${prop} = ${idLit}`,
        requirementLine.trimEnd(),
        `      installer.pods_project.root_object.package_references << ref`,
        `      ref`,
        `    end`,
        `    ${rubyArray(spec.podTargets)}.each do |target_name|`,
        `      target = installer.pods_project.targets.find { |t| t.name == target_name }`,
        `      next unless target`,
        `      ${rubyArray(spec.products)}.each do |product_name|`,
        `        next if target.package_product_dependencies.any? { |d| d.product_name == product_name }`,
        `        dep = installer.pods_project.new(Xcodeproj::Project::Object::XCSwiftPackageProductDependency)`,
        `        dep.package = spm_pkg_ref`,
        `        dep.product_name = product_name`,
        `        target.package_product_dependencies << dep`,
        `        bf = installer.pods_project.new(Xcodeproj::Project::Object::PBXBuildFile)`,
        `        bf.product_ref = dep`,
        `        target.frameworks_build_phase.files << bf`,
        `      end`,
        `    end`,
        `  end`
      ].filter((line) => line !== "").join("\n");
    }
    function podTargetSpmOp(spec) {
      return (0, core_12.withMeta)({
        kind: "mergeBlock",
        base: "ios",
        path: "Podfile",
        tag: `expo-workspaces-spm-pod-target-${spec.slug}`,
        newSrc: renderPodTargetSpmRuby(spec),
        anchor: POD_TARGET_ANCHOR,
        offset: 1,
        comment: "#",
        label: `swiftPackages:podTarget:${spec.slug}`
      }, {
        id: `swiftPackage:podTarget:${spec.slug}`,
        platform: "ios",
        semanticKind: "ios.swiftPackage.link",
        source: "ios.packages",
        status: "add",
        files: ["ios/Podfile"],
        desired: spec
      });
    }
    function lastPathSegment(input) {
      const trimmed = input.replace(/\/+$/, "");
      const segs = trimmed.split("/");
      return segs[segs.length - 1] || trimmed;
    }
    function resolveWork(pkg, label) {
      const targets = (0, validate_1.normalizeTargetRef)(pkg.target, label);
      const podTargets = (0, validate_1.normalizeTargetRef)(pkg.podTarget, `${label}.podTarget`);
      const defaultedToMain = targets === void 0 && podTargets === void 0;
      return { pkg, targets, podTargets, defaultedToMain };
    }
    exports2.spmGenerator = {
      name: "swiftPackages",
      generate({ manifest }) {
        const slice = manifest.swiftPackages;
        if (!slice) {
          return { ops: [] };
        }
        const remote = (0, validate_1.normalizeRemotePackages)(slice.remote).map((pkg, i) => resolveWork(pkg, `swiftPackages.remote[${i}]`));
        const local = (0, validate_1.normalizeLocalPackages)(slice.local).map((pkg, i) => resolveWork(pkg, `swiftPackages.local[${i}]`));
        if (remote.length === 0 && local.length === 0) {
          return { ops: [] };
        }
        const ops = [];
        const anyMainProjectWork = remote.some((w) => w.targets || w.defaultedToMain) || local.some((w) => w.targets || w.defaultedToMain);
        if (anyMainProjectWork) {
          ops.push((0, ios_xcode_1.pbxOp)("swiftPackages", ({ project }) => {
            for (const { pkg, targets, defaultedToMain } of remote) {
              if (!targets && !defaultedToMain)
                continue;
              const ref = xcode_1.XCRemoteSwiftPackageReference.create(project, {
                repositoryURL: pkg.url,
                requirement: pkg.requirement
              });
              addPackageReference(project, ref);
              linkProducts(project, ref, pkg.products, targets);
            }
            for (const { pkg, targets, defaultedToMain } of local) {
              if (!targets && !defaultedToMain)
                continue;
              const ref = xcode_1.XCLocalSwiftPackageReference.create(project, {
                relativePath: pkg.path
              });
              addPackageReference(project, ref);
              linkProducts(project, ref, pkg.products, targets);
            }
          }, {
            id: "swiftPackage:project",
            platform: "ios",
            semanticKind: "ios.swiftPackage.add",
            source: "ios.packages",
            status: "add",
            files: ["ios/*.xcodeproj/project.pbxproj"],
            desired: {
              remote: remote.map((w) => w.pkg.url),
              local: local.map((w) => w.pkg.path)
            },
            phase: "finalized"
          }));
        }
        for (const { pkg, podTargets } of remote) {
          if (!podTargets)
            continue;
          ops.push(podTargetSpmOp({
            slug: slugify(lastPathSegment(pkg.url)),
            identifier: pkg.url,
            kind: "remote",
            requirement: pkg.requirement,
            products: pkg.products,
            podTargets
          }));
        }
        for (const { pkg, podTargets } of local) {
          if (!podTargets)
            continue;
          ops.push(podTargetSpmOp({
            slug: slugify(lastPathSegment(pkg.path)),
            identifier: pkg.path,
            kind: "local",
            products: pkg.products,
            podTargets
          }));
        }
        return { ops };
      }
    };
  }
});

// packages/@expo-workspaces/ios-spm/build/index.js
var require_build5 = __commonJS({
  "packages/@expo-workspaces/ios-spm/build/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.normalizeTargetRef = exports2.normalizeLocalPackages = exports2.normalizeRemotePackages = exports2.spmGenerator = void 0;
    var spm_1 = require_spm();
    Object.defineProperty(exports2, "spmGenerator", { enumerable: true, get: function() {
      return spm_1.spmGenerator;
    } });
    var validate_1 = require_validate3();
    Object.defineProperty(exports2, "normalizeRemotePackages", { enumerable: true, get: function() {
      return validate_1.normalizeRemotePackages;
    } });
    Object.defineProperty(exports2, "normalizeLocalPackages", { enumerable: true, get: function() {
      return validate_1.normalizeLocalPackages;
    } });
    Object.defineProperty(exports2, "normalizeTargetRef", { enumerable: true, get: function() {
      return validate_1.normalizeTargetRef;
    } });
  }
});

// packages/@expo-workspaces/ios-targets/build/bundleId.js
var require_bundleId = __commonJS({
  "packages/@expo-workspaces/ios-targets/build/bundleId.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.sanitizeBundleIdentifier = sanitizeBundleIdentifier;
    exports2.getMainBundleId = getMainBundleId;
    exports2.resolveTargetBundleId = resolveTargetBundleId;
    function sanitizeBundleIdentifier(value) {
      return value.replace(/(^[^a-zA-Z.-]|[^a-zA-Z0-9-.])/g, "-");
    }
    function getMainBundleId(config) {
      const id = config.ios?.bundleIdentifier;
      if (!id) {
        throw new Error("[expo-workspaces] ios.bundleIdentifier is required to derive target bundle identifiers.");
      }
      return id;
    }
    function resolveTargetBundleId(config, target) {
      const mainBundleId = getMainBundleId(config);
      if (target.bundleIdentifier?.startsWith(".")) {
        return mainBundleId + target.bundleIdentifier;
      }
      if (target.bundleIdentifier) {
        return target.bundleIdentifier;
      }
      if (target.type === "clip") {
        return `${mainBundleId}.clip`;
      }
      return `${mainBundleId}.${sanitizeBundleIdentifier(target.type)}`;
    }
  }
});

// packages/@expo-workspaces/ios-targets/build/easCredentials.js
var require_easCredentials = __commonJS({
  "packages/@expo-workspaces/ios-targets/build/easCredentials.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.addEASAppExtension = addEASAppExtension;
    function addEASAppExtension(config, credential) {
      var _a, _b, _c, _d, _e;
      const extra = config.extra ?? (config.extra = {});
      const eas = (_a = extra).eas ?? (_a.eas = {});
      const build = (_b = eas).build ?? (_b.build = {});
      const experimental = (_c = build).experimental ?? (_c.experimental = {});
      const ios = (_d = experimental).ios ?? (_d.ios = {});
      const appExtensions = (_e = ios).appExtensions ?? (_e.appExtensions = []);
      const existingIndex = appExtensions.findIndex((ext) => ext.bundleIdentifier === credential.bundleIdentifier);
      if (existingIndex > -1) {
        appExtensions[existingIndex] = credential;
      } else {
        appExtensions.push(credential);
      }
      return config;
    }
  }
});

// packages/@expo-workspaces/ios-targets/build/registry.js
var require_registry = __commonJS({
  "packages/@expo-workspaces/ios-targets/build/registry.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TARGET_REGISTRY = void 0;
    exports2.productTypeForType = productTypeForType;
    exports2.needsEmbeddedSwift = needsEmbeddedSwift;
    exports2.appGroupsByDefault = appGroupsByDefault;
    exports2.getFrameworksForType = getFrameworksForType;
    exports2.extensionPointIdentifier = extensionPointIdentifier;
    var DEFAULT_PRODUCT_TYPE = "com.apple.product-type.app-extension";
    exports2.TARGET_REGISTRY = {
      share: {
        extensionPointIdentifier: "com.apple.share-services",
        needsEmbeddedSwift: true,
        appGroupsByDefault: true
      },
      widget: {
        extensionPointIdentifier: "com.apple.widgetkit-extension",
        frameworks: ["WidgetKit", "SwiftUI", "ActivityKit", "AppIntents"],
        appGroupsByDefault: true
      },
      clip: {
        productType: "com.apple.product-type.application.on-demand-install-capable",
        needsEmbeddedSwift: true,
        appGroupsByDefault: true
      }
    };
    function productTypeForType(type) {
      return exports2.TARGET_REGISTRY[type].productType ?? DEFAULT_PRODUCT_TYPE;
    }
    function needsEmbeddedSwift(type) {
      return exports2.TARGET_REGISTRY[type].needsEmbeddedSwift ?? false;
    }
    function appGroupsByDefault(type) {
      return exports2.TARGET_REGISTRY[type].appGroupsByDefault ?? false;
    }
    function getFrameworksForType(type, extra = []) {
      return [...exports2.TARGET_REGISTRY[type].frameworks ?? [], ...extra];
    }
    function extensionPointIdentifier(type) {
      return exports2.TARGET_REGISTRY[type].extensionPointIdentifier;
    }
  }
});

// packages/@expo-workspaces/ios-targets/build/entitlements.js
var require_entitlements = __commonJS({
  "packages/@expo-workspaces/ios-targets/build/entitlements.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.resolveEntitlements = resolveEntitlements;
    exports2.buildEntitlements = buildEntitlements;
    var plist_1 = __importDefault2(require("@expo/plist"));
    var registry_1 = require_registry();
    var APP_GROUPS_KEY = "com.apple.security.application-groups";
    function resolveEntitlements(config, target) {
      const declared = target.entitlements ? { ...target.entitlements } : void 0;
      if (declared && APP_GROUPS_KEY in declared) {
        return declared;
      }
      if ((0, registry_1.appGroupsByDefault)(target.type)) {
        const appGroups = config.ios?.entitlements?.[APP_GROUPS_KEY];
        if (Array.isArray(appGroups) && appGroups.length > 0) {
          return { ...declared ?? {}, [APP_GROUPS_KEY]: appGroups };
        }
      }
      return declared;
    }
    function buildEntitlements(entitlements) {
      return plist_1.default.build(entitlements);
    }
  }
});

// packages/@expo-workspaces/ios-targets/build/configurationList.js
var require_configurationList = __commonJS({
  "packages/@expo-workspaces/ios-targets/build/configurationList.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createConfigurationListForType = createConfigurationListForType;
    var xcode_1 = require("@bacons/xcode");
    function commonSettings(props) {
      return {
        CLANG_ANALYZER_NONNULL: "YES",
        CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
        CLANG_CXX_LANGUAGE_STANDARD: "gnu++20",
        CLANG_ENABLE_OBJC_WEAK: "YES",
        CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
        CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
        CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
        CODE_SIGN_STYLE: "Automatic",
        DEBUG_INFORMATION_FORMAT: "dwarf",
        GCC_C_LANGUAGE_STANDARD: "gnu11",
        GENERATE_INFOPLIST_FILE: "YES",
        CURRENT_PROJECT_VERSION: props.currentProjectVersion,
        INFOPLIST_FILE: `${props.cwd}/Info.plist`,
        INFOPLIST_KEY_CFBundleDisplayName: props.displayName ?? props.name,
        INFOPLIST_KEY_NSHumanReadableCopyright: "",
        IPHONEOS_DEPLOYMENT_TARGET: props.deploymentTarget,
        LD_RUNPATH_SEARCH_PATHS: [
          "$(inherited)",
          "@executable_path/Frameworks",
          "@executable_path/../../Frameworks"
        ],
        MARKETING_VERSION: "1.0",
        MTL_FAST_MATH: "YES",
        PRODUCT_BUNDLE_IDENTIFIER: props.bundleId,
        PRODUCT_NAME: "$(TARGET_NAME)",
        SKIP_INSTALL: "YES",
        SWIFT_EMIT_LOC_STRINGS: "YES",
        SWIFT_OPTIMIZATION_LEVEL: "-Onone",
        SWIFT_VERSION: "5.0",
        TARGETED_DEVICE_FAMILY: "1,2"
      };
    }
    function settingsForType(_type, props) {
      const common = commonSettings(props);
      return {
        debug: { ...common, MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE", SWIFT_ACTIVE_COMPILATION_CONDITIONS: "DEBUG" },
        release: { CLANG_ANALYZER_NONNULL: "YES", ...common, COPY_PHASE_STRIP: "NO" }
      };
    }
    function createConfigurationListForType(project, type, props) {
      const { debug, release } = settingsForType(type, props);
      return xcode_1.XCConfigurationList.create(project, {
        buildConfigurations: [
          xcode_1.XCBuildConfiguration.create(project, { name: "Debug", buildSettings: debug }),
          xcode_1.XCBuildConfiguration.create(project, { name: "Release", buildSettings: release })
        ],
        defaultConfigurationIsVisible: 0,
        defaultConfigurationName: "Release"
      });
    }
  }
});

// packages/@expo-workspaces/ios-targets/build/generateTarget.js
var require_generateTarget = __commonJS({
  "packages/@expo-workspaces/ios-targets/build/generateTarget.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.applyTargetsPbx = applyTargetsPbx;
    var path_12 = __importDefault2(require("path"));
    var xcode_1 = require("@bacons/xcode");
    var configurationList_1 = require_configurationList();
    var PROTECTED_GROUP_NAME = "expo:targets";
    function setBuildSetting(target, key, value) {
      target.setBuildSetting(key, value);
    }
    function ensureProtectedGroup(project, relativePath) {
      const mainGroup = project.rootObject.props.mainGroup;
      const existing = mainGroup.getChildGroups().find((group2) => group2.getDisplayName() === PROTECTED_GROUP_NAME);
      if (existing) {
        return existing;
      }
      const group = xcode_1.PBXGroup.create(project, {
        name: PROTECTED_GROUP_NAME,
        path: relativePath,
        sourceTree: "<group>"
      });
      mainGroup.props.children.unshift(group);
      return group;
    }
    function applyDevelopmentTeamId(project, teamId) {
      const devTeamId = teamId || project.rootObject.props.targets.map((target) => target.getDefaultBuildSetting?.("DEVELOPMENT_TEAM")).find(Boolean);
      for (const target of project.rootObject.props.targets) {
        if (devTeamId) {
          setBuildSetting(target, "DEVELOPMENT_TEAM", devTeamId);
        } else {
          target.removeBuildSetting?.("DEVELOPMENT_TEAM");
        }
      }
      const attributes = project.rootObject.props.attributes ?? {};
      attributes.TargetAttributes = attributes.TargetAttributes ?? {};
      for (const target of project.rootObject.props.targets) {
        if (!attributes.TargetAttributes[target.uuid]) {
          attributes.TargetAttributes[target.uuid] = {
            CreatedOnToolsVersion: "14.3",
            ProvisioningStyle: "Automatic",
            DevelopmentTeam: devTeamId
          };
        }
      }
      project.rootObject.props.attributes = attributes;
    }
    function syncMarketingVersions(project, marketingVersion) {
      for (const target of project.rootObject.props.targets) {
        if (xcode_1.PBXNativeTarget.is(target)) {
          setBuildSetting(target, "MARKETING_VERSION", marketingVersion);
        }
      }
    }
    function applyTargetsPbx(project, plans, settings) {
      const mainAppTarget = project.rootObject.getMainAppTarget("ios");
      if (!mainAppTarget) {
        throw new Error("[expo-workspaces] Could not find the main iOS application target.");
      }
      for (const plan of plans) {
        if (plan.needsEmbeddedSwift) {
          setBuildSetting(mainAppTarget, "ALWAYS_EMBED_SWIFT_STANDARD_LIBRARIES", "YES");
        }
        const fileRef = xcode_1.PBXFileReference.create(project, {
          explicitFileType: plan.explicitFileType,
          includeInIndex: 0,
          path: plan.name + (plan.isExtension ? ".appex" : ".app"),
          sourceTree: "BUILT_PRODUCTS_DIR"
        });
        const buildFile = xcode_1.PBXBuildFile.create(project, {
          fileRef,
          settings: { ATTRIBUTES: ["RemoveHeadersOnCopy"] }
        });
        project.rootObject.ensureProductGroup().props.children.push(fileRef);
        const target = project.rootObject.createNativeTarget({
          buildConfigurationList: (0, configurationList_1.createConfigurationListForType)(project, plan.type, {
            name: plan.name,
            cwd: plan.cwd,
            bundleId: plan.bundleId,
            deploymentTarget: plan.deploymentTarget,
            currentProjectVersion: plan.currentProjectVersion
          }),
          name: plan.name,
          productName: plan.productName,
          productReference: fileRef,
          productType: plan.productType
        });
        const copyPhase = mainAppTarget.getCopyBuildPhaseForTarget(target);
        copyPhase.props.files.push(buildFile);
        if (plan.entitlementsFileName) {
          setBuildSetting(target, "CODE_SIGN_ENTITLEMENTS", `${plan.cwd}/${plan.entitlementsFileName}`);
          if (plan.hasAppGroups) {
            setBuildSetting(target, "REGISTER_APP_GROUPS", "YES");
          }
        }
        if (plan.buildSettings) {
          for (const [key, value] of Object.entries(plan.buildSettings)) {
            setBuildSetting(target, key, value);
          }
        }
        target.ensureFrameworks(plan.frameworks);
        target.getSourcesBuildPhase();
        target.getResourcesBuildPhase();
        mainAppTarget.addDependency(target);
        const protectedGroup = ensureProtectedGroup(project, path_12.default.posix.dirname(plan.cwd));
        const exceptionSet = xcode_1.PBXFileSystemSynchronizedBuildFileExceptionSet.create(project, {
          target,
          membershipExceptions: plan.membershipExceptions
        });
        const syncGroup = xcode_1.PBXFileSystemSynchronizedRootGroup.create(project, {
          path: plan.name,
          exceptions: [exceptionSet],
          explicitFileTypes: {},
          explicitFolders: [],
          sourceTree: "<group>"
        });
        target.props.fileSystemSynchronizedGroups = [syncGroup];
        protectedGroup.props.children.push(syncGroup);
      }
      applyDevelopmentTeamId(project, settings.teamId);
      syncMarketingVersions(project, settings.marketingVersion);
    }
  }
});

// packages/@expo-workspaces/ios-targets/build/infoPlist.js
var require_infoPlist = __commonJS({
  "packages/@expo-workspaces/ios-targets/build/infoPlist.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getTargetInfoPlist = getTargetInfoPlist;
    exports2.buildInfoPlist = buildInfoPlist;
    var plist_1 = __importDefault2(require("@expo/plist"));
    var registry_1 = require_registry();
    function getTargetInfoPlist(type) {
      const pointIdentifier = (0, registry_1.extensionPointIdentifier)(type);
      switch (type) {
        case "share":
          return {
            NSExtension: {
              NSExtensionAttributes: { NSExtensionActivationRule: "TRUEPREDICATE" },
              NSExtensionPrincipalClass: "$(PRODUCT_MODULE_NAME).ShareViewController",
              NSExtensionPointIdentifier: pointIdentifier
            }
          };
        case "widget":
          return { NSExtension: { NSExtensionPointIdentifier: pointIdentifier } };
        case "clip":
          return {
            CFBundleName: "$(PRODUCT_NAME)",
            CFBundleIdentifier: "$(PRODUCT_BUNDLE_IDENTIFIER)",
            CFBundleVersion: "$(CURRENT_PROJECT_VERSION)",
            CFBundleExecutable: "$(EXECUTABLE_NAME)",
            CFBundlePackageType: "$(PRODUCT_BUNDLE_PACKAGE_TYPE)",
            CFBundleShortVersionString: "$(MARKETING_VERSION)",
            UIApplicationSupportsIndirectInputEvents: true,
            NSAppClip: {
              NSAppClipRequestEphemeralUserNotification: false,
              NSAppClipRequestLocationConfirmation: false
            }
          };
        default:
          return {};
      }
    }
    function buildInfoPlist(type) {
      return plist_1.default.build(getTargetInfoPlist(type));
    }
  }
});

// packages/@expo-workspaces/ios-targets/build/podsLoader.js
var require_podsLoader = __commonJS({
  "packages/@expo-workspaces/ios-targets/build/podsLoader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TARGETS_LOADER_MARKER = void 0;
    exports2.buildTargetsPodfileLoader = buildTargetsPodfileLoader;
    exports2.TARGETS_LOADER_MARKER = "apple-targets-extension-loader";
    function buildTargetsPodfileLoader(targetsRootClean) {
      return `# ${exports2.TARGETS_LOADER_MARKER} -- Dynamic loading of target configurations
Dir.glob(File.join(__dir__, '..', '${targetsRootClean}', '**', 'pods.rb')).each do |target_file|
  target_name = File.basename(File.dirname(target_file))
  target target_name do
    # Create a new binding with access to necessary methods and variables
    target_binding = binding
    target_binding.local_variable_set(:podfile_properties, podfile_properties)

    # Evaluate the target file content in the new binding
    eval(File.read(target_file), target_binding, target_file)
  end
end
`;
    }
  }
});

// packages/@expo-workspaces/ios-targets/build/validate.js
var require_validate4 = __commonJS({
  "packages/@expo-workspaces/ios-targets/build/validate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_TARGETS_ROOT = void 0;
    exports2.cleanTargetsRoot = cleanTargetsRoot;
    exports2.normalizeTargets = normalizeTargets;
    var core_12 = require_build();
    var TARGET_TYPES = /* @__PURE__ */ new Set(["share", "widget", "clip"]);
    var INVALID_PATH_SEGMENT = /[\\/:*?"<>|]/;
    function isAbsolute(value) {
      return value.startsWith("/") || /^[A-Za-z]:/.test(value);
    }
    exports2.DEFAULT_TARGETS_ROOT = "./targets";
    function cleanTargetsRoot(targetsRoot) {
      const root = (targetsRoot ?? exports2.DEFAULT_TARGETS_ROOT).trim() || exports2.DEFAULT_TARGETS_ROOT;
      return root.replace(/^\.\//, "").replace(/\/+$/, "");
    }
    function normalizeTargets(targets) {
      if (!Array.isArray(targets) || targets.length === 0) {
        return [];
      }
      const seen = /* @__PURE__ */ new Set();
      return targets.map((target, index) => {
        if (!target?.name?.trim()) {
          throw new Error(`${core_12.ERR} targets[${index}] requires a non-empty "name".`);
        }
        const name = target.name.trim();
        if (INVALID_PATH_SEGMENT.test(name)) {
          throw new Error(`${core_12.ERR} targets[${index}].name contains invalid path characters: "${name}"`);
        }
        if (seen.has(name)) {
          throw new Error(`${core_12.ERR} Duplicate target name "${name}" in targets configuration.`);
        }
        seen.add(name);
        if (!target.type || !TARGET_TYPES.has(target.type)) {
          throw new Error(`${core_12.ERR} targets[${index}].type must be one of ${[...TARGET_TYPES].join(", ")} (received "${target.type}").`);
        }
        if (target.bundleIdentifier !== void 0 && !target.bundleIdentifier.trim()) {
          throw new Error(`${core_12.ERR} targets[${index}].bundleIdentifier cannot be empty when provided.`);
        }
        if (target.source !== void 0) {
          const source = target.source.trim();
          if (!source) {
            throw new Error(`${core_12.ERR} targets[${index}].source cannot be empty when provided.`);
          }
          if (isAbsolute(source)) {
            throw new Error(`${core_12.ERR} targets[${index}].source must be relative to the app root: "${source}"`);
          }
        }
        if (target.entitlements !== void 0 && typeof target.entitlements !== "object") {
          throw new Error(`${core_12.ERR} targets[${index}].entitlements must be an object.`);
        }
        if (target.buildSettings !== void 0) {
          if (typeof target.buildSettings !== "object") {
            throw new Error(`${core_12.ERR} targets[${index}].buildSettings must be an object.`);
          }
          for (const [key, value] of Object.entries(target.buildSettings)) {
            if (typeof value !== "string") {
              throw new Error(`${core_12.ERR} targets[${index}].buildSettings["${key}"] must be a string.`);
            }
          }
        }
        if (target.pods !== void 0) {
          if (!Array.isArray(target.pods)) {
            throw new Error(`${core_12.ERR} targets[${index}].pods must be an array.`);
          }
          target.pods.forEach((entry, podIdx) => {
            const label = `targets[${index}].pods[${podIdx}]`;
            if (!entry || typeof entry !== "object") {
              throw new Error(`${core_12.ERR} ${label} must be an object.`);
            }
            if (!entry.pod || typeof entry.pod !== "string" || !entry.pod.trim()) {
              throw new Error(`${core_12.ERR} ${label} requires a non-empty "pod" name.`);
            }
            if (entry.path !== void 0 && (typeof entry.path !== "string" || !entry.path.trim())) {
              throw new Error(`${core_12.ERR} ${label}.path must be a non-empty string when provided.`);
            }
            if (entry.configurations !== void 0 && !Array.isArray(entry.configurations)) {
              throw new Error(`${core_12.ERR} ${label}.configurations must be an array of strings.`);
            }
          });
        }
        return { ...target, name };
      });
    }
  }
});

// packages/@expo-workspaces/ios-targets/build/generators/targets.js
var require_targets = __commonJS({
  "packages/@expo-workspaces/ios-targets/build/generators/targets.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.targetsGenerator = void 0;
    var fs_1 = __importDefault2(require("fs"));
    var path_12 = __importDefault2(require("path"));
    var core_12 = require_build();
    var ios_xcode_1 = require_build4();
    var bundleId_1 = require_bundleId();
    var easCredentials_1 = require_easCredentials();
    var entitlements_1 = require_entitlements();
    var generateTarget_1 = require_generateTarget();
    var infoPlist_1 = require_infoPlist();
    var podsLoader_1 = require_podsLoader();
    var registry_1 = require_registry();
    var validate_1 = require_validate4();
    var DEFAULT_DEPLOYMENT_TARGET = "18.0";
    var APP_GROUPS_KEY = "com.apple.security.application-groups";
    function targetPodLine(pod) {
      const parts = [`pod '${pod.pod}'`];
      if (pod.path) {
        parts.push(`:path => '${pod.path}'`);
      } else if (pod.version) {
        parts.push(`'${pod.version}'`);
      }
      if (pod.git)
        parts.push(`:git => '${pod.git}'`);
      if (pod.branch)
        parts.push(`:branch => '${pod.branch}'`);
      if (pod.tag)
        parts.push(`:tag => '${pod.tag}'`);
      if (pod.commit)
        parts.push(`:commit => '${pod.commit}'`);
      if (pod.configurations?.length) {
        const cfgs = pod.configurations.map((c) => `'${c}'`).join(", ");
        parts.push(`:configurations => [${cfgs}]`);
      }
      if (pod.modularHeaders != null)
        parts.push(`:modular_headers => ${pod.modularHeaders}`);
      return `  ${parts.join(", ")}`;
    }
    function buildTargetPodsBlock(name, pods) {
      return `target '${name}' do
${pods.map(targetPodLine).join("\n")}
end`;
    }
    function sanitizeProductName(name) {
      return name.replace(/[\W_]+/g, "").normalize("NFD").replace(/[̀-ͯ]/g, "");
    }
    function isExtensionProductType(productType) {
      return productType.includes("app-extension") || productType.includes("extensionkit-extension");
    }
    function findFile(dir, predicate) {
      if (!fs_1.default.existsSync(dir)) {
        return void 0;
      }
      return fs_1.default.readdirSync(dir).find(predicate);
    }
    function resolveTargets(config, projectRoot, manifest) {
      const slice = manifest;
      const targets = (0, validate_1.normalizeTargets)(slice.targets);
      const targetsRootClean = (0, validate_1.cleanTargetsRoot)(slice.targetsRoot);
      const resolved = targets.map((spec) => {
        const sourceRel = spec.source ?? `${targetsRootClean}/${spec.name}`;
        const sourceAbs = path_12.default.join(projectRoot, sourceRel);
        const cwd = `../${sourceRel}`;
        const productType = (0, registry_1.productTypeForType)(spec.type);
        const isExtension = isExtensionProductType(productType);
        const entitlementsJson = (0, entitlements_1.resolveEntitlements)(config, spec);
        const entitlementsFileName = entitlementsJson ? findFile(sourceAbs, (name) => name.endsWith(".entitlements")) ?? "generated.entitlements" : void 0;
        const hasAppGroups = Array.isArray((entitlementsJson ?? {})[APP_GROUPS_KEY]) ? (entitlementsJson ?? {})[APP_GROUPS_KEY].length > 0 : false;
        const configFile = findFile(sourceAbs, (name) => /^expo-target\.config\.(js|json)$/.test(name));
        const membershipExceptions = ["Info.plist", ...configFile ? [configFile] : []].sort();
        const plan = {
          type: spec.type,
          name: spec.name,
          productName: sanitizeProductName(spec.name),
          productType,
          explicitFileType: isExtension ? "wrapper.app-extension" : "wrapper.application",
          isExtension,
          bundleId: (0, bundleId_1.resolveTargetBundleId)(config, spec),
          deploymentTarget: spec.deploymentTarget ?? DEFAULT_DEPLOYMENT_TARGET,
          cwd,
          currentProjectVersion: config.ios?.buildNumber || 1,
          needsEmbeddedSwift: (0, registry_1.needsEmbeddedSwift)(spec.type),
          frameworks: (0, registry_1.getFrameworksForType)(spec.type, spec.frameworks ?? []),
          entitlementsFileName,
          hasAppGroups,
          membershipExceptions,
          buildSettings: spec.buildSettings
        };
        return { spec, sourceRel, plan, entitlementsJson };
      });
      return { targetsRootClean, resolved };
    }
    exports2.targetsGenerator = {
      name: "targets",
      contributeConfig(config, ctx) {
        const { resolved } = resolveTargets(config, ctx.projectRoot, ctx.manifest);
        for (const { plan, entitlementsJson } of resolved) {
          (0, easCredentials_1.addEASAppExtension)(config, {
            bundleIdentifier: plan.bundleId,
            targetName: plan.productName,
            entitlements: entitlementsJson
          });
        }
        return config;
      },
      generate({ config, projectRoot, manifest }) {
        const { targetsRootClean, resolved } = resolveTargets(config, projectRoot, manifest);
        if (resolved.length === 0) {
          return { ops: [] };
        }
        const ops = [];
        resolved.forEach(({ spec, sourceRel, plan, entitlementsJson }, index) => {
          const source = `ios.targets[${index}]`;
          ops.push((0, core_12.withMeta)({
            kind: "writeFile",
            base: "project",
            path: `${sourceRel}/Info.plist`,
            contents: (0, infoPlist_1.buildInfoPlist)(spec.type),
            overwrite: "ifAbsent",
            label: `target:${spec.name}:Info.plist`
          }, {
            id: `target:${spec.name}:infoPlist`,
            platform: "ios",
            semanticKind: "ios.target.infoPlist.write",
            source,
            status: "add",
            files: [`${sourceRel}/Info.plist`],
            desired: { type: spec.type }
          }));
          if (entitlementsJson && plan.entitlementsFileName) {
            ops.push((0, core_12.withMeta)({
              kind: "writeFile",
              base: "project",
              path: `${sourceRel}/${plan.entitlementsFileName}`,
              contents: (0, entitlements_1.buildEntitlements)(entitlementsJson),
              overwrite: "always",
              label: `target:${spec.name}:entitlements`
            }, {
              id: `target:${spec.name}:entitlements`,
              platform: "ios",
              semanticKind: "ios.entitlement.set",
              source,
              status: "add",
              files: [`${sourceRel}/${plan.entitlementsFileName}`],
              desired: entitlementsJson
            }));
          }
        });
        ops.push((0, core_12.withMeta)({
          kind: "appendOnce",
          base: "ios",
          path: "Podfile",
          marker: podsLoader_1.TARGETS_LOADER_MARKER,
          contents: (0, podsLoader_1.buildTargetsPodfileLoader)(targetsRootClean),
          label: "targetsPodfileLoader"
        }, {
          id: "target:podfileLoader",
          platform: "ios",
          semanticKind: "ios.pod.loader.add",
          source: "ios.targets",
          status: "add",
          files: ["ios/Podfile"]
        }));
        resolved.forEach(({ spec }, index) => {
          if (!spec.pods?.length)
            return;
          ops.push((0, core_12.withMeta)({
            kind: "mergeBlock",
            base: "ios",
            path: "Podfile",
            tag: `expo-workspaces-target-pods-${spec.name}`,
            newSrc: buildTargetPodsBlock(spec.name, spec.pods),
            anchor: new RegExp(podsLoader_1.TARGETS_LOADER_MARKER),
            offset: 0,
            comment: "#",
            label: `target:${spec.name}:pods`
          }, {
            id: `target:${spec.name}:pods`,
            platform: "ios",
            semanticKind: "ios.pod.add",
            source: `ios.targets[${index}].pods`,
            status: "add",
            files: ["ios/Podfile"],
            desired: spec.pods
          }));
        });
        const plans = resolved.map((r) => r.plan);
        const teamId = config.ios?.appleTeamId;
        const marketingVersion = config.ios?.version || config.version || "1.0.0";
        ops.push((0, ios_xcode_1.pbxOp)("targets", ({ project }) => {
          (0, generateTarget_1.applyTargetsPbx)(project, plans, { teamId, marketingVersion });
        }, {
          id: "target:all",
          platform: "ios",
          semanticKind: "ios.target.add",
          source: "ios.targets",
          status: "add",
          files: ["ios/*.xcodeproj/project.pbxproj"],
          desired: resolved.map(({ spec, plan }, index) => ({
            source: `ios.targets[${index}]`,
            name: spec.name,
            type: spec.type,
            bundleIdentifier: plan.bundleId,
            deploymentTarget: plan.deploymentTarget
          })),
          phase: "finalized"
        }));
        return { ops };
      }
    };
  }
});

// packages/@expo-workspaces/ios-targets/build/index.js
var require_build6 = __commonJS({
  "packages/@expo-workspaces/ios-targets/build/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.buildTargetsPodfileLoader = exports2.TARGETS_LOADER_MARKER = exports2.applyTargetsPbx = exports2.needsEmbeddedSwift = exports2.productTypeForType = exports2.TARGET_REGISTRY = exports2.addEASAppExtension = exports2.buildInfoPlist = exports2.getTargetInfoPlist = exports2.buildEntitlements = exports2.resolveEntitlements = exports2.sanitizeBundleIdentifier = exports2.getMainBundleId = exports2.resolveTargetBundleId = exports2.DEFAULT_TARGETS_ROOT = exports2.cleanTargetsRoot = exports2.normalizeTargets = exports2.targetsGenerator = void 0;
    var targets_1 = require_targets();
    Object.defineProperty(exports2, "targetsGenerator", { enumerable: true, get: function() {
      return targets_1.targetsGenerator;
    } });
    var validate_1 = require_validate4();
    Object.defineProperty(exports2, "normalizeTargets", { enumerable: true, get: function() {
      return validate_1.normalizeTargets;
    } });
    Object.defineProperty(exports2, "cleanTargetsRoot", { enumerable: true, get: function() {
      return validate_1.cleanTargetsRoot;
    } });
    Object.defineProperty(exports2, "DEFAULT_TARGETS_ROOT", { enumerable: true, get: function() {
      return validate_1.DEFAULT_TARGETS_ROOT;
    } });
    var bundleId_1 = require_bundleId();
    Object.defineProperty(exports2, "resolveTargetBundleId", { enumerable: true, get: function() {
      return bundleId_1.resolveTargetBundleId;
    } });
    Object.defineProperty(exports2, "getMainBundleId", { enumerable: true, get: function() {
      return bundleId_1.getMainBundleId;
    } });
    Object.defineProperty(exports2, "sanitizeBundleIdentifier", { enumerable: true, get: function() {
      return bundleId_1.sanitizeBundleIdentifier;
    } });
    var entitlements_1 = require_entitlements();
    Object.defineProperty(exports2, "resolveEntitlements", { enumerable: true, get: function() {
      return entitlements_1.resolveEntitlements;
    } });
    Object.defineProperty(exports2, "buildEntitlements", { enumerable: true, get: function() {
      return entitlements_1.buildEntitlements;
    } });
    var infoPlist_1 = require_infoPlist();
    Object.defineProperty(exports2, "getTargetInfoPlist", { enumerable: true, get: function() {
      return infoPlist_1.getTargetInfoPlist;
    } });
    Object.defineProperty(exports2, "buildInfoPlist", { enumerable: true, get: function() {
      return infoPlist_1.buildInfoPlist;
    } });
    var easCredentials_1 = require_easCredentials();
    Object.defineProperty(exports2, "addEASAppExtension", { enumerable: true, get: function() {
      return easCredentials_1.addEASAppExtension;
    } });
    var registry_1 = require_registry();
    Object.defineProperty(exports2, "TARGET_REGISTRY", { enumerable: true, get: function() {
      return registry_1.TARGET_REGISTRY;
    } });
    Object.defineProperty(exports2, "productTypeForType", { enumerable: true, get: function() {
      return registry_1.productTypeForType;
    } });
    Object.defineProperty(exports2, "needsEmbeddedSwift", { enumerable: true, get: function() {
      return registry_1.needsEmbeddedSwift;
    } });
    var generateTarget_1 = require_generateTarget();
    Object.defineProperty(exports2, "applyTargetsPbx", { enumerable: true, get: function() {
      return generateTarget_1.applyTargetsPbx;
    } });
    var podsLoader_1 = require_podsLoader();
    Object.defineProperty(exports2, "TARGETS_LOADER_MARKER", { enumerable: true, get: function() {
      return podsLoader_1.TARGETS_LOADER_MARKER;
    } });
    Object.defineProperty(exports2, "buildTargetsPodfileLoader", { enumerable: true, get: function() {
      return podsLoader_1.buildTargetsPodfileLoader;
    } });
  }
});

// packages/@expo-workspaces/patch/build/generators/patch.js
var require_patch = __commonJS({
  "packages/@expo-workspaces/patch/build/generators/patch.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.patchGenerator = void 0;
    var core_12 = require_build();
    function buildOpsForPatch(patch, index) {
      if (!patch?.file?.trim()) {
        throw new Error(`${core_12.ERR} patches[${index}] requires a "file".`);
      }
      const base = patch.base;
      const file = patch.file.trim();
      const ops = [];
      let count = 0;
      if (patch.block) {
        count++;
        const b = patch.block;
        const op = {
          kind: "mergeBlock",
          base,
          path: file,
          tag: b.tag,
          newSrc: b.contents,
          anchor: b.regex ? new RegExp(b.anchor) : new RegExp(escapeRegExp(b.anchor)),
          offset: b.offset ?? 0,
          comment: b.comment ?? "//",
          appendIfNoAnchor: b.appendIfNoAnchor,
          label: `patch:${file}:block:${b.tag}`
        };
        ops.push(op);
      }
      if (patch.insertAfter) {
        count++;
        ops.push(patchOp(file, base, `patch:${file}:insertAfter`, {
          mode: "insertAfter",
          anchor: patch.insertAfter.anchor,
          regex: Boolean(patch.insertAfter.regex),
          text: patch.insertAfter.text
        }));
      }
      if (patch.insertBefore) {
        count++;
        ops.push(patchOp(file, base, `patch:${file}:insertBefore`, {
          mode: "insertBefore",
          anchor: patch.insertBefore.anchor,
          regex: Boolean(patch.insertBefore.regex),
          text: patch.insertBefore.text
        }));
      }
      if (patch.replace) {
        count++;
        ops.push(patchOp(file, base, `patch:${file}:replace`, {
          mode: "replace",
          find: patch.replace.find,
          regex: Boolean(patch.replace.regex),
          all: Boolean(patch.replace.all),
          with: patch.replace.with
        }));
      }
      if (count === 0) {
        throw new Error(`${core_12.ERR} patches[${index}] requires one of "block" | "insertAfter" | "insertBefore" | "replace".`);
      }
      return ops;
    }
    function patchOp(path, base, label, action) {
      return { kind: "patch", base, path, action, label };
    }
    function escapeRegExp(value) {
      return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    exports2.patchGenerator = {
      name: "patches",
      generate({ manifest }) {
        const patches = manifest.patches;
        if (!Array.isArray(patches) || patches.length === 0) {
          return { ops: [] };
        }
        const ops = [];
        patches.forEach((patch, index) => {
          const source = `patches[${index}]`;
          for (const op of buildOpsForPatch(patch, index)) {
            ops.push((0, core_12.withMeta)(op, {
              id: `patch:${index}:${op.label}`,
              platform: patch.base === "android" ? "android" : "ios",
              semanticKind: "patch.file",
              source,
              status: "update",
              files: [patch.file],
              risk: "escape-hatch",
              desired: { file: patch.file, base: patch.base }
            }));
          }
        });
        return { ops };
      }
    };
  }
});

// packages/@expo-workspaces/patch/build/types.js
var require_types3 = __commonJS({
  "packages/@expo-workspaces/patch/build/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isPatchOp = isPatchOp;
    function isPatchOp(op) {
      return op.kind === "patch";
    }
  }
});

// packages/@expo-workspaces/patch/build/patchExecutor.js
var require_patchExecutor = __commonJS({
  "packages/@expo-workspaces/patch/build/patchExecutor.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.patchExecutor = void 0;
    var fs_1 = __importDefault2(require("fs"));
    var path_12 = __importDefault2(require("path"));
    var config_plugins_1 = require("@expo/config-plugins");
    var core_12 = require_build();
    var types_1 = require_types3();
    var ERR = "[expo-workspaces]";
    function applyAction(contents, op) {
      const { action } = op;
      if (action.mode === "replace") {
        const pattern = action.regex ? new RegExp(action.find, action.all ? "g" : "") : action.find;
        const next = typeof pattern === "string" && action.all ? contents.split(pattern).join(action.with) : contents.replace(pattern, action.with);
        return { next, changed: next !== contents };
      }
      if (contents.includes(action.text)) {
        return { next: contents, changed: false };
      }
      const matcher = action.regex ? new RegExp(action.anchor) : action.anchor;
      const matchIndex = action.regex ? contents.search(matcher) : contents.indexOf(matcher);
      if (matchIndex < 0) {
        throw new Error(`${ERR} ${op.label}: anchor not found ("${action.anchor}").`);
      }
      const anchorText = action.regex ? contents.match(matcher)[0] : matcher;
      if (action.mode === "insertAfter") {
        const lineEnd = contents.indexOf("\n", matchIndex + anchorText.length);
        const at = lineEnd < 0 ? contents.length : lineEnd + 1;
        return { next: contents.slice(0, at) + action.text + "\n" + contents.slice(at), changed: true };
      }
      const lineStart = contents.lastIndexOf("\n", matchIndex) + 1;
      return {
        next: contents.slice(0, lineStart) + action.text + "\n" + contents.slice(lineStart),
        changed: true
      };
    }
    function applyPatchOps(platform, ops) {
      return (config) => (0, config_plugins_1.withDangerousMod)(config, [
        platform,
        async (config2) => {
          const { platformProjectRoot, projectRoot } = config2.modRequest;
          const baseDir = (base) => base === "project" ? projectRoot : platformProjectRoot;
          for (const op of ops) {
            const filePath = path_12.default.resolve(baseDir(op.base), op.path);
            if (!fs_1.default.existsSync(filePath)) {
              throw new Error(`${ERR} ${op.label}: file not found at ${filePath}.`);
            }
            const original = fs_1.default.readFileSync(filePath, "utf8");
            const { next, changed } = applyAction(original, op);
            if (changed) {
              fs_1.default.writeFileSync(filePath, next, "utf8");
              (0, core_12.reportChange)(op.label, filePath);
            } else {
              (0, core_12.reportSkip)(op.label, filePath);
            }
          }
          return config2;
        }
      ]);
    }
    var patchExecutor = (config, ops) => {
      const patchOps = ops.filter(types_1.isPatchOp);
      if (patchOps.length === 0) {
        return config;
      }
      const iosOps = patchOps.filter((o) => (o.base ?? "ios") !== "android");
      const androidOps = patchOps.filter((o) => o.base === "android");
      if (iosOps.length > 0) {
        config = applyPatchOps("ios", iosOps)(config, void 0);
      }
      if (androidOps.length > 0) {
        config = applyPatchOps("android", androidOps)(config, void 0);
      }
      return config;
    };
    exports2.patchExecutor = patchExecutor;
  }
});

// packages/@expo-workspaces/patch/build/index.js
var require_build7 = __commonJS({
  "packages/@expo-workspaces/patch/build/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isPatchOp = exports2.patchExecutor = exports2.patchGenerator = void 0;
    var patch_1 = require_patch();
    Object.defineProperty(exports2, "patchGenerator", { enumerable: true, get: function() {
      return patch_1.patchGenerator;
    } });
    var patchExecutor_1 = require_patchExecutor();
    Object.defineProperty(exports2, "patchExecutor", { enumerable: true, get: function() {
      return patchExecutor_1.patchExecutor;
    } });
    var types_1 = require_types3();
    Object.defineProperty(exports2, "isPatchOp", { enumerable: true, get: function() {
      return types_1.isPatchOp;
    } });
  }
});

// packages/expo-workspaces/build/engine.js
var require_engine = __commonJS({
  "packages/expo-workspaces/build/engine.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.workspaceExecutors = exports2.workspaceGenerators = void 0;
    var core_12 = require_build();
    var android_1 = require_build2();
    var ios_pods_1 = require_build3();
    var ios_spm_1 = require_build5();
    var ios_targets_1 = require_build6();
    var ios_xcode_1 = require_build4();
    var patch_1 = require_build7();
    exports2.workspaceGenerators = [
      ios_pods_1.podsGenerator,
      ios_targets_1.targetsGenerator,
      ios_spm_1.spmGenerator,
      ios_xcode_1.xcodeEnvGenerator,
      ios_xcode_1.schemesGenerator,
      ios_xcode_1.fixEmbedCycleGenerator,
      patch_1.patchGenerator,
      android_1.androidGenerator
    ];
    exports2.workspaceExecutors = [core_12.fileExecutor, patch_1.patchExecutor, android_1.androidExecutor, ios_xcode_1.pbxExecutor];
  }
});

// packages/expo-workspaces/build/migrate.js
var require_migrate = __commonJS({
  "packages/expo-workspaces/build/migrate.js"(exports2) {
    "use strict";
    var __importDefault2 = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.inspectNativeProject = inspectNativeProject;
    exports2.writeMigratedConfig = writeMigratedConfig;
    var fs_1 = __importDefault2(require("fs"));
    var path_12 = __importDefault2(require("path"));
    var ios_xcode_1 = require_build4();
    function inspectNativeProject(projectRoot) {
      const iosDir = path_12.default.join(projectRoot, "ios");
      const androidDir = path_12.default.join(projectRoot, "android");
      const present = fs_1.default.existsSync(iosDir) || fs_1.default.existsSync(androidDir);
      const report = {
        present,
        targets: [],
        swiftPackages: [],
        schemes: [],
        appGroups: [],
        permissions: [],
        features: [],
        dependencies: [],
        gradleSdk: {},
        unknown: [],
        confidence: {}
      };
      if (fs_1.default.existsSync(iosDir)) {
        inspectIos(iosDir, report);
      }
      if (fs_1.default.existsSync(androidDir)) {
        inspectAndroid(androidDir, report);
      }
      return report;
    }
    function inspectIos(iosDir, report) {
      const xcodeproj = fs_1.default.readdirSync(iosDir).find((name) => name.endsWith(".xcodeproj"));
      if (!xcodeproj) {
        report.unknown.push("ios/ exists but no .xcodeproj was found");
        return;
      }
      const inspected = (0, ios_xcode_1.inspectXcodeProject)(iosDir);
      report.targets = inspected.targets;
      report.swiftPackages = inspected.swiftPackages;
      report.schemes = inspected.schemes;
      for (const url of inspected.swiftPackages) {
        report.confidence[url] = 0.9;
      }
      const entitlements = walkFiles(iosDir, (file) => file.endsWith(".entitlements"));
      for (const file of entitlements) {
        const text = fs_1.default.readFileSync(file, "utf8");
        for (const match of text.matchAll(/group\.[A-Za-z0-9.]+/g)) {
          if (!report.appGroups.includes(match[0]))
            report.appGroups.push(match[0]);
        }
      }
      report.confidence.targets = report.targets.length ? 0.85 : 0;
      report.confidence.schemes = report.schemes.length ? 0.85 : 0;
    }
    function inspectAndroid(androidDir, report) {
      const manifest = path_12.default.join(androidDir, "app", "src", "main", "AndroidManifest.xml");
      if (fs_1.default.existsSync(manifest)) {
        const text = fs_1.default.readFileSync(manifest, "utf8");
        for (const match of text.matchAll(/<uses-permission\b[^>]*android:name="([^"]+)"/g)) {
          if (!report.permissions.includes(match[1]))
            report.permissions.push(match[1]);
        }
        for (const match of text.matchAll(/<uses-feature\b[^>]*android:name="([^"]+)"/g)) {
          if (!report.features.includes(match[1]))
            report.features.push(match[1]);
        }
        report.confidence.permissions = report.permissions.length ? 0.8 : 0;
        report.confidence.features = report.features.length ? 0.8 : 0;
      }
      const gradle = path_12.default.join(androidDir, "gradle.properties");
      if (fs_1.default.existsSync(gradle)) {
        const text = fs_1.default.readFileSync(gradle, "utf8");
        for (const match of text.matchAll(/^(android\.(?:minSdkVersion|compileSdkVersion|targetSdkVersion|buildToolsVersion|ndkVersion|kotlinVersion))=(.+)$/gm)) {
          report.gradleSdk[match[1]] = match[2].trim();
        }
        if (Object.keys(report.gradleSdk).length) {
          report.confidence.gradleSdk = 0.9;
        }
      }
      const appGradle = path_12.default.join(androidDir, "app", "build.gradle");
      if (fs_1.default.existsSync(appGradle)) {
        const text = fs_1.default.readFileSync(appGradle, "utf8");
        for (const match of text.matchAll(/^\s*(implementation|api|compileOnly|runtimeOnly|debugImplementation|releaseImplementation)\s+['"]([^'"]+)['"]/gm)) {
          const line = `${match[1]} '${match[2]}'`;
          if (!report.dependencies.includes(line))
            report.dependencies.push(line);
        }
        report.confidence.dependencies = report.dependencies.length ? 0.6 : 0;
      }
    }
    function walkFiles(root, predicate) {
      const out = [];
      const stack = [root];
      while (stack.length) {
        const dir = stack.pop();
        let entries = [];
        try {
          entries = fs_1.default.readdirSync(dir, { withFileTypes: true });
        } catch {
          continue;
        }
        for (const entry of entries) {
          if (entry.name === "Pods" || entry.name === "build" || entry.name === "node_modules")
            continue;
          const full = path_12.default.join(dir, entry.name);
          if (entry.isDirectory())
            stack.push(full);
          else if (predicate(full))
            out.push(full);
        }
      }
      return out;
    }
    function writeMigratedConfig(projectRoot, report) {
      const dest = path_12.default.join(projectRoot, "workspace.config.ts");
      if (fs_1.default.existsSync(dest)) {
        throw new Error(`Refusing to overwrite existing ${dest}`);
      }
      const extraTargets = report.targets.filter((name) => !/Tests$/i.test(name));
      const targetBlocks = extraTargets.map((name) => `      // TODO: confirm type (share | widget | clip). Confidence ${report.confidence.targets ?? 0.5}
      { name: ${JSON.stringify(name)}, type: 'share' as const },`).join("\n");
      const packages = report.swiftPackages.map((url) => `      swiftPackage({
        url: ${JSON.stringify(url)},
        requirement: { kind: 'upToNextMajorVersion', minimumVersion: '1.0.0' },
        products: [/* TODO */],
      }),`).join("\n");
      const schemes = report.schemes.map((name) => `      { name: ${JSON.stringify(name)}, configuration: 'Debug' as const },`).join("\n");
      const permissions = report.permissions.map((p) => `      ${JSON.stringify(p)},`).join("\n");
      const features = report.features.map((name) => `      androidFeature(${JSON.stringify(name)}),`).join("\n");
      const dependencies = report.dependencies.map((line) => {
        const match = line.match(/^(implementation|api|compileOnly|runtimeOnly|debugImplementation|releaseImplementation)\s+'([^']+)'$/);
        if (match && match[1] === "implementation") {
          return `      androidLibrary(${JSON.stringify(match[2])}),`;
        }
        if (match) {
          return `      androidLibrary(${JSON.stringify(match[2])}, ${JSON.stringify(match[1])}),`;
        }
        return `      ${JSON.stringify(line)},`;
      }).join("\n");
      const minSdk = report.gradleSdk["android.minSdkVersion"];
      const unknown = report.unknown.map((u) => `// TODO: unmodeled \u2014 ${u}`).join("\n");
      const contents = `import {
  androidFeature,
  androidLibrary,
  defineWorkspace,
  swiftPackage,
} from 'expo-workspaces';

${unknown}

export default defineWorkspace({
  schemaVersion: 1,
  ios: {
    targets: [
${targetBlocks || "      // no extra targets detected"}
    ],
    packages: [
${packages || "      // no Swift packages detected"}
    ],
    schemes: [
${schemes || "      // no extra schemes detected"}
    ],
  },
  android: {
${minSdk ? `    minSdkVersion: ${Number.parseInt(minSdk, 10) || minSdk},
` : ""}    permissions: [
${permissions || "      // no extra permissions detected"}
    ],
    features: [
${features || "      // no uses-feature entries detected"}
    ],
    dependencies: [
${dependencies || "      // no app Gradle dependencies detected"}
    ],
  },
});
`;
      fs_1.default.writeFileSync(dest, contents);
      return dest;
    }
  }
});

// packages/expo-workspaces/build/cli.js
var __importDefault = exports && exports.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCli = runCli;
var path_1 = __importDefault(require("path"));
var core_1 = require_build();
var engine_1 = require_engine();
var migrate_1 = require_migrate();
function parseArgs(argv) {
  const args = argv.slice(2);
  const flags = /* @__PURE__ */ new Set();
  const values = {};
  const takesValue = /* @__PURE__ */ new Set(["--project", "--config", "--manifest", "--id"]);
  const positional = [];
  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    if (takesValue.has(token)) {
      values[token] = args[i + 1] ?? "";
      i += 1;
      continue;
    }
    if (token.startsWith("-")) {
      flags.add(token);
      continue;
    }
    positional.push(token);
  }
  return {
    command: positional[0] ?? "help",
    json: flags.has("--json"),
    ci: flags.has("--ci"),
    verbose: flags.has("--verbose") || flags.has("-v"),
    write: flags.has("--write"),
    configPath: values["--config"] || values["--manifest"] || void 0,
    projectRoot: path_1.default.resolve(values["--project"] || process.cwd()),
    id: values["--id"] || positional[1]
  };
}
function fail(message, code = core_1.EXIT_TOOL_FAILURE) {
  console.error(`[expo-workspaces] ${message}`);
  process.exit(code);
}
function printDiagnostics(title, diagnostics, json) {
  if (json) {
    const errors2 = diagnostics.filter((d) => d.severity === "error").length;
    const warnings2 = diagnostics.filter((d) => d.severity === "warning").length;
    console.log(JSON.stringify({ title, errors: errors2, warnings: warnings2, diagnostics }, null, 2));
    return;
  }
  console.log(title);
  if (diagnostics.length === 0) {
    console.log("\u2713 healthy");
    return;
  }
  for (const d of diagnostics) {
    const mark = d.severity === "error" ? "\u2717" : d.severity === "warning" ? "\u26A0" : "\xB7";
    const loc = d.source ? `  ${d.source}` : "";
    console.log(`${mark} ${d.message}${loc}`);
    if (d.hint)
      console.log(`    ${d.hint}`);
  }
  const errors = diagnostics.filter((d) => d.severity === "error").length;
  const warnings = diagnostics.filter((d) => d.severity === "warning").length;
  console.log(`${errors} errors \xB7 ${warnings} warnings`);
}
function loadSession(args) {
  const loaded = (0, core_1.loadWorkspaceConfig)(args.projectRoot, args.configPath);
  const plan = (0, core_1.collectWorkspacePlan)(engine_1.workspaceGenerators, (0, core_1.createGeneratorContext)(args.projectRoot, args.configPath));
  return {
    configPath: loaded.configPath,
    loadedAs: loaded.loadedAs,
    manifest: loaded.manifest,
    plan
  };
}
function runPlan(args) {
  const { plan } = loadSession(args);
  const doc = (0, core_1.buildPlanDocument)(plan);
  if (args.json) {
    console.log(JSON.stringify(doc, null, 2));
  } else {
    console.log(`Config  ${doc.configPath}`);
    console.log((0, core_1.renderPlanHuman)(doc, args.verbose));
  }
  return core_1.EXIT_OK;
}
function runValidate(args) {
  try {
    const session = loadSession(args);
    const diagnostics = (0, core_1.runDoctor)({
      projectRoot: args.projectRoot,
      configPath: session.configPath,
      manifest: session.manifest,
      appConfig: (0, core_1.loadAppConfig)(args.projectRoot),
      plan: session.plan,
      nodeVersion: process.versions.node
    }).filter((d) => d.severity === "error");
    if (args.json) {
      console.log(JSON.stringify({ valid: diagnostics.length === 0, configPath: session.configPath, diagnostics }, null, 2));
    } else if (diagnostics.length === 0) {
      console.log(`\u2713 ${session.loadedAs} is valid`);
    } else {
      printDiagnostics("Validate", diagnostics, false);
    }
    return (0, core_1.exitCodeFor)(diagnostics);
  } catch (error) {
    fail(error.message, core_1.EXIT_ERROR);
  }
}
function runDoctorCommand(args) {
  try {
    const session = loadSession(args);
    const diagnostics = (0, core_1.runDoctor)({
      projectRoot: args.projectRoot,
      configPath: session.configPath,
      manifest: session.manifest,
      appConfig: (0, core_1.loadAppConfig)(args.projectRoot),
      plan: session.plan,
      nodeVersion: process.versions.node
    });
    printDiagnostics("Expo Workspace Doctor", diagnostics, args.json);
    return (0, core_1.exitCodeFor)(diagnostics);
  } catch (error) {
    fail(error.message, core_1.EXIT_ERROR);
  }
}
function runExplain(args) {
  const doc = (0, core_1.buildPlanDocument)(loadSession(args).plan);
  const ops = args.id ? doc.operations.filter((op) => op.id === args.id || op.label === args.id) : doc.operations;
  if (args.id && ops.length === 0) {
    fail(`No operation matching "${args.id}"`, core_1.EXIT_ERROR);
  }
  if (args.json) {
    console.log(JSON.stringify(ops, null, 2));
    return core_1.EXIT_OK;
  }
  for (const op of ops) {
    console.log(`${op.id}`);
    console.log(`  kind      ${op.kind}`);
    console.log(`  source    ${op.source}`);
    console.log(`  status    ${op.status}`);
    console.log(`  label     ${op.label}`);
    if (op.files?.length)
      console.log(`  files     ${op.files.join(", ")}`);
    if (op.risk)
      console.log(`  risk      ${op.risk}`);
    console.log("");
  }
  return core_1.EXIT_OK;
}
function runDiff(args) {
  const plan = loadSession(args).plan;
  const doc = (0, core_1.buildPlanDocument)(plan);
  const report = (0, migrate_1.inspectNativeProject)(args.projectRoot);
  const declaredTargets = new Set((0, core_1.declaredTargetNames)(doc.operations));
  const extras = report.targets.filter((name) => !declaredTargets.has(name) && !isStockTarget(name));
  const missing = [...declaredTargets].filter((name) => !report.targets.includes(name));
  const payload = {
    generated: report.present,
    declaredTargets: [...declaredTargets],
    nativeTargets: report.targets,
    missingFromNative: missing,
    extraOnNative: extras,
    schemes: report.schemes,
    swiftPackages: report.swiftPackages
  };
  if (args.json) {
    console.log(JSON.stringify(payload, null, 2));
  } else if (!report.present) {
    console.log("No generated ios/ or android/ project found. Run expo prebuild first.");
  } else {
    console.log("Declared vs generated native state");
    if (missing.length === 0 && extras.length === 0) {
      console.log("\u2713 targets match configuration");
    }
    for (const name of missing)
      console.log(`- missing native target ${name}`);
    for (const name of extras)
      console.log(`+ extra native target ${name}`);
  }
  return extras.length || missing.length ? core_1.EXIT_ERROR : core_1.EXIT_OK;
}
function isStockTarget(name) {
  return /(Tests|Watch|Pods)$/i.test(name);
}
function runMigrate(args) {
  const report = (0, migrate_1.inspectNativeProject)(args.projectRoot);
  if (args.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printMigration(report);
  }
  if (args.write) {
    const dest = (0, migrate_1.writeMigratedConfig)(args.projectRoot, report);
    console.log(`Wrote ${dest}`);
  }
  return core_1.EXIT_OK;
}
function printMigration(report) {
  console.log("Detected native customizations");
  if (!report.present) {
    console.log("\xB7 no ios/ or android/ directories \u2014 nothing to migrate");
    return;
  }
  console.log(`\u2713 ${report.targets.length} native targets`);
  console.log(`\u2713 ${report.swiftPackages.length} Swift packages`);
  console.log(`\u2713 ${report.schemes.length} schemes`);
  console.log(`\u2713 ${report.appGroups.length} App Groups`);
  console.log(`\u2713 ${report.permissions.length} Android permissions`);
  console.log(`\u2713 ${report.features.length} Android uses-feature entries`);
  console.log(`\u2713 ${report.dependencies.length} app Gradle dependencies`);
  for (const unknown of report.unknown) {
    console.log(`? ${unknown} (unmodeled \u2014 will emit a TODO)`);
  }
}
function help() {
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
  return core_1.EXIT_OK;
}
async function runCli(argv = process.argv) {
  const args = parseArgs(argv);
  try {
    switch (args.command) {
      case "plan":
        return runPlan(args);
      case "validate":
        return runValidate(args);
      case "doctor":
        return runDoctorCommand(args);
      case "explain":
        return runExplain(args);
      case "diff":
        return runDiff(args);
      case "migrate":
        return runMigrate(args);
      case "help":
      case "--help":
      case "-h":
        return help();
      default:
        fail(`Unknown command "${args.command}". Run expo-workspaces help.`);
    }
  } catch (error) {
    fail(error.stack ?? error.message, core_1.EXIT_TOOL_FAILURE);
  }
}
if (require.main === module) {
  void runCli().then((code) => process.exit(code));
}
