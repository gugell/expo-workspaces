# @expo-workspaces/android

> Android Gradle/manifest capability for [`expo-workspaces`](../../expo-workspaces).

Drives Android config from the `android` slice using Expo's typed Android mods (`withGradleProperties`, `withAppBuildGradle`, `withProjectBuildGradle`, `withAndroidManifest`).

## Manifest keys

```ts
android: {
  minSdkVersion: 26,
  compileSdkVersion: 35,
  targetSdkVersion: 35,
  gradleProperties: { 'org.gradle.jvmargs': '-Xmx4g' },
  dependencies: [
    { module: 'androidx.work:work-runtime-ktx:2.9.1' },
    { module: 'androidx.security:security-crypto:1.1.0-alpha06', configuration: 'api' },
  ],
  permissions: ['android.permission.RECORD_AUDIO'],
  features: [{ name: 'android.hardware.camera', required: false }],
  applicationAttributes: { 'android:largeHeap': 'true' },
  signing: {
    storeFile: 'release.keystore',
    storePassword: { env: 'EXPO_WORKSPACE_RELEASE_STORE_PASSWORD' },
    keyAlias: 'upload',
    keyPassword: { env: 'EXPO_WORKSPACE_RELEASE_KEY_PASSWORD' },
  },
}
```

SDK/toolchain versions are written as `android.*` keys in `gradle.properties`. Full mapping: [`docs/android.md`](../../../docs/android.md). Examples: `examples/android-gradle`, `examples/android-manifest`.

Exports: `androidGenerator`, `androidExecutor`, `androidLibrary`, `androidFeature`, types. Depends on `@expo-workspaces/core`.

MIT
