# @expo-workspaces/ios-xcode

> iOS Xcode capability for [`expo-workspaces`](../../expo-workspaces).

Owns the pbx executor plus the Xcode‑level generators.

## Manifest keys

- `schemes` — shared `.xcscheme` files for the app target.
- `replaceExpoScheme` — delete existing schemes before writing.
- `xcodeEnv` — append exports/lines to `ios/.xcode.env`.
- `fixExtensionEmbedCycle` — reorder "Embed Foundation Extensions" after Resources (default `true`).

See the [manifest reference](../../../docs/manifest.md#ios--xcode-expo-workspacesios-xcode).

## Exports

- `pbxExecutor` — opens `project.pbxproj` via `@bacons/xcode`, runs all `pbx` ops in one `finalized` pass, serializes once.
- `pbxOp(label, apply)`, `isPbxOp`, types `PbxOp` / `PbxApplyContext` — the `pbx` op kind used by this and other iOS capability packages.
- `openXcodeProject`, `serializeXcodeProject`, `resolveNativeTargets`.
- `buildXcscheme`, `toBuildableReferenceVars`.
- Generators: `schemesGenerator`, `xcodeEnvGenerator`, `fixEmbedCycleGenerator`.

Depends on `@expo-workspaces/core` and `@bacons/xcode`.

MIT
