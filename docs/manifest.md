# Manifest reference

The preferred config is a TypeScript module (`workspace.config.ts`) at the app root. `workspace.manifest.js` (CommonJS, `manifestVersion: 1`) is still loaded if no `workspace.config.*` file is present. Override the path with the `configPath` (or deprecated `manifestPath`) plugin option.

Author with `defineWorkspace` and target helpers:

```ts
import { defineWorkspace, shareExtension, swiftPackage } from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  ios: {
    targets: [shareExtension({ name: 'ShareExtension', bundleIdentifier: '.share' })],
  },
});
```

| Field | Type | Default | Owner |
| --- | --- | --- | --- |
| `manifestVersion` | `1` | — (required) | core |
| `localPods` | `LocalPod[]` | `[]` | ios-pods |
| `remotePods` | `RemotePod[]` | `[]` | ios-pods |
| `podBuildSettings` | `PodBuildSettingsRule[]` | `[]` | ios-pods |
| `removePodBuildPhases` | `PodRemoveBuildPhaseRule[]` | `[]` | ios-pods |
| `schemes` | `Scheme[]` | `[]` | ios-xcode |
| `replaceExpoScheme` | `boolean` | `false` | ios-xcode |
| `xcodeEnv` | `XcodeEnvSpec` | — | ios-xcode |
| `fixExtensionEmbedCycle` | `boolean` | `true` | ios-xcode |
| `targetsRoot` | `string` | `./targets` | ios-targets |
| `targets` | `TargetSpec[]` | `[]` | ios-targets |
| `swiftPackages` | `{ remote?, local? }` | — | ios-spm |
| `patches` | `FilePatch[]` | `[]` | patch |
| `android` | `AndroidSlice` | — | android |

---

## iOS · CocoaPods (`@expo-workspaces/ios-pods`)

### `localPods: LocalPod[]`
Monorepo pods linked by relative path. Injected after `use_expo_modules!` inside the app target.

```ts
{ pod: string; path: string } // path is relative to the ios/ directory (the Podfile)
```

### `remotePods: RemotePod[]`
Pods from a spec repo or git, injected alongside local pods.

```ts
{
  pod: string;
  version?: string;          // e.g. "~> 5.9" or "1.2.3"
  git?: string; branch?: string; tag?: string; commit?: string;
  configurations?: string[]; // e.g. ["Debug"]
  modularHeaders?: boolean;
}
```

### `podBuildSettings: PodBuildSettingsRule[]`
Sets build settings on matching **Pods project** targets, inside `post_install`.

```ts
{
  target: string | { equals?: string; startsWith?: string; regex?: string };
  settings: Record<string, string>;
  configurations?: ('Debug' | 'Release')[]; // limit to certain configs
}
```

> Only reaches targets in `Pods.xcodeproj`. To set build settings on the **app** or an **extension** target, use a target's [`buildSettings`](#targetspec) instead.

### `removePodBuildPhases: PodRemoveBuildPhaseRule[]`
Deletes a named **script build phase** from matching pod targets in `post_install`.

```ts
{ target: string | NameMatcher; phase: string }
```

> Note: only removes real `PBXShellScriptBuildPhase` entries. Xcode built‑in tasks (e.g. App Intents metadata extraction) are gated by build settings, not phases — disable those with `settings`/`buildSettings`.

---

## iOS · Xcode (`@expo-workspaces/ios-xcode`)

### `schemes: Scheme[]`
Writes shared `.xcscheme` files for the app target.

```ts
{
  name: string;                       // also the .xcscheme filename
  configuration: 'Debug' | 'Release'; // launch config
  archive?: 'Debug' | 'Release';      // default 'Release'
  analyze?: 'Debug' | 'Release';      // default 'Debug'
  includeUnitTestTarget?: boolean;    // default false
}
```

### `replaceExpoScheme: boolean`
When `true`, deletes all existing `.xcscheme` files before writing yours.

### `xcodeEnv: XcodeEnvSpec`
Appends to `ios/.xcode.env` (anchored on `export NODE_BINARY=`).

```ts
{ exports?: Record<string, string>; lines?: string[] }
```

### `fixExtensionEmbedCycle: boolean`
Reorders the "Embed Foundation Extensions" phase to immediately follow Resources on app targets, avoiding Xcode 15+ build cycles. Defaults to `true`; set `false` to disable.

---

## iOS · Native targets (`@expo-workspaces/ios-targets`)

### `targetsRoot: string`
Root directory (relative to the app) scanned for target source. Default `./targets`.

