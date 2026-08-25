# expo-workspaces

**Native projects as code for Expo.**

Configure targets, native dependencies, schemes, and build settings declaratively — then let Expo CNG generate `ios/` and `android/`.

```
workspace.config.ts  →  plan  →  expo prebuild  →  disposable ios/ + android/
```

## Why

Expo already owns library-level config plugins and CNG. This package is the **application-level** native intent layer: one typed file instead of a pile of local `withDangerousMod` plugins, Podfile edits, and extension templates.

- Semantic operations (`add target`, `add Swift package`, `set entitlement`) instead of textual patches
- `plan` before prebuild
- `doctor` for config and native-intent checks
- Generated native projects stay disposable

Not a replacement for Xcode, EAS, Tuist, or Expo patch-project. Not a widget UI framework.

## Install

```sh
pnpm add expo-workspaces
# npm install expo-workspaces
```

Git install remains a development path: `pnpm add github:gugell/expo-workspaces`.

Register the plugin **last** in `app.json`:

```json
{
  "expo": {
    "plugins": ["expo-workspaces"]
  }
}
```

## Quick start

```ts
// workspace.config.ts
import {
  defineWorkspace,
  shareExtension,
  swiftPackage,
} from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  ios: {
    deploymentTarget: '16.4',
    targets: [
      shareExtension({
        name: 'ShareExtension',
        bundleIdentifier: '.share',
        entitlements: {
          'com.apple.security.application-groups': ['group.com.acme.app'],
        },
      }),
    ],
    packages: [
      swiftPackage({
        url: 'https://github.com/example/sdk',
        requirement: { kind: 'upToNextMajorVersion', minimumVersion: '1.0.0' },
        products: ['ExampleSDK'],
      }),
    ],
    schemes: [
      { name: 'Development', configuration: 'Debug' },
      { name: 'Production', configuration: 'Release' },
    ],
  },
  android: {
    minSdkVersion: 26,
    permissions: ['android.permission.RECORD_AUDIO'],
  },
});
```

```sh
npx expo-workspaces plan
npx expo prebuild
```

`workspace.manifest.js` (flat, `manifestVersion: 1`) still loads if no `workspace.config.ts` is present.

## CLI

| Command | Purpose |
| --- | --- |
| `expo-workspaces plan` | Semantic operation plan. No native writes. `--json` for CI. |
| `expo-workspaces validate` | Schema + semantic constraints. |
| `expo-workspaces doctor` | Environment, entitlements, SPM, secrets. `--ci` uses exit 0/1/2. |
| `expo-workspaces explain --id <op>` | Why an operation exists. |
| `expo-workspaces diff` | Declared intent vs generated native targets. |
| `expo-workspaces migrate` | Inspect an existing `ios/`/`android/` project. `--write` emits config. |

Exit codes: `0` healthy, `1` configuration/native error, `2` tool failure.

## Examples

See [`examples/`](examples/). Apps are pnpm workspace packages (`workspace:*` + catalogs).

| Example | Intent |
| --- | --- |
| [share-extension](examples/share-extension) | Share Extension + App Groups |
| [widget](examples/widget) | WidgetKit target |
| [native-dependencies](examples/native-dependencies) | SPM + CocoaPods |
| [multi-scheme](examples/multi-scheme) | Shared Xcode schemes |
| [android-gradle](examples/android-gradle) | SDK, Gradle properties, structured deps, env signing |
| [android-manifest](examples/android-manifest) | permissions, uses-feature, application attributes |

## Compatibility

| Tool | Version |
| --- | --- |
| Expo SDK | ≥ 56 |
| Node | ≥ 20.19.4 |
| `@bacons/xcode` | `1.0.0-alpha.32` (pinned) |

This is a **0.x** release. The configuration schema will change with migration notes; it is not 1.0-stable.

## Docs

- [Manifest / config reference](docs/manifest.md)
- [Architecture](docs/architecture.md)
- [iOS targets](docs/ios-targets.md)
- [Android](docs/android.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT
