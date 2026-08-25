import type { BaseOp, Op, SecretInput } from '@expo-workspaces/core';

export interface AndroidSigningConfig {
  /** Keystore path relative to android/app (e.g. "release.keystore"). */
  storeFile: string;
  /** Literal, `env:VAR`, or `{ env: "VAR" }`. Prefer env refs. */
  storePassword?: SecretInput;
  keyAlias: string;
  keyPassword?: SecretInput;
}

export interface AndroidSlice {
  minSdkVersion?: number;
  compileSdkVersion?: number;
  targetSdkVersion?: number;
  buildToolsVersion?: string;
  ndkVersion?: string;
  kotlinVersion?: string;
  /** Arbitrary gradle.properties entries. */
  gradleProperties?: Record<string, string | number | boolean>;
  /** Permission names (e.g. "android.permission.RECORD_AUDIO"). */
  permissions?: string[];
  /** Gradle dependency lines added to app/build.gradle (e.g. "implementation 'com.x:y:1.0'"). */
  dependencies?: string[];
  /** Attributes set on the AndroidManifest <application> element (e.g. { "android:largeHeap": "true" }). */
  applicationAttributes?: Record<string, string>;
  /** Release signing config applied to app/build.gradle (credentials go to gradle.properties). */
  signing?: AndroidSigningConfig;
}

/** The manifest slice this package consumes. */
export interface AndroidManifestSlice {
  android?: AndroidSlice;
}

export type GradleFile = 'app' | 'project';

export interface AndroidGradlePropertyOp extends BaseOp {
  kind: 'androidGradleProperty';
  key: string;
  value: string;
}
export interface AndroidGradleBlockOp extends BaseOp {
  kind: 'androidGradleBlock';
  file: GradleFile;
  tag: string;
  /** Regex source for the anchor line. */
  anchor: string;
  offset: number;
  comment: string;
  contents: string;
}
export interface AndroidGradleReplaceOp extends BaseOp {
  kind: 'androidGradleReplace';
  file: GradleFile;
  /** Regex source. */
  find: string;
  replacement: string;
  all: boolean;
}
export interface AndroidManifestPermissionOp extends BaseOp {
  kind: 'androidManifestPermission';
  permission: string;
}
export interface AndroidManifestAppAttributeOp extends BaseOp {
  kind: 'androidManifestAppAttribute';
  name: string;
  value: string;
}

export type AndroidOp =
  | AndroidGradlePropertyOp
  | AndroidGradleBlockOp
  | AndroidGradleReplaceOp
  | AndroidManifestPermissionOp
  | AndroidManifestAppAttributeOp;

const ANDROID_KINDS = new Set([
  'androidGradleProperty',
  'androidGradleBlock',
  'androidGradleReplace',
  'androidManifestPermission',
  'androidManifestAppAttribute',
]);

export function isAndroidOp(op: Op): op is AndroidOp {
  return ANDROID_KINDS.has(op.kind);
}
