# expo-workspaces

> Meta package — the Expo config plugin you add to `app.json`.

Composes every `@expo-workspaces/*` capability generator and executor into a single declarative, manifest‑first workspace plugin for Expo CNG.

## Install

```jsonc
// app.json
{ "expo": { "plugins": ["expo-workspaces"] } }
// or: ["expo-workspaces", { "manifestPath": "config/workspace.manifest.js" }]
```

Author `workspace.manifest.js` at the app root:

```js
/** @type {import('expo-workspaces/types').WorkspaceManifest} */
module.exports = { manifestVersion: 1 /* … */ };
```

## Exports

- `default` — the config plugin (run‑once).
- `withWorkspace` — the composed plugin (for custom wrapping).
- `defineWorkspace(manifest)` — typed identity helper for authoring.
- `expo-workspaces/types` — `WorkspaceManifest` and every capability slice type.

## Docs

See the [repository README](../../README.md) and [`docs/`](../../docs): [manifest reference](../../docs/manifest.md) · [architecture](../../docs/architecture.md) · [iOS targets](../../docs/ios-targets.md) · [Android](../../docs/android.md).

MIT
