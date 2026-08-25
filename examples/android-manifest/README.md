# Android Manifest example

Application-level `AndroidManifest.xml` intent: permissions, `<uses-feature>`, and `<application>` attributes.

```ts
import { androidFeature, defineWorkspace } from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  android: {
    permissions: ['android.permission.CAMERA', 'android.permission.RECORD_AUDIO'],
    features: [
      androidFeature('android.hardware.camera', false),
      { name: 'android.hardware.opengles.aep', required: false, glEsVersion: '0x00030000' },
    ],
    applicationAttributes: {
      'android:largeHeap': 'true',
      'android:usesCleartextTraffic': 'false',
    },
  },
});
```

```sh
pnpm install   # from the repo root
pnpm --filter android-manifest-example plan
pnpm --filter android-manifest-example prebuild
```

Gradle / SDK / signing coverage lives in [`../android-gradle`](../android-gradle).
