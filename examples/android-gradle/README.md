# Android Gradle example

Application-level Gradle intent: SDK versions, `gradle.properties`, structured Maven dependencies, and release signing via environment variables.

```ts
import { androidLibrary, defineWorkspace } from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  android: {
    minSdkVersion: 26,
    gradleProperties: { 'org.gradle.parallel': true },
    dependencies: [
      androidLibrary('androidx.work:work-runtime-ktx:2.9.1'),
      androidLibrary('androidx.security:security-crypto:1.1.0-alpha06', 'api'),
      "debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'",
    ],
    signing: {
      storeFile: 'release.keystore',
      storePassword: { env: 'EXPO_WORKSPACE_RELEASE_STORE_PASSWORD' },
      keyAlias: 'upload',
      keyPassword: { env: 'EXPO_WORKSPACE_RELEASE_KEY_PASSWORD' },
    },
  },
});
```

```sh
export EXPO_WORKSPACE_RELEASE_STORE_PASSWORD=secret
export EXPO_WORKSPACE_RELEASE_KEY_PASSWORD=secret
pnpm install   # from the repo root
pnpm --filter android-gradle-example plan
pnpm --filter android-gradle-example prebuild
```

`plan` and `doctor` redact password fields. Literal passwords in git will warn. Manifest-only Android config lives in [`../android-manifest`](../android-manifest).
