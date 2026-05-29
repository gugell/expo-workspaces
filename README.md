<div align="center">

# ⚙️ expo-workspaces

### Declarative, manifest-first native workspace generation for Expo CNG

**Tuist-style rigor for your `ios/` and `android/` — one typed manifest, zero hand-edited Xcode or Gradle.**

```
 manifest  ─▶  generators  ─▶  plan (ops)  ─▶  executors  ─▶  ios/ + android/
  (what)        (the how)      (declarative)    (the when)       (generated)
```

</div>

---

## What is this?

`expo-workspaces` replaces the pile of ad-hoc Expo config plugins that each imperatively patch one native thing (a Podfile here, an Xcode scheme there, a target via a third-party generator) with **a single declarative manifest** and a composable engine that turns it into deterministic native output during `expo prebuild`.

You describe *what* you want — local & remote pods, Xcode schemes, first‑party share/widget/clip **targets**, Swift Package Manager deps, source patches, Android signing/SDK/gradle config — in one `workspace.manifest.js`. The engine plans it as a set of declarative **ops** and applies them at the right prebuild phase. Native output stays disposable and reproducible from source of truth.

> Generated `ios/`/`android/` are disposable (CNG). The manifest is the source of truth.

## Why

- **Manifest-first** — config lives in one typed file, not scattered across plugin options and `expo-target.config.js` files.
- **Composable** — every capability is an independent package exposing a *generator*. Use the meta package for everything, or compose your own set.
- **First‑party iOS targets** — share/widget/clip extensions are synthesized in‑house (no `@bacons/apple-targets` dependency), while reusing the battle‑tested `@bacons/xcode` parser under the hood.
- **Deterministic & idempotent** — generators emit a declarative plan; executors write only tagged blocks / known files; running prebuild twice yields no diff.
- **Cross‑platform** — the same op model drives iOS (Podfile, pbxproj, schemes, `.xcode.env`) and Android (gradle, gradle.properties, manifest).

## Packages

| Package | Responsibility |
| --- | --- |
| [`expo-workspaces`](packages/expo-workspaces) | **Meta** — the config plugin you add to `app.json`. Composes every generator + executor. |
| [`@expo-workspaces/core`](packages/@expo-workspaces/core) | Engine: op model, generator/executor registry, manifest loader, file executor. |
| [`@expo-workspaces/ios-xcode`](packages/@expo-workspaces/ios-xcode) | pbx executor, Xcode schemes, `.xcode.env`, extension embed‑cycle fix. |
| [`@expo-workspaces/ios-pods`](packages/@expo-workspaces/ios-pods) | Local & remote CocoaPods, pod build settings, build‑phase removal. |
| [`@expo-workspaces/ios-targets`](packages/@expo-workspaces/ios-targets) | First‑party native target generation (share / widget / clip). |
| [`@expo-workspaces/ios-spm`](packages/@expo-workspaces/ios-spm) | Swift Package Manager deps (remote + local) and product links. |
| [`@expo-workspaces/patch`](packages/@expo-workspaces/patch) | Declarative source/config file patching. |
| [`@expo-workspaces/android`](packages/@expo-workspaces/android) | Gradle / manifest: signing, SDK versions, deps, gradle.properties, permissions. |

## Quick start

**1. Install** — the repo root ships a self-contained bundle, so install it straight from git:

```sh
pnpm add github:gugell/expo-workspaces        # public repo
# private repo (uses your SSH key):
pnpm add "expo-workspaces@git+ssh://git@github.com/gugell/expo-workspaces.git"
# pin a tag/commit: …/expo-workspaces.git#v1.0.0
```

```jsonc
// apps/<app>/package.json — resulting entry
{ "dependencies": { "expo-workspaces": "git+ssh://git@github.com/gugell/expo-workspaces.git" } }
```

