import { ERR } from '@expo-workspaces/core';
import type { Generator } from '@expo-workspaces/core';

import type { AndroidOp, AndroidSlice } from '../types';

const SIGNING_KEYS = {
  storeFile: 'EXPO_WORKSPACE_RELEASE_STORE_FILE',
  storePassword: 'EXPO_WORKSPACE_RELEASE_STORE_PASSWORD',
  keyAlias: 'EXPO_WORKSPACE_RELEASE_KEY_ALIAS',
  keyPassword: 'EXPO_WORKSPACE_RELEASE_KEY_PASSWORD',
} as const;

function gradleProperty(key: string, value: string | number | boolean): AndroidOp {
  return { kind: 'androidGradleProperty', key, value: String(value), label: `android:gradleProperty:${key}` };
}

function sdkProperty(slice: AndroidSlice, key: keyof AndroidSlice, gradleKey: string, ops: AndroidOp[]): void {
  const value = slice[key];
  if (value !== undefined) {
    ops.push(gradleProperty(gradleKey, value as string | number));
  }
}

export const androidGenerator: Generator = {
  name: 'android',
  generate({ manifest }) {
    const slice = (manifest as { android?: AndroidSlice }).android;
    if (!slice || typeof slice !== 'object') {
      return { ops: [] };
    }

    const ops: AndroidOp[] = [];

    // SDK + toolchain versions → gradle.properties (read by Expo's android/build.gradle).
    sdkProperty(slice, 'minSdkVersion', 'android.minSdkVersion', ops);
    sdkProperty(slice, 'compileSdkVersion', 'android.compileSdkVersion', ops);
    sdkProperty(slice, 'targetSdkVersion', 'android.targetSdkVersion', ops);
    sdkProperty(slice, 'buildToolsVersion', 'android.buildToolsVersion', ops);
    sdkProperty(slice, 'ndkVersion', 'android.ndkVersion', ops);
    sdkProperty(slice, 'kotlinVersion', 'android.kotlinVersion', ops);

    // Arbitrary gradle.properties entries.
    if (slice.gradleProperties) {
      for (const [key, value] of Object.entries(slice.gradleProperties)) {
        ops.push(gradleProperty(key, value));
      }
    }

    // Permissions.
    for (const permission of slice.permissions ?? []) {
      if (typeof permission !== 'string' || !permission.trim()) {
        throw new Error(`${ERR} android.permissions entries must be non-empty strings.`);
      }
      ops.push({ kind: 'androidManifestPermission', permission: permission.trim(), label: `android:permission:${permission}` });
    }

    // <application> attributes.
    if (slice.applicationAttributes) {
      for (const [name, value] of Object.entries(slice.applicationAttributes)) {
        ops.push({
          kind: 'androidManifestAppAttribute',
          name,
          value: String(value),
          label: `android:appAttribute:${name}`,
        });
      }
    }

    // Gradle dependencies → app/build.gradle dependencies { ... }.
    if (slice.dependencies?.length) {
      const body = slice.dependencies.map((line) => `    ${line}`).join('\n');
      ops.push({
        kind: 'androidGradleBlock',
        file: 'app',
        tag: 'expo-workspace-android-dependencies',
        anchor: 'dependencies\\s*\\{',
        offset: 1,
        comment: '//',
        contents: body,
        label: 'android:dependencies',
      });
    }

    // Release signing config.
    if (slice.signing) {
      const s = slice.signing;
      if (!s.storeFile?.trim() || !s.keyAlias?.trim()) {
        throw new Error(`${ERR} android.signing requires "storeFile" and "keyAlias".`);
      }
      ops.push(gradleProperty(SIGNING_KEYS.storeFile, s.storeFile));
      ops.push(gradleProperty(SIGNING_KEYS.storePassword, s.storePassword ?? ''));
      ops.push(gradleProperty(SIGNING_KEYS.keyAlias, s.keyAlias));
      ops.push(gradleProperty(SIGNING_KEYS.keyPassword, s.keyPassword ?? ''));

      const releaseBlock = [
        '        release {',
        `            storeFile file(${SIGNING_KEYS.storeFile})`,
        `            storePassword ${SIGNING_KEYS.storePassword}`,
        `            keyAlias ${SIGNING_KEYS.keyAlias}`,
        `            keyPassword ${SIGNING_KEYS.keyPassword}`,
        '        }',
      ].join('\n');

      ops.push({
        kind: 'androidGradleBlock',
        file: 'app',
        tag: 'expo-workspace-android-signing',
        anchor: 'signingConfigs\\s*\\{',
        offset: 1,
        comment: '//',
        contents: releaseBlock,
        label: 'android:signingConfig',
      });
      ops.push({
        kind: 'androidGradleReplace',
        file: 'app',
        find: 'signingConfig signingConfigs\\.debug',
        replacement: 'signingConfig signingConfigs.release',
        all: false,
        label: 'android:signingConfig:release',
      });
    }

    return { ops };
  },
};
