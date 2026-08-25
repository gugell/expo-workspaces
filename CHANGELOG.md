# Changelog

## 0.1.0

First public 0.x release. Configuration schema is **not** frozen.

- Typed `workspace.config.ts` with `defineWorkspace`, `shareExtension`, `swiftPackage`, and nested `ios` / `android`
- CLI: `plan`, `validate`, `doctor`, `explain`, `diff`, `migrate`
- Operation provenance for plan/JSON
- Example apps under `examples/`
- Signing secrets via `{ env: "VAR" }`; literals warn in doctor
- Legacy `workspace.manifest.js` still loads
