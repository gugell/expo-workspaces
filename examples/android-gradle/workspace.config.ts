import { androidLibrary, defineWorkspace } from 'expo-workspaces';

export default defineWorkspace({
  schemaVersion: 1,
  android: {
    minSdkVersion: 26,
    compileSdkVersion: 35,
    targetSdkVersion: 35,
    buildToolsVersion: '35.0.0',
    kotlinVersion: '2.0.21',
    gradleProperties: {
      'android.enablePngCrunchInReleaseBuilds': true,
      'org.gradle.jvmargs': '-Xmx4g -Dfile.encoding=UTF-8',
      'org.gradle.parallel': true,
    },
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
