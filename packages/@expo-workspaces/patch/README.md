# @expo-workspaces/patch

> Declarative source/config file patching for [`expo-workspaces`](../../expo-workspaces).

For native or config files that have no dedicated plugin hook. Prefer idempotent tagged `block` patches; raw inserts are guarded (skipped if the text already exists).

## Manifest keys

```js
patches: [
  // Idempotent tagged block (recommended):
  {
    file: 'MyApp/AppDelegate.swift', base: 'ios',
    block: { tag: 'my-feature', anchor: 'didFinishLaunching', offset: 1, contents: '    // …' },
  },
  // Anchored insert:
  { file: 'gradle.properties', base: 'android', insertAfter: { anchor: 'org.gradle.jvmargs', text: 'foo=bar' } },
  // Regex replace:
  { file: 'MyApp/Info.plist', base: 'ios', replace: { find: 'OLD', with: 'NEW', regex: true, all: true } },
]
```

`base` is `'ios' | 'android' | 'project'`. Provide exactly one of `block` / `insertAfter` / `insertBefore` / `replace`. See the [manifest reference](../../../docs/manifest.md#source-patching-expo-workspacespatch).

Exports: `patchGenerator`, `patchExecutor`, types. Depends on `@expo-workspaces/core`.

MIT
