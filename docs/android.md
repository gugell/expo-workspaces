# Android configuration

`@expo-workspaces/android` drives Android Gradle and `AndroidManifest.xml` from the `android` slice, using Expo's typed Android mods (`withGradleProperties`, `withAppBuildGradle`, `withProjectBuildGradle`, `withAndroidManifest`).

Prefer structured dependencies and `uses-feature` entries so `plan` / `doctor` show coordinates and hardware names instead of opaque Groovy.

```ts
import { androidFeature, androidLibrary, defineWorkspace } from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  android: {
    minSdkVersion: 26,
    compileSdkVersion: 35,
    targetSdkVersion: 35,
    buildToolsVersion: '35.0.0',
    ndkVersion: '26.1.10909125',
    kotlinVersion: '2.0.21',

    gradleProperties: {
      'org.gradle.jvmargs': '-Xmx4g -Dfile.encoding=UTF-8',
      'org.gradle.parallel': true,
    },

    permissions: ['android.permission.RECORD_AUDIO'],

    features: [
      androidFeature('android.hardware.camera', false),
      { name: 'android.hardware.opengles.aep', required: false, glEsVersion: '0x00030000' },
    ],

    dependencies: [
      androidLibrary('androidx.work:work-runtime-ktx:2.9.1'),
      androidLibrary('androidx.security:security-crypto:1.1.0-alpha06', 'api'),
      "debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'",
    ],

    applicationAttributes: { 'android:largeHeap': 'true' },

    signing: {
      storeFile: 'release.keystore', // relative to android/app
      storePassword: { env: 'EXPO_WORKSPACE_RELEASE_STORE_PASSWORD' },
      keyAlias: 'upload',
      keyPassword: { env: 'EXPO_WORKSPACE_RELEASE_KEY_PASSWORD' },
    },
  },
});
```

See [`examples/android-gradle`](../examples/android-gradle) and [`examples/android-manifest`](../examples/android-manifest).

## How each field maps

| Field | File | Mechanism |
| --- | --- | --- |
| `minSdkVersion`, `compileSdkVersion`, `targetSdkVersion`, `buildToolsVersion`, `ndkVersion`, `kotlinVersion` | `android/gradle.properties` | Written as `android.*` keys. Expo's `android/build.gradle` reads them via `findProperty`. |
| `gradleProperties` | `android/gradle.properties` | Arbitrary entries merged in. |
| `dependencies` | `android/app/build.gradle` | Tagged insert into `dependencies { }`. Structured `{ module, configuration }` is rendered to Groovy; raw lines still work. |
| `signing` | `gradle.properties` + `app/build.gradle` | Credentials as `EXPO_WORKSPACE_RELEASE_*`; a `release` `signingConfigs` block; release build type switched from `signingConfigs.debug` to `signingConfigs.release`. |
| `permissions` | `AndroidManifest.xml` | `<uses-permission>`. |
| `features` | `AndroidManifest.xml` | `<uses-feature android:name … android:required … android:glEsVersion>`. |
| `applicationAttributes` | `AndroidManifest.xml` | Attributes on `<application>`. |

## Notes

- SDK versions go through `gradle.properties` (rather than editing the `ext` block) because that's the override point Expo's template already reads — it survives template changes between SDK versions.
- Prefer `{ env: "VAR" }` or `"env:VAR"` for signing passwords. `plan` redacts them; `doctor` warns on literals.
- Gradle text edits use anchored, tagged merges so re-running `expo prebuild` is idempotent. The release-signing `signingConfig` swap is a single regex replace against Expo's default template — keep `signing` as the public API rather than adding more Groovy regex.
