# Android configuration

`@expo-workspaces/android` drives Android Gradle and manifest config from the manifest's `android` slice, using Expo's typed Android mods (`withGradleProperties`, `withAppBuildGradle`, `withProjectBuildGradle`, `withAndroidManifest`).

```js
/** @type {import('expo-workspaces/types').WorkspaceManifest} */
module.exports = {
  manifestVersion: 1,
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

    signing: {
      storeFile: 'release.keystore',   // relative to android/app
      storePassword: '…',
      keyAlias: 'upload',
      keyPassword: '…',
    },
  },
};
```

## How each field maps

| Field | Mechanism |
| --- | --- |
| `minSdkVersion`, `compileSdkVersion`, `targetSdkVersion`, `buildToolsVersion`, `ndkVersion`, `kotlinVersion` | Written as `android.*` keys in `gradle.properties`. Expo's `android/build.gradle` reads them via `findProperty`. |
| `gradleProperties` | Arbitrary entries merged into `gradle.properties`. |
| `permissions` | `<uses-permission>` entries in `AndroidManifest.xml`. |
| `dependencies` | Lines inserted into `app/build.gradle`'s `dependencies { }` block (tagged, idempotent). |
| `applicationAttributes` | Attributes set on the `<application>` element. |
| `signing` | Credentials written to `gradle.properties` (`EXPO_WORKSPACE_RELEASE_*`); a `release` block added to `app/build.gradle`'s `signingConfigs`; and the release build type switched from `signingConfigs.debug` to `signingConfigs.release`. |

## Notes

- SDK versions go through `gradle.properties` (rather than editing the `ext` block) because that's the override point Expo's template already reads — it survives template changes between SDK versions.
- Signing credentials live in `gradle.properties` (not committed values in `build.gradle`). For CI/EAS, prefer providing them via environment/secret‑populated `gradle.properties` rather than hard‑coding in the manifest.
- Gradle text edits use anchored, tagged merges so re‑running `expo prebuild` is idempotent.
