# @expo-workspaces/ios-pods

> CocoaPods capability for [`expo-workspaces`](../../expo-workspaces).

Declarative Podfile management — injected via anchored, tagged `mergeContents` blocks (idempotent).

## Manifest keys

- `localPods` — monorepo pods linked by relative path (`{ pod, path }`).
- `remotePods` — pods from a spec repo or git (`{ pod, version?, git?, branch?, tag?, commit?, configurations?, modularHeaders? }`).
- `podBuildSettings` — build settings on matching **Pods project** targets in `post_install`.
- `removePodBuildPhases` — delete a named script build phase from matching pod targets.

```js
localPods: [{ pod: 'MyNativeIOS/React', path: '../../../packages/my-native' }],
remotePods: [{ pod: 'Alamofire', version: '~> 5.9' }],
podBuildSettings: [{ target: { startsWith: 'MyNativeIOS' }, settings: { ENABLE_BITCODE: 'NO' } }],
```

> `post_install` rules only reach `Pods.xcodeproj` targets. For app/extension targets, use a target's `buildSettings` ([ios-targets](../ios-targets)).

See the [manifest reference](../../../docs/manifest.md#ios--cocoapods-expo-workspacesios-pods). Exports: `podsGenerator` + normalizers. Depends on `@expo-workspaces/core`.

MIT
