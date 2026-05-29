# @expo-workspaces/ios-targets

> First‑party iOS native target generation for [`expo-workspaces`](../../expo-workspaces).

Synthesizes share / widget / clip app‑extension targets directly into the Xcode project — a first‑party replacement for `@bacons/apple-targets`, reusing the `@bacons/xcode` parser.

## Manifest keys

- `targetsRoot` — source root (default `./targets`).
- `targets` — `TargetSpec[]`:

```js
targets: [
  {
    name: 'ShareExtension',          // folder + Xcode target name
    type: 'share',                   // 'share' | 'widget' | 'clip'
    bundleIdentifier: '.ShareExtension',
    deploymentTarget: '16.4',
    entitlements: { 'com.apple.security.application-groups': ['group.com.example.app'] },
    // frameworks: [...], source: '...', buildSettings: { ... }
  },
]
```

Source files live under `targets/<name>/` (auto‑discovered via a file‑system‑synchronized group). Full guide: [`docs/ios-targets.md`](../../../docs/ios-targets.md).

## Exports

`targetsGenerator`, `applyTargetsPbx`, `normalizeTargets`, `resolveTargetBundleId`, `resolveEntitlements`, `getTargetInfoPlist`, `addEASAppExtension`, `TARGET_REGISTRY`, and types (`TargetSpec`, `TargetType`, `TargetPlan`, …).

Depends on `@expo-workspaces/core`, `@expo-workspaces/ios-xcode`, `@bacons/xcode`, `@expo/plist`.

MIT
