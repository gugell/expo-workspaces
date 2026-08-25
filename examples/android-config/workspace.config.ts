import { defineWorkspace } from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  android: {
    minSdkVersion: 26,
    compileSdkVersion: 35,
    targetSdkVersion: 35,
    permissions: ['android.permission.RECORD_AUDIO'],
    gradleProperties: {
      'android.enablePngCrunchInReleaseBuilds': true,
    },
    signing: {
      storeFile: 'release.keystore',
      storePassword: { env: 'EXPO_WORKSPACE_RELEASE_STORE_PASSWORD' },
      keyAlias: 'upload',
      keyPassword: { env: 'EXPO_WORKSPACE_RELEASE_KEY_PASSWORD' },
    },
  },
});
