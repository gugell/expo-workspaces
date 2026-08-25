# Contributing

1. `pnpm install`
2. Edit sources under `packages/@expo-workspaces/*/src` or `packages/expo-workspaces/src`.
3. If you change the **public config surface**, update `dist-types/` (`types.d.ts` / `index.d.ts`). These are the hand-curated declarations the bundle ships.
4. `pnpm build` then `pnpm test`.
5. Commit source **and** the regenerated root `build/`.
6. Open a PR — CI fails if `build/` is stale.

Prefer a **semantic operation** (add target, add package, set entitlement) over a generic file patch. Open an issue with the `semantic-operation` template before adding a new public config field.

Good first issues: docs, examples, doctor rules, tests. Native pbx internals are harder.

Use a short RFC in a GitHub discussion for breaking schema changes.