> Working on the plugin itself? See [Development](#development-monorepo) for a local link.

**2. Enable the plugin** in `app.json` (register it **last** so its finalized mods run after other native plugins):

```jsonc
{
  "expo": {
    "plugins": [
      /* ...other plugins... */
      "expo-workspaces"
      // or: ["expo-workspaces", { "manifestPath": "config/workspace.manifest.js" }]
    ]
  }
}
```

**3. Author** `workspace.manifest.js` at the app root:

```js
/** @type {import('expo-workspaces/types').WorkspaceManifest} */
module.exports = {
  manifestVersion: 1,

  localPods: [
    { pod: 'MyNativeIOS/React', path: '../../../packages/my-native' },
  ],

  schemes: [
    { name: 'MyApp Debug', configuration: 'Debug' },
    { name: 'MyApp Release', configuration: 'Release' },
  ],

  targets: [
    {
      name: 'ShareExtension',
      type: 'share',
      bundleIdentifier: '.ShareExtension',
      deploymentTarget: '16.4',
      entitlements: {
        'com.apple.security.application-groups': ['group.com.example.app'],
      },
    },
  ],
};
```

**4. Generate**:

```sh
expo prebuild
```

You'll see the plan applied:

```
[expo-workspace] localPods → ios/Podfile
[expo-workspace] target:ShareExtension:Info.plist (unchanged) → targets/ShareExtension/Info.plist
[expo-workspace] targetsPodfileLoader → ios/Podfile
[expo-workspace] pbxproj → ios/MyApp.xcodeproj/project.pbxproj
```

## The manifest at a glance

Every field is optional except `manifestVersion`. Each section is owned by one capability package.

```js
/** @type {import('expo-workspaces/types').WorkspaceManifest} */
module.exports = {
  manifestVersion: 1,

  // ─── iOS · CocoaPods ─────────────────────────────────────────────
  localPods: [{ pod: 'MyNativeIOS/React', path: '../../../packages/my-native' }],
  remotePods: [{ pod: 'Alamofire', version: '~> 5.9' }],
  podBuildSettings: [
    { target: { startsWith: 'MyNativeIOS' }, settings: { ENABLE_APP_INTENTS_METADATA_GENERATION: 'NO' } },
  ],
  removePodBuildPhases: [{ target: { regex: '.*' }, phase: 'My Phase' }],

  // ─── iOS · Xcode ─────────────────────────────────────────────────
  schemes: [
    { name: 'MyApp Debug', configuration: 'Debug' },
    { name: 'MyApp Release', configuration: 'Release' },
  ],
  replaceExpoScheme: false,
  xcodeEnv: { exports: { MY_FLAG: 'true' } },
  fixExtensionEmbedCycle: true, // default

  // ─── iOS · Native targets (share / widget / clip) ────────────────
  targetsRoot: './targets', // default
  targets: [
    {
      name: 'ShareExtension',
      type: 'share',
      bundleIdentifier: '.ShareExtension',
      deploymentTarget: '16.4',
      entitlements: { 'com.apple.security.application-groups': ['group.com.example.app'] },
      buildSettings: { ENABLE_APP_INTENTS_METADATA_GENERATION: 'NO' },
    },
  ],

  // ─── iOS · Swift Package Manager ─────────────────────────────────
  swiftPackages: {
    remote: [
      {
        url: 'https://github.com/apple/swift-collections',
        requirement: { kind: 'upToNextMajorVersion', minimumVersion: '1.0.0' },
        products: ['Collections'],
      },
    ],
  },

  // ─── Source patching (any platform) ──────────────────────────────
  patches: [
    {
      file: 'MyApp/AppDelegate.swift',
      base: 'ios',
      insertAfter: { anchor: 'import Expo', text: 'import MyKit' },
    },
  ],

  // ─── Android ─────────────────────────────────────────────────────
  android: {
    minSdkVersion: 24,
    compileSdkVersion: 35,
    targetSdkVersion: 34,
    permissions: ['android.permission.RECORD_AUDIO'],
    dependencies: ["implementation 'androidx.work:work-runtime:2.9.0'"],
    signing: { storeFile: 'release.keystore', storePassword: '…', keyAlias: 'upload', keyPassword: '…' },
  },
};
```

📖 **Full field reference:** [`docs/manifest.md`](docs/manifest.md)

## Native targets & their sources

A target has two halves: **declarative config** in the manifest (`targets[]`) and **source files** on disk under `targets/<name>/`.

```
targets/ShareExtension/
├─ ShareViewController.swift   ← compiled into the target (auto-discovered)
├─ Info.plist                  ← auto-generated per type if absent; yours is preserved
├─ generated.entitlements      ← written from manifest `entitlements`
└─ pods.rb                     ← the target's CocoaPods deps
```

The generator attaches an Xcode **file‑system‑synchronized group** to the folder, so Xcode auto‑includes everything you drop in — no per‑file registration, no manual `project.pbxproj` edits. EAS managed code‑signing is wired automatically via `extra.eas.build.experimental.ios.appExtensions`.

📖 **Guide:** [`docs/ios-targets.md`](docs/ios-targets.md)

## Architecture

```
loadManifest → contributeConfig → generators.generate() → ops[] → executors
```

- **Generators** turn one manifest concern into a declarative plan of **ops** (`writeFile`, `mergeBlock`, `appendOnce`, `pbx`, `patch`, `androidGradleProperty`, …).
- **Executors** apply the ops at the correct Expo mod phase: file ops in a single `withDangerousMod`, pbx ops in one `finalized` pass over a shared `@bacons/xcode` project, Android ops via Expo's typed gradle/manifest mods.

Adding a capability is just shipping a new package that exports a `Generator` (and optionally an `Executor`).

📖 **Deep dive + extension guide:** [`docs/architecture.md`](docs/architecture.md)

## Development (monorepo)

Built with plain **TypeScript project references** — `tsc -b` builds the whole graph in dependency order, incrementally. The capabilities are then bundled into the repo root as a single self‑contained, git‑installable `expo-workspaces` package (esbuild).

```sh
pnpm install   # link the workspace
pnpm build     # tsc -b → bundle into ./build
pnpm watch     # tsc -b --watch (per-package, no bundle)
pnpm clean     # tsc -b --clean + remove ./build
```

Layout follows the Expo monorepo convention: the bundle source meta package lives at `packages/expo-workspaces` (`@expo-workspaces/meta`, private), capabilities at `packages/@expo-workspaces/*` (private). The **repo root** is the published/git‑installable `expo-workspaces` package — its committed `build/` is the bundled artifact consumers receive.

Schemes, targets, and all pbx edits are produced through the **`@bacons/xcode` object model** (`XCScheme`, `PBXNativeTarget`, …) — there is no XML/string templating.

**Local link** (to develop the plugin against an app without pushing): in the app, `pnpm add link:../path/to/expo-workspaces` (the repo root — run `pnpm build` first so `./build` exists), or use a `git+file://` URL.

**Releasing:** the git‑installable artifact is the committed `build/`. After any change, run `pnpm build` and commit the updated `build/` before pushing — consumers fetch the committed bundle (there is no build‑on‑install). See [`.github/workflows`](.github/workflows) — CI keeps `build/` in sync automatically.

## Compatibility

| Tool | Version |
| --- | --- |
| Expo SDK | ≥ 56 |
| Node | ≥ 20.19.4 |
| `@bacons/xcode` | `1.0.0-alpha.32` (pinned) |

## License

MIT
