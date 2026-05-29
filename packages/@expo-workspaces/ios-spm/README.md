# @expo-workspaces/ios-spm

> Swift Package Manager capability for [`expo-workspaces`](../../expo-workspaces).

Adds remote and local Swift packages to the Xcode project and links their products to targets (`pbx` ops via `@bacons/xcode`).

## Manifest keys

```js
swiftPackages: {
  remote: [
    {
      url: 'https://github.com/apple/swift-collections',
      requirement: { kind: 'upToNextMajorVersion', minimumVersion: '1.0.0' },
      products: ['Collections'],
      // target: 'MyApp', // defaults to the main app target
    },
  ],
  local: [
    { path: 'MyLocalPackage', products: ['MyLocalPackage'] },
  ],
}
```

Requirement kinds: `upToNextMajorVersion` · `upToNextMinorVersion` · `versionRange` · `exactVersion` · `branch` · `revision`. See the [manifest reference](../../../docs/manifest.md#ios--swift-package-manager-expo-workspacesios-spm).

Exports: `spmGenerator` + normalizers + types. Depends on `@expo-workspaces/core`, `@expo-workspaces/ios-xcode`, `@bacons/xcode`.

MIT
