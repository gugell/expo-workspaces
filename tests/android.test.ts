import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  renderAndroidDependency,
  renderAndroidDependencies,
} from '../packages/@expo-workspaces/android/src/dependencies';
import { normalizeAndroidFeatures } from '../packages/@expo-workspaces/android/src/features';
import { androidGenerator } from '../packages/@expo-workspaces/android/src/generators/android';

describe('android dependencies', () => {
  it('renders structured coordinates and keeps raw Groovy lines', () => {
    assert.equal(
      renderAndroidDependency({ module: 'androidx.work:work-runtime:2.9.0' }, 'dep'),
      "implementation 'androidx.work:work-runtime:2.9.0'",
    );
    assert.equal(
      renderAndroidDependency({ module: 'x:y:1', configuration: 'api' }, 'dep'),
      "api 'x:y:1'",
    );
    assert.equal(
      renderAndroidDependency("debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'", 'dep'),
      "debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'",
    );
  });

  it('rejects empty or unknown configurations', () => {
    assert.throws(() => renderAndroidDependency('  ', 'android.dependencies[0]'), /cannot be empty/);
    assert.throws(
      () =>
        renderAndroidDependency(
          { module: 'x:y:1', configuration: 'kapt' as 'implementation' },
          'android.dependencies[0]',
        ),
      /not supported/,
    );
  });

  it('prefixes Groovy lines for the dependencies block', () => {
    const { lines, desired } = renderAndroidDependencies([
      { module: 'androidx.work:work-runtime-ktx:2.9.1' },
      "debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'",
    ]);
    assert.deepEqual(lines, [
      "    implementation 'androidx.work:work-runtime-ktx:2.9.1'",
      "    debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.14'",
    ]);
    assert.equal(desired[0]?.module, 'androidx.work:work-runtime-ktx:2.9.1');
    assert.deepEqual(desired[1], {
      configuration: 'debugImplementation',
      module: 'com.squareup.leakcanary:leakcanary-android:2.14',
    });
  });
});

describe('android features', () => {
  it('normalizes string names and structured uses-feature entries', () => {
    assert.deepEqual(normalizeAndroidFeatures(['android.hardware.camera']), [
      { name: 'android.hardware.camera', required: true },
    ]);
    assert.deepEqual(
      normalizeAndroidFeatures([
        { name: 'android.hardware.opengles.aep', required: false, glEsVersion: '0x00030000' },
      ]),
      [{ name: 'android.hardware.opengles.aep', required: false, glEsVersion: '0x00030000' }],
    );
  });
});

describe('android generator', () => {
  it('emits gradle property, dependency, feature, and permission ops', () => {
    const { ops } = androidGenerator.generate({
      manifest: {
        manifestVersion: 1,
        android: {
          minSdkVersion: 26,
          gradleProperties: { 'org.gradle.parallel': true },
          permissions: ['android.permission.CAMERA'],
          features: [{ name: 'android.hardware.camera', required: false }],
          dependencies: [{ module: 'androidx.work:work-runtime-ktx:2.9.1', configuration: 'api' }],
          applicationAttributes: { 'android:largeHeap': 'true' },
        },
      },
      config: { name: 'test' },
      projectRoot: '/tmp',
      configPath: '/tmp/workspace.config.ts',
    });

    const kinds = ops.map((op) => op.kind);
    assert.ok(kinds.includes('androidGradleProperty'));
    assert.ok(kinds.includes('androidGradleBlock'));
    assert.ok(kinds.includes('androidManifestPermission'));
    assert.ok(kinds.includes('androidManifestUsesFeature'));
    assert.ok(kinds.includes('androidManifestAppAttribute'));

    const deps = ops.find((op) => op.kind === 'androidGradleBlock' && op.label === 'android:dependencies');
    assert.ok(deps);
    assert.match((deps as { contents: string }).contents, /api 'androidx.work:work-runtime-ktx:2.9.1'/);

    const feature = ops.find((op) => op.kind === 'androidManifestUsesFeature');
    assert.deepEqual(
      { name: (feature as { name: string }).name, required: (feature as { required?: boolean }).required },
      { name: 'android.hardware.camera', required: false },
    );
  });
});
