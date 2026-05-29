"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// packages/expo-workspaces/build/defineWorkspace.js
var require_defineWorkspace = __commonJS({
  "packages/expo-workspaces/build/defineWorkspace.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.defineWorkspace = defineWorkspace;
    function defineWorkspace(manifest) {
      return manifest;
    }
  }
});

// packages/@expo-workspaces/core/build/loadManifest.js
var require_loadManifest = __commonJS({
  "packages/@expo-workspaces/core/build/loadManifest.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_MANIFEST_FILENAME = void 0;
    exports2.resolveManifestPath = resolveManifestPath;
    exports2.loadManifest = loadManifest;
    var fs_1 = __importDefault(require("fs"));
    var path_1 = __importDefault(require("path"));
    var ERR = "[expo-workspaces]";
    exports2.DEFAULT_MANIFEST_FILENAME = "workspace.manifest.js";
    function resolveManifestPath(projectRoot, manifestPath) {
      return path_1.default.resolve(projectRoot, manifestPath ?? exports2.DEFAULT_MANIFEST_FILENAME);
    }
    function loadManifest(projectRoot, manifestPath) {
      const resolved = resolveManifestPath(projectRoot, manifestPath);
      if (!fs_1.default.existsSync(resolved)) {
        throw new Error(`${ERR} Manifest not found at ${resolved}. Create "${exports2.DEFAULT_MANIFEST_FILENAME}" at the app root, or set the "manifestPath" plugin option.`);
      }
      let mod;
      try {
        delete require.cache[require.resolve(resolved)];
        mod = require(resolved);
      } catch (error) {
        throw new Error(`${ERR} Failed to require manifest ${resolved}: ${error.message}`);
      }
      const manifest = mod?.default ?? mod;
      if (!manifest || typeof manifest !== "object") {
        throw new Error(`${ERR} Manifest at ${resolved} must export an object (received ${typeof manifest}).`);
      }
      const raw = manifest;
      if (raw.manifestVersion !== 1) {
        throw new Error(`${ERR} Unsupported "manifestVersion": ${String(raw.manifestVersion)}. Expected 1.`);
      }
      return raw;
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
    exports2.reportWarning = reportWarning;
    var PREFIX = "[expo-workspace]";
    function reportChange(label, file) {
      console.log(`${PREFIX} ${label} \u2192 ${file}`);
    }
    function reportSkip(label, file) {
      console.log(`${PREFIX} ${label} (unchanged) \u2192 ${file}`);
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
    var loadManifest_1 = require_loadManifest();
    var report_1 = require_report();
    function createWorkspace({ generators, executors }) {
      return (config, props = {}) => {
        const projectRoot = config._internal?.projectRoot ?? process.cwd();
        const manifest = (0, loadManifest_1.loadManifest)(projectRoot, props.manifestPath);
        const ctx = {
          manifest,
          config,
          projectRoot
        };
        for (const generator of generators) {
          if (generator.contributeConfig) {
            ctx.config = generator.contributeConfig(ctx.config, ctx);
          }
        }
        config = ctx.config;
        const ops = [];
        for (const generator of generators) {
          const result = generator.generate(ctx);
          ops.push(...result.ops);
          for (const warning of result.warnings ?? []) {
            (0, report_1.reportWarning)(`${generator.name}: ${warning}`);
          }
        }
        for (const executor of executors) {
          config = executor(config, ops);
        }
        return config;
      };
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
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fileExecutor = void 0;
    var fs_1 = __importDefault(require("fs"));
    var path_1 = __importDefault(require("path"));
    var config_plugins_12 = require("@expo/config-plugins");
    var generateCode_1 = require("@expo/config-plugins/build/utils/generateCode");
    var report_1 = require_report();
    var types_1 = require_types();
    var ERR = "[expo-workspaces]";
    function applyFileOps(platform, ops) {
      return (config) => (0, config_plugins_12.withDangerousMod)(config, [
        platform,
        async (config2) => {
          const { platformProjectRoot, projectRoot } = config2.modRequest;
          const baseDir = (base) => base === "project" ? projectRoot : platformProjectRoot;
          for (const op of ops) {
            if (op.kind === "writeFile") {
              const filePath = path_1.default.resolve(baseDir(op.base), op.path);
              if (op.overwrite === "ifAbsent" && fs_1.default.existsSync(filePath)) {
                (0, report_1.reportSkip)(op.label, filePath);
                continue;
              }
              if (fs_1.default.existsSync(filePath) && fs_1.default.readFileSync(filePath, "utf8") === op.contents) {
                (0, report_1.reportSkip)(op.label, filePath);
                continue;
              }
              fs_1.default.mkdirSync(path_1.default.dirname(filePath), { recursive: true });
              fs_1.default.writeFileSync(filePath, op.contents, "utf8");
              (0, report_1.reportChange)(op.label, filePath);
              continue;
            }
            if (op.kind === "mergeBlock") {
              const filePath = path_1.default.resolve(baseDir(op.base), op.path);
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
              const filePath = path_1.default.resolve(baseDir(op.base), op.path);
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
            const dirPath = path_1.default.resolve(baseDir(op.base), op.dir);
            if (!fs_1.default.existsSync(dirPath)) {
              continue;
            }
            for (const entry of fs_1.default.readdirSync(dirPath)) {
              if (op.match(entry)) {
                fs_1.default.unlinkSync(path_1.default.join(dirPath, entry));
                (0, report_1.reportChange)(op.label, path_1.default.join(dirPath, entry));
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

// packages/@expo-workspaces/core/build/index.js
var require_build = __commonJS({
  "packages/@expo-workspaces/core/build/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.isFileOp = exports2.FILE_OP_KINDS = exports2.rubyLiteral = exports2.nameMatcherToRuby = exports2.assertNameMatcher = exports2.assertBuildConfiguration = exports2.ERR = exports2.reportWarning = exports2.reportSkip = exports2.reportChange = exports2.fileExecutor = exports2.DEFAULT_MANIFEST_FILENAME = exports2.resolveManifestPath = exports2.loadManifest = exports2.createWorkspace = void 0;
    var createWorkspace_1 = require_createWorkspace();
    Object.defineProperty(exports2, "createWorkspace", { enumerable: true, get: function() {
      return createWorkspace_1.createWorkspace;
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
    var types_1 = require_types();
    Object.defineProperty(exports2, "FILE_OP_KINDS", { enumerable: true, get: function() {
      return types_1.FILE_OP_KINDS;
    } });
    Object.defineProperty(exports2, "isFileOp", { enumerable: true, get: function() {
      return types_1.isFileOp;
    } });
  }
});

// packages/@expo-workspaces/android/build/generators/android.js
var require_android = __commonJS({
  "packages/@expo-workspaces/android/build/generators/android.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.androidGenerator = void 0;
    var core_1 = require_build();
    var SIGNING_KEYS = {
      storeFile: "EXPO_WORKSPACE_RELEASE_STORE_FILE",
      storePassword: "EXPO_WORKSPACE_RELEASE_STORE_PASSWORD",
      keyAlias: "EXPO_WORKSPACE_RELEASE_KEY_ALIAS",
      keyPassword: "EXPO_WORKSPACE_RELEASE_KEY_PASSWORD"
    };
    function gradleProperty(key, value) {
      return { kind: "androidGradleProperty", key, value: String(value), label: `android:gradleProperty:${key}` };
    }
    function sdkProperty(slice, key, gradleKey, ops) {
      const value = slice[key];
      if (value !== void 0) {
        ops.push(gradleProperty(gradleKey, value));
      }
    }
    exports2.androidGenerator = {
      name: "android",
      generate({ manifest }) {
        const slice = manifest.android;
        if (!slice || typeof slice !== "object") {
          return { ops: [] };
        }
        const ops = [];
        sdkProperty(slice, "minSdkVersion", "android.minSdkVersion", ops);
        sdkProperty(slice, "compileSdkVersion", "android.compileSdkVersion", ops);
        sdkProperty(slice, "targetSdkVersion", "android.targetSdkVersion", ops);
        sdkProperty(slice, "buildToolsVersion", "android.buildToolsVersion", ops);
        sdkProperty(slice, "ndkVersion", "android.ndkVersion", ops);
        sdkProperty(slice, "kotlinVersion", "android.kotlinVersion", ops);
        if (slice.gradleProperties) {
          for (const [key, value] of Object.entries(slice.gradleProperties)) {
            ops.push(gradleProperty(key, value));
          }
        }
        for (const permission of slice.permissions ?? []) {
          if (typeof permission !== "string" || !permission.trim()) {
            throw new Error(`${core_1.ERR} android.permissions entries must be non-empty strings.`);
          }
          ops.push({ kind: "androidManifestPermission", permission: permission.trim(), label: `android:permission:${permission}` });
        }
        if (slice.applicationAttributes) {
          for (const [name, value] of Object.entries(slice.applicationAttributes)) {
            ops.push({
              kind: "androidManifestAppAttribute",
              name,
              value: String(value),
              label: `android:appAttribute:${name}`
            });
          }
        }
        if (slice.dependencies?.length) {
          const body = slice.dependencies.map((line) => `    ${line}`).join("\n");
          ops.push({
            kind: "androidGradleBlock",
            file: "app",
            tag: "expo-workspace-android-dependencies",
            anchor: "dependencies\\s*\\{",
            offset: 1,
            comment: "//",
            contents: body,
            label: "android:dependencies"
          });
        }
        if (slice.signing) {
          const s = slice.signing;
          if (!s.storeFile?.trim() || !s.keyAlias?.trim()) {
            throw new Error(`${core_1.ERR} android.signing requires "storeFile" and "keyAlias".`);
          }
          ops.push(gradleProperty(SIGNING_KEYS.storeFile, s.storeFile));
          ops.push(gradleProperty(SIGNING_KEYS.storePassword, s.storePassword ?? ""));
          ops.push(gradleProperty(SIGNING_KEYS.keyAlias, s.keyAlias));
          ops.push(gradleProperty(SIGNING_KEYS.keyPassword, s.keyPassword ?? ""));
          const releaseBlock = [
            "        release {",
            `            storeFile file(${SIGNING_KEYS.storeFile})`,
            `            storePassword ${SIGNING_KEYS.storePassword}`,
            `            keyAlias ${SIGNING_KEYS.keyAlias}`,
            `            keyPassword ${SIGNING_KEYS.keyPassword}`,
            "        }"
          ].join("\n");
          ops.push({
            kind: "androidGradleBlock",
            file: "app",
            tag: "expo-workspace-android-signing",
            anchor: "signingConfigs\\s*\\{",
            offset: 1,
            comment: "//",
            contents: releaseBlock,
            label: "android:signingConfig"
          });
          ops.push({
            kind: "androidGradleReplace",
            file: "app",
            find: "signingConfig signingConfigs\\.debug",
            replacement: "signingConfig signingConfigs.release",
            all: false,
            label: "android:signingConfig:release"
          });
        }
        return { ops };
      }
    };
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
      "androidManifestAppAttribute"
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
    var config_plugins_12 = require("@expo/config-plugins");
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
        const wrap = file === "app" ? config_plugins_12.withAppBuildGradle : config_plugins_12.withProjectBuildGradle;
        return wrap(config, (cfg) => {
          cfg.modResults.contents = applyGradleText(cfg.modResults.contents, blocks, replaces);
          return cfg;
        });
      };
    }
    function applyManifest(manifest, permissions, attributes) {
      for (const op of permissions) {
        config_plugins_12.AndroidConfig.Permissions.ensurePermission(manifest, op.permission);
      }
      if (attributes.length > 0) {
        const application = config_plugins_12.AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);
        application.$ = application.$ ?? {};
        for (const op of attributes) {
          application.$[op.name] = op.value;
        }
      }
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
      if (properties.length > 0) {
        config = (0, config_plugins_12.withGradleProperties)(config, (cfg) => {
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
      if (permissions.length > 0 || attributes.length > 0) {
        config = (0, config_plugins_12.withAndroidManifest)(config, (cfg) => {
          applyManifest(cfg.modResults, permissions, attributes);
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
    exports2.isAndroidOp = exports2.androidExecutor = exports2.androidGenerator = void 0;
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
    var core_1 = require_build();
    function normalizeLocalPods(pods) {
      if (!Array.isArray(pods) || pods.length === 0) {
        return [];
      }
      return pods.map((entry, index) => {
        if (!entry?.pod?.trim() || !entry?.path?.trim()) {
          throw new Error(`${core_1.ERR} localPods[${index}] requires "pod" and "path" (relative to ios/).`);
        }
        const podPath = entry.path.trim();
        if (podPath.startsWith("/") || /^[A-Za-z]:/.test(podPath)) {
          throw new Error(`${core_1.ERR} localPods[${index}].path must be relative to ios/, not absolute: "${podPath}"`);
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
          throw new Error(`${core_1.ERR} remotePods[${index}] requires "pod".`);
        }
        if (entry.configurations && !Array.isArray(entry.configurations)) {
          throw new Error(`${core_1.ERR} remotePods[${index}].configurations must be an array.`);
        }
        return { ...entry, pod: entry.pod.trim() };
      });
    }
    function normalizePodBuildSettingsRules(rules) {
      if (!Array.isArray(rules) || rules.length === 0) {
        return [];
      }
      return rules.map((rule, index) => {
        (0, core_1.assertNameMatcher)(rule?.target, `podBuildSettings[${index}].target`);
        const settings = rule?.settings ?? {};
        const entries = Object.entries(settings);
        if (entries.length === 0) {
          throw new Error(`${core_1.ERR} podBuildSettings[${index}] requires non-empty "settings".`);
        }
        for (const [key, value] of entries) {
          if (!key.trim()) {
            throw new Error(`${core_1.ERR} podBuildSettings[${index}] has an empty build setting key.`);
          }
          if (typeof value !== "string") {
            throw new Error(`${core_1.ERR} podBuildSettings[${index}].settings["${key}"] must be a string value.`);
          }
        }
        const configurations = rule.configurations?.map((configuration, configIndex) => {
          (0, core_1.assertBuildConfiguration)(configuration, `podBuildSettings[${index}].configurations[${configIndex}]`);
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
        (0, core_1.assertNameMatcher)(rule?.target, `removePodBuildPhases[${index}].target`);
        if (!rule.phase?.trim()) {
          throw new Error(`${core_1.ERR} removePodBuildPhases[${index}] requires a non-empty "phase".`);
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
    var core_1 = require_build();
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
      const parts = [`pod ${(0, core_1.rubyLiteral)(p.pod)}`];
      if (p.version) {
        parts.push((0, core_1.rubyLiteral)(p.version));
      }
      if (p.git) {
        parts.push(`:git => ${(0, core_1.rubyLiteral)(p.git)}`);
      }
      if (p.branch) {
        parts.push(`:branch => ${(0, core_1.rubyLiteral)(p.branch)}`);
      }
      if (p.tag) {
        parts.push(`:tag => ${(0, core_1.rubyLiteral)(p.tag)}`);
      }
      if (p.commit) {
        parts.push(`:commit => ${(0, core_1.rubyLiteral)(p.commit)}`);
      }
      if (p.configurations?.length) {
        parts.push(`:configurations => [${p.configurations.map((c) => (0, core_1.rubyLiteral)(c)).join(", ")}]`);
      }
      if (p.modularHeaders != null) {
        parts.push(`:modular_headers => ${p.modularHeaders}`);
      }
      return `  ${parts.join(", ")}`;
    }
    function podBuildSettingsLines(rules) {
      const targetCondition = rules.map((rule) => `(${(0, core_1.nameMatcherToRuby)(rule.target)})`).join(" || ");
      const lines = [
        "  installer.pods_project.targets.each do |target|",
        `    next unless ${targetCondition}`,
        "    target.build_configurations.each do |config|"
      ];
      for (const rule of rules) {
        lines.push(`      if ${(0, core_1.nameMatcherToRuby)(rule.target)}`);
        if (rule.configurations?.length) {
          const names = rule.configurations.map((value) => (0, core_1.rubyLiteral)(value)).join(", ");
          lines.push(`        next unless [${names}].include?(config.name)`);
        }
        for (const [key, value] of Object.entries(rule.settings)) {
          lines.push(`        config.build_settings[${(0, core_1.rubyLiteral)(key)}] = ${(0, core_1.rubyLiteral)(value)}`);
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
        `    next unless ${(0, core_1.nameMatcherToRuby)(rule.target)}`,
        "    target.build_phases.delete_if do |phase|",
        `      phase.respond_to?(:name) && phase.name == ${(0, core_1.rubyLiteral)(rule.phase)}`,
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
          ops.push(mergeBlock(LOCAL_PODS_TAG, localPodLines(localPods), USE_EXPO_MODULES, "localPods"));
        }
        if (remotePods.length > 0) {
          ops.push(mergeBlock(REMOTE_PODS_TAG, remotePods.map(remotePodLine).join("\n"), USE_EXPO_MODULES, "remotePods"));
        }
        if (podBuildSettings.length > 0) {
          ops.push(mergeBlock(POD_BUILD_SETTINGS_TAG, podBuildSettingsLines(podBuildSettings), POST_INSTALL, "podBuildSettings"));
        }
        if (removePodBuildPhases.length > 0) {
          ops.push(mergeBlock(POD_REMOVE_BUILD_PHASES_TAG, podRemoveBuildPhasesLines(removePodBuildPhases), POST_INSTALL, "removePodBuildPhases"));
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
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.openXcodeProject = openXcodeProject;
    exports2.serializeXcodeProject = serializeXcodeProject;
    var fs_1 = __importDefault(require("fs"));
    var path_1 = __importDefault(require("path"));
    var config_plugins_12 = require("@expo/config-plugins");
    var xcode_1 = require("@bacons/xcode");
    var { build: buildPbxproj } = require("@bacons/xcode/json");
    function openXcodeProject(appProjectRoot) {
      const pbxprojPath = config_plugins_12.IOSConfig.Paths.getPBXProjectPath(appProjectRoot);
      if (!fs_1.default.existsSync(pbxprojPath)) {
        throw new Error(`[expo-workspaces] PBX project not found at ${pbxprojPath}. Run "expo prebuild" for iOS first.`);
      }
      const xcodeprojPath = config_plugins_12.IOSConfig.Paths.getXcodeProjectPath(appProjectRoot);
      const xcodeprojBasename = path_1.default.basename(xcodeprojPath);
      const schemesDirectory = path_1.default.join(xcodeprojPath, "xcshareddata", "xcschemes");
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
    function pbxOp(label, apply) {
      return { kind: "pbx", label, apply };
    }
  }
});

// packages/@expo-workspaces/ios-xcode/build/pbxExecutor.js
var require_pbxExecutor = __commonJS({
  "packages/@expo-workspaces/ios-xcode/build/pbxExecutor.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.pbxExecutor = void 0;
    var fs_1 = __importDefault(require("fs"));
    var config_plugins_12 = require("@expo/config-plugins");
    var core_1 = require_build();
    var openProject_1 = require_openProject();
    var pbxOp_1 = require_pbxOp();
    var pbxExecutor = (config, ops) => {
      const pbxOps = ops.filter(pbxOp_1.isPbxOp);
      if (pbxOps.length === 0) {
        return config;
      }
      return (0, config_plugins_12.withMod)(config, {
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
            (0, core_1.reportChange)("pbxproj", pbxprojPath);
          } else {
            (0, core_1.reportSkip)("pbxproj", pbxprojPath);
          }
          return config2;
        }
      });
    };
    exports2.pbxExecutor = pbxExecutor;
  }
});

// packages/@expo-workspaces/ios-xcode/build/validate.js
var require_validate2 = __commonJS({
  "packages/@expo-workspaces/ios-xcode/build/validate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.normalizeSchemeDefinitions = normalizeSchemeDefinitions;
    var core_1 = require_build();
    var INVALID_SCHEME_CHARS = /[\\/:*?"<>|]/;
    function normalizeSchemeDefinitions(schemes) {
      if (!Array.isArray(schemes) || schemes.length === 0) {
        return [];
      }
      const seen = /* @__PURE__ */ new Set();
      return schemes.map((scheme, index) => {
        if (!scheme?.name?.trim() || !scheme.configuration) {
          throw new Error(`${core_1.ERR} schemes[${index}] requires "name" and "configuration" ("Debug" | "Release").`);
        }
        const name = scheme.name.trim();
        if (INVALID_SCHEME_CHARS.test(name)) {
          throw new Error(`${core_1.ERR} schemes[${index}].name contains invalid path characters: "${name}"`);
        }
        if (seen.has(name)) {
          throw new Error(`${core_1.ERR} Duplicate scheme name "${name}" in schemes configuration.`);
        }
        seen.add(name);
        (0, core_1.assertBuildConfiguration)(scheme.configuration, `schemes[${index}].configuration`);
        if (scheme.archive) {
          (0, core_1.assertBuildConfiguration)(scheme.archive, `schemes[${index}].archive`);
        }
        if (scheme.analyze) {
          (0, core_1.assertBuildConfiguration)(scheme.analyze, `schemes[${index}].analyze`);
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
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.schemesGenerator = void 0;
    var fs_1 = __importDefault(require("fs"));
    var path_1 = __importDefault(require("path"));
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
              const container = `container:${path_1.default.basename(path_1.default.dirname(project.filePath))}`;
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
        return { ops: [op] };
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
    exports2.fixEmbedCycleGenerator = exports2.xcodeEnvGenerator = exports2.schemesGenerator = exports2.normalizeSchemeDefinitions = exports2.serializeXcodeProject = exports2.openXcodeProject = exports2.isPbxOp = exports2.pbxOp = exports2.pbxExecutor = void 0;
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
    exports2.normalizeRemotePackages = normalizeRemotePackages;
    exports2.normalizeLocalPackages = normalizeLocalPackages;
    var core_1 = require_build();
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
        throw new Error(`${core_1.ERR} ${label}.requirement.kind must be one of ${[...REQUIREMENT_KINDS].join(", ")}.`);
      }
    }
    function assertProducts(products, label) {
      if (!Array.isArray(products) || products.length === 0 || products.some((p) => typeof p !== "string" || !p.trim())) {
        throw new Error(`${core_1.ERR} ${label}.products must be a non-empty array of product names.`);
      }
    }
    function normalizeRemotePackages(packages) {
      if (!Array.isArray(packages) || packages.length === 0) {
        return [];
      }
      return packages.map((pkg, index) => {
        if (!pkg?.url?.trim()) {
          throw new Error(`${core_1.ERR} swiftPackages.remote[${index}] requires a "url".`);
        }
        assertRequirement(pkg.requirement, `swiftPackages.remote[${index}]`);
        assertProducts(pkg.products, `swiftPackages.remote[${index}]`);
        return { ...pkg, url: pkg.url.trim() };
      });
    }
    function normalizeLocalPackages(packages) {
      if (!Array.isArray(packages) || packages.length === 0) {
        return [];
      }
      return packages.map((pkg, index) => {
        if (!pkg?.path?.trim()) {
          throw new Error(`${core_1.ERR} swiftPackages.local[${index}] requires a "path".`);
        }
        assertProducts(pkg.products, `swiftPackages.local[${index}]`);
        return { ...pkg, path: pkg.path.trim() };
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
    function linkProducts(project, pkgRef, products, targetName) {
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
    exports2.spmGenerator = {
      name: "swiftPackages",
      generate({ manifest }) {
        const slice = manifest.swiftPackages;
        if (!slice) {
          return { ops: [] };
        }
        const remote = (0, validate_1.normalizeRemotePackages)(slice.remote);
        const local = (0, validate_1.normalizeLocalPackages)(slice.local);
        if (remote.length === 0 && local.length === 0) {
          return { ops: [] };
        }
        return {
          ops: [
            (0, ios_xcode_1.pbxOp)("swiftPackages", ({ project }) => {
              for (const pkg of remote) {
                const ref = xcode_1.XCRemoteSwiftPackageReference.create(project, {
                  repositoryURL: pkg.url,
                  requirement: pkg.requirement
                });
                addPackageReference(project, ref);
                linkProducts(project, ref, pkg.products, pkg.target);
              }
              for (const pkg of local) {
                const ref = xcode_1.XCLocalSwiftPackageReference.create(project, {
                  relativePath: pkg.path
                });
                addPackageReference(project, ref);
                linkProducts(project, ref, pkg.products, pkg.target);
              }
            })
          ]
        };
      }
    };
  }
});

// packages/@expo-workspaces/ios-spm/build/index.js
var require_build5 = __commonJS({
  "packages/@expo-workspaces/ios-spm/build/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.normalizeLocalPackages = exports2.normalizeRemotePackages = exports2.spmGenerator = void 0;
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
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.resolveEntitlements = resolveEntitlements;
    exports2.buildEntitlements = buildEntitlements;
    var plist_1 = __importDefault(require("@expo/plist"));
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
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.applyTargetsPbx = applyTargetsPbx;
    var path_1 = __importDefault(require("path"));
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
        const protectedGroup = ensureProtectedGroup(project, path_1.default.posix.dirname(plan.cwd));
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
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getTargetInfoPlist = getTargetInfoPlist;
    exports2.buildInfoPlist = buildInfoPlist;
    var plist_1 = __importDefault(require("@expo/plist"));
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
    var core_1 = require_build();
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
          throw new Error(`${core_1.ERR} targets[${index}] requires a non-empty "name".`);
        }
        const name = target.name.trim();
        if (INVALID_PATH_SEGMENT.test(name)) {
          throw new Error(`${core_1.ERR} targets[${index}].name contains invalid path characters: "${name}"`);
        }
        if (seen.has(name)) {
          throw new Error(`${core_1.ERR} Duplicate target name "${name}" in targets configuration.`);
        }
        seen.add(name);
        if (!target.type || !TARGET_TYPES.has(target.type)) {
          throw new Error(`${core_1.ERR} targets[${index}].type must be one of ${[...TARGET_TYPES].join(", ")} (received "${target.type}").`);
        }
        if (target.bundleIdentifier !== void 0 && !target.bundleIdentifier.trim()) {
          throw new Error(`${core_1.ERR} targets[${index}].bundleIdentifier cannot be empty when provided.`);
        }
        if (target.source !== void 0) {
          const source = target.source.trim();
          if (!source) {
            throw new Error(`${core_1.ERR} targets[${index}].source cannot be empty when provided.`);
          }
          if (isAbsolute(source)) {
            throw new Error(`${core_1.ERR} targets[${index}].source must be relative to the app root: "${source}"`);
          }
        }
        if (target.entitlements !== void 0 && typeof target.entitlements !== "object") {
          throw new Error(`${core_1.ERR} targets[${index}].entitlements must be an object.`);
        }
        if (target.buildSettings !== void 0) {
          if (typeof target.buildSettings !== "object") {
            throw new Error(`${core_1.ERR} targets[${index}].buildSettings must be an object.`);
          }
          for (const [key, value] of Object.entries(target.buildSettings)) {
            if (typeof value !== "string") {
              throw new Error(`${core_1.ERR} targets[${index}].buildSettings["${key}"] must be a string.`);
            }
          }
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
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.targetsGenerator = void 0;
    var fs_1 = __importDefault(require("fs"));
    var path_1 = __importDefault(require("path"));
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
        const sourceAbs = path_1.default.join(projectRoot, sourceRel);
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
        for (const { spec, sourceRel, plan, entitlementsJson } of resolved) {
          const infoPlistOp = {
            kind: "writeFile",
            base: "project",
            path: `${sourceRel}/Info.plist`,
            contents: (0, infoPlist_1.buildInfoPlist)(spec.type),
            overwrite: "ifAbsent",
            label: `target:${spec.name}:Info.plist`
          };
          ops.push(infoPlistOp);
          if (entitlementsJson && plan.entitlementsFileName) {
            const entitlementsOp = {
              kind: "writeFile",
              base: "project",
              path: `${sourceRel}/${plan.entitlementsFileName}`,
              contents: (0, entitlements_1.buildEntitlements)(entitlementsJson),
              overwrite: "always",
              label: `target:${spec.name}:entitlements`
            };
            ops.push(entitlementsOp);
          }
        }
        const loaderOp = {
          kind: "appendOnce",
          base: "ios",
          path: "Podfile",
          marker: podsLoader_1.TARGETS_LOADER_MARKER,
          contents: (0, podsLoader_1.buildTargetsPodfileLoader)(targetsRootClean),
          label: "targetsPodfileLoader"
        };
        ops.push(loaderOp);
        const plans = resolved.map((r) => r.plan);
        const teamId = config.ios?.appleTeamId;
        const marketingVersion = config.ios?.version || config.version || "1.0.0";
        ops.push((0, ios_xcode_1.pbxOp)("targets", ({ project }) => {
          (0, generateTarget_1.applyTargetsPbx)(project, plans, { teamId, marketingVersion });
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
    var core_1 = require_build();
    function buildOpsForPatch(patch, index) {
      if (!patch?.file?.trim()) {
        throw new Error(`${core_1.ERR} patches[${index}] requires a "file".`);
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
        throw new Error(`${core_1.ERR} patches[${index}] requires one of "block" | "insertAfter" | "insertBefore" | "replace".`);
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
          ops.push(...buildOpsForPatch(patch, index));
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
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.patchExecutor = void 0;
    var fs_1 = __importDefault(require("fs"));
    var path_1 = __importDefault(require("path"));
    var config_plugins_12 = require("@expo/config-plugins");
    var core_1 = require_build();
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
      return (config) => (0, config_plugins_12.withDangerousMod)(config, [
        platform,
        async (config2) => {
          const { platformProjectRoot, projectRoot } = config2.modRequest;
          const baseDir = (base) => base === "project" ? projectRoot : platformProjectRoot;
          for (const op of ops) {
            const filePath = path_1.default.resolve(baseDir(op.base), op.path);
            if (!fs_1.default.existsSync(filePath)) {
              throw new Error(`${ERR} ${op.label}: file not found at ${filePath}.`);
            }
            const original = fs_1.default.readFileSync(filePath, "utf8");
            const { next, changed } = applyAction(original, op);
            if (changed) {
              fs_1.default.writeFileSync(filePath, next, "utf8");
              (0, core_1.reportChange)(op.label, filePath);
            } else {
              (0, core_1.reportSkip)(op.label, filePath);
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

// packages/expo-workspaces/build/withWorkspace.js
var require_withWorkspace = __commonJS({
  "packages/expo-workspaces/build/withWorkspace.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.withWorkspace = void 0;
    var core_1 = require_build();
    var android_1 = require_build2();
    var ios_pods_1 = require_build3();
    var ios_spm_1 = require_build5();
    var ios_targets_1 = require_build6();
    var ios_xcode_1 = require_build4();
    var patch_1 = require_build7();
    exports2.withWorkspace = (0, core_1.createWorkspace)({
      generators: [
        ios_pods_1.podsGenerator,
        ios_targets_1.targetsGenerator,
        ios_spm_1.spmGenerator,
        ios_xcode_1.xcodeEnvGenerator,
        ios_xcode_1.schemesGenerator,
        ios_xcode_1.fixEmbedCycleGenerator,
        patch_1.patchGenerator,
        android_1.androidGenerator
      ],
      executors: [core_1.fileExecutor, patch_1.patchExecutor, android_1.androidExecutor, ios_xcode_1.pbxExecutor]
    });
  }
});

// packages/expo-workspaces/build/index.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineWorkspace = exports.withWorkspace = void 0;
var config_plugins_1 = require("@expo/config-plugins");
var defineWorkspace_1 = require_defineWorkspace();
Object.defineProperty(exports, "defineWorkspace", { enumerable: true, get: function() {
  return defineWorkspace_1.defineWorkspace;
} });
var withWorkspace_1 = require_withWorkspace();
Object.defineProperty(exports, "withWorkspace", { enumerable: true, get: function() {
  return withWorkspace_1.withWorkspace;
} });
var plugin = (0, config_plugins_1.createRunOncePlugin)(withWorkspace_1.withWorkspace, "expo-workspaces", "1.0.0");
exports.default = plugin;
