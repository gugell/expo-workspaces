# @expo-workspaces/core

> The engine behind [`expo-workspaces`](../../expo-workspaces).

Capability‑agnostic primitives: the op model, the generator/executor contracts, the manifest loader, the file executor, and `createWorkspace()` — the plugin factory that composes generators + executors into one ConfigPlugin.

## Exports

- `createWorkspace({ generators, executors })` → `ConfigPlugin` — load manifest → `contributeConfig` → collect ops → run executors.
- `fileExecutor` — applies `writeFile` / `mergeBlock` / `appendOnce` / `deleteGlob` ops (iOS + Android + project) in one `withDangerousMod` pass.
- `loadManifest`, `resolveManifestPath`, `DEFAULT_MANIFEST_FILENAME`.
- `reportChange`, `reportSkip`, `reportWarning`.
- Validation helpers: `assertBuildConfiguration`, `assertNameMatcher`, `nameMatcherToRuby`, `rubyLiteral`.
- Types: `Op`, `FileOp`, `WriteFileOp`, `MergeBlockOp`, `AppendOnceOp`, `DeleteGlobOp`, `Generator`, `Executor`, `GeneratorContext`, `WorkspaceAppConfig`, `RawManifest`, `FileBase`, `NameMatcher`, `XcodeBuildConfiguration`.

## Op kinds shipped here

`writeFile` · `mergeBlock` · `appendOnce` · `deleteGlob` (anchored at `base: 'ios' | 'android' | 'project'`).

See the [architecture guide](../../../docs/architecture.md) to add a capability.

MIT
