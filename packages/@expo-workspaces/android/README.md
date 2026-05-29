# @expo-workspaces/android

> Android Gradle/manifest capability for [`expo-workspaces`](../../expo-workspaces).

Drives Android config from the manifest's `android` slice using Expo's typed Android mods (`withGradleProperties`, `withAppBuildGradle`, `withProjectBuildGradle`, `withAndroidManifest`).

## Manifest keys

```js
android: {
  minSdkVersion: 24,
  compileSdkVersion: 35,
  targetSdkVersion: 34,
  buildToolsVersion: '35.0.0',
  ndkVersion: '26.1.10909125',
  kotlinVersion: '1.9.24',
  gradleProperties: { 'org.gradle.jvmargs': '-Xmx4g' },
  permissions: ['android.permission.RECORD_AUDIO'],
  dependencies: ["implementation 'androidx.work:work-runtime:2.9.0'"],
  applicationAttributes: { 'android:largeHeap': 'true' },
  signing: { storeFile: 'release.keystore', storePassword: '…', keyAlias: 'upload', keyPassword: '…' },
}
```

SDK/toolchain versions are written as `android.*` keys in `gradle.properties` (read by Expo's `android/build.gradle`). Full mapping: [`docs/android.md`](../../../docs/android.md).

Exports: `androidGenerator`, `androidExecutor`, types. Depends on `@expo-workspaces/core`.

MIT
