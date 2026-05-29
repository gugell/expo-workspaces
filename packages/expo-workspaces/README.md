# @expo-workspaces/meta

> Internal package — **the bundle source**, not what you install.

Composes every `@expo-workspaces/*` capability generator and executor into the workspace plugin. It is private and never published on its own: the build step bundles it (plus all capabilities) into the **repo root** `expo-workspaces` package, which is the git‑installable artifact consumers add.

👉 To use the plugin, see the [repository README](../../README.md). Install it with:

```sh
pnpm add github:gugell/expo-workspaces
```

## Exports (re-exported by the root bundle)

- `default` — the config plugin (run‑once).
- `withWorkspace` — the composed plugin (for custom wrapping).
- `defineWorkspace(manifest)` — typed identity helper for authoring.
- `expo-workspaces/types` — `WorkspaceManifest` and every capability slice type.

## Docs

[manifest reference](../../docs/manifest.md) · [architecture](../../docs/architecture.md) · [iOS targets](../../docs/ios-targets.md) · [Android](../../docs/android.md).

MIT
