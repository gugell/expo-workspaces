# Architecture

`expo-workspaces` is a thin engine plus a set of capability packages. The engine knows nothing about pods, schemes, or gradle — it only knows how to load a manifest, collect a plan of **ops**, and hand them to **executors**.

```
loadManifest(projectRoot)
        │
        ▼
  for each generator:
     contributeConfig(config)         ← optional static Expo-config mutation (e.g. EAS appExtensions)
        │
        ▼
  for each generator:
     generate(ctx) → { ops, warnings } ← the declarative plan
        │
        ▼
  for each executor:
     executor(config, ops)            ← applies the ops it recognizes, at the right mod phase
```

## The op model (`@expo-workspaces/core`)

An **op** is a plain, declarative description of one change. Every op has `{ kind, label }`. The core ships the file ops and their executor; capability packages add their own kinds.

| Kind | Shape (abridged) | Applied by |
| --- | --- | --- |
| `writeFile` | `{ base, path, contents, overwrite }` | core `fileExecutor` |
| `mergeBlock` | `{ base, path, tag, anchor, offset, newSrc, comment, appendIfNoAnchor }` | core `fileExecutor` |
| `appendOnce` | `{ base, path, marker, contents }` | core `fileExecutor` |
| `deleteGlob` | `{ base, dir, match }` | core `fileExecutor` |
| `pbx` | `{ apply(ctx) }` (mutates a shared `@bacons/xcode` project) | ios-xcode `pbxExecutor` |
| `patch` | `{ base, path, action }` | patch `patchExecutor` |
| `androidGradleProperty` / `androidGradleBlock` / `androidGradleReplace` / `androidManifestPermission` / `androidManifestAppAttribute` | — | android `androidExecutor` |

`base` is `'ios' | 'android' | 'project'`, resolved at mod time to the platform dir or the project root.

The op list **is** the plan. For pbx ops the `apply` closure is the executor‑side detail; the op itself is still a labeled, inspectable entry.

## Generators

```ts
interface Generator {
  name: string;
  contributeConfig?(config, ctx): config;   // synchronous static-config contribution
  generate(ctx): { ops: Op[]; warnings?: string[] };
}
```

A generator reads its slice of the (raw) manifest from `ctx.manifest`, validates it, and returns ops. It runs at plugin‑eval time, so it can read `ctx.config` (the resolved app config) and the filesystem (`ctx.projectRoot`).

## Executors

```ts
type Executor = (config, ops) => config; // a ConfigPlugin that filters ops by kind
```

- **`fileExecutor`** (core) — one `withDangerousMod` pass per platform applying `writeFile` / `mergeBlock` / `appendOnce` / `deleteGlob`. Skips no‑op writes and reports changed files.
- **`pbxExecutor`** (ios-xcode) — one `finalized` ios mod that opens the `project.pbxproj` via `@bacons/xcode`, runs every `pbx` op against the single shared project, then serializes and writes once.
- **`patchExecutor`** (patch) — applies `patch` ops via `withDangerousMod`.
- **`androidExecutor`** (android) — applies android ops via Expo's typed `withGradleProperties` / `withAppBuildGradle` / `withProjectBuildGradle` / `withAndroidManifest`.

### Ordering

Generator order is load‑bearing for pbx ops. The meta composes them so the pbx plan is: **targets → swiftPackages → schemes → fixEmbedCycle** (target creation before schemes read targets; embed reorder runs last). File ops (Podfile, `.xcode.env`) run during the main mod pipeline; pbx ops run at `finalized`.

## The meta package

`packages/expo-workspaces` wires it together:

```ts
export default createRunOncePlugin(
  createWorkspace({
    generators: [podsGenerator, targetsGenerator, spmGenerator, xcodeEnvGenerator,
                 schemesGenerator, fixEmbedCycleGenerator, patchGenerator, androidGenerator],
    executors: [fileExecutor, patchExecutor, androidExecutor, pbxExecutor],
  }),
  'expo-workspaces', '1.0.0',
);
```

## Adding a capability

1. Create `packages/@expo-workspaces/<name>` (add it to `pnpm-workspace.yaml` and the root solution `tsconfig.json` references).
2. Export a `Generator` whose `generate()` reads its manifest slice and returns ops. Reuse existing op kinds where possible; only add a new kind + executor if the existing file/pbx/android executors can't express it.
3. If you add a new op kind, export an `Executor` that filters by that kind.
4. Register the generator (and executor) in the meta's `createWorkspace({ … })`.
5. Add your slice type to the meta's composed `WorkspaceManifest` (an intersection of every capability's manifest interface).

Determinism rules of thumb: write only inside tagged blocks (`mergeBlock`) or known generated files (`writeFile`); make raw inserts idempotent (guard on a marker); keep `@bacons/xcode` `.create()` argument shapes stable (UUIDs are a hash of the canonicalized create options).