### `targets: TargetSpec[]`
<a id="targetspec"></a>

```ts
{
  name: string;                         // folder under targetsRoot AND the Xcode target name
  type: 'share' | 'widget' | 'clip';
  bundleIdentifier?: string;            // leading "." appends to the app id (".ShareExtension")
  deploymentTarget?: string;            // default 18.0
  entitlements?: Record<string, unknown>; // → generated.entitlements (+ CODE_SIGN_ENTITLEMENTS/REGISTER_APP_GROUPS)
  frameworks?: string[];                // extra frameworks (the type adds its own defaults)
  source?: string;                      // override source dir (default `${targetsRoot}/${name}`)
  buildSettings?: Record<string, string>; // applied to the target's Debug + Release configs
  pods?: TargetPod[];                   // CocoaPods deps emitted as a `target '<name>' do … end` block
}

type TargetPod = {
  pod: string;
  path?: string;                        // local pod path (relative to ios/)
  version?: string;                     // e.g. "~> 1.2"
  git?: string; branch?: string; tag?: string; commit?: string;
  configurations?: string[];
  modularHeaders?: boolean;
};
```

Source files live on disk under `targets/<name>/`. See [`ios-targets.md`](ios-targets.md).

> **Per-target pods:** declaring `pods` in the manifest is the recommended, declarative replacement for `targets/<name>/pods.rb`. The Podfile loader that consumes `pods.rb` files is still appended (back‑compat) — but don't declare the same target in both places, or CocoaPods sees duplicate `target` blocks.

---

## iOS · Swift Package Manager (`@expo-workspaces/ios-spm`)

### `swiftPackages.remote: SpmRemotePackage[]`

```ts
{
  url: string;                          // repository URL
  requirement:
    | { kind: 'upToNextMajorVersion'; minimumVersion: string }
    | { kind: 'upToNextMinorVersion'; minimumVersion: string }
    | { kind: 'versionRange'; minimumVersion: string; maximumVersion: string }
    | { kind: 'exactVersion'; version: string }
    | { kind: 'branch'; branch: string }
    | { kind: 'revision'; revision: string };
  products: string[];                   // product names to link
  target?: string;                      // target to attach to (default: main app)
}
```

### `swiftPackages.local: SpmLocalPackage[]`

```ts
{ path: string; products: string[]; target?: string } // path relative to the Xcode project
```

---

## Source patching (`@expo-workspaces/patch`)

### `patches: FilePatch[]`
Each patch targets one file; provide exactly one operation.

```ts
{
  file: string;                 // path relative to `base`
  base?: 'ios' | 'android' | 'project'; // default 'ios'

  // Idempotent tagged block (recommended) — delegates to mergeContents:
  block?: { tag: string; anchor: string; regex?: boolean; offset?: number;
            comment?: string; contents: string; appendIfNoAnchor?: boolean };

  // Or a raw operation (idempotent: insert is skipped if the text already exists):
  insertAfter?:  { anchor: string; regex?: boolean; text: string };
  insertBefore?: { anchor: string; regex?: boolean; text: string };
  replace?:      { find: string; regex?: boolean; all?: boolean; with: string };
}
```

`base` resolves the path against the iOS platform dir (`ios/`), the Android platform dir (`android/`), or the project root.

---

## Android (`@expo-workspaces/android`)

### `android: AndroidSlice`

```ts
{
  minSdkVersion?: number;       // → gradle.properties android.minSdkVersion
  compileSdkVersion?: number;   // → android.compileSdkVersion
  targetSdkVersion?: number;    // → android.targetSdkVersion
  buildToolsVersion?: string;   // → android.buildToolsVersion
  ndkVersion?: string;          // → android.ndkVersion
  kotlinVersion?: string;       // → android.kotlinVersion
  gradleProperties?: Record<string, string | number | boolean>;
  permissions?: string[];       // uses-permission in AndroidManifest.xml
  dependencies?: string[];      // lines added to app/build.gradle dependencies { }
  applicationAttributes?: Record<string, string>; // <application> attrs (e.g. "android:largeHeap")
  signing?: {                   // release signingConfig (credentials → gradle.properties)
    storeFile: string;          // relative to android/app
    storePassword: string;
    keyAlias: string;
    keyPassword: string;
  };
}
```

SDK/toolchain versions are written as `android.*` keys in `gradle.properties`, which Expo's `android/build.gradle` reads via `findProperty`. See [`android.md`](android.md).
