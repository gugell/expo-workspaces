import assert from 'node:assert/strict';
import path from 'node:path';
import { describe, it } from 'node:test';

import {
  buildPlanDocument,
  collectWorkspacePlan,
  createGeneratorContext,
  serializeOpsForCompare,
} from '@expo-workspaces/core';

import { workspaceGenerators } from '../packages/expo-workspaces/src/engine';

const examples = path.join(__dirname, '../examples');

describe('example plans', () => {
  it('share-extension emits a ShareExtension target op', () => {
    const ctx = createGeneratorContext(path.join(examples, 'share-extension'));
    const plan = collectWorkspacePlan(workspaceGenerators, ctx);
    const doc = buildPlanDocument(plan);
    assert.ok(doc.operations.some((op) => op.id === 'target:ShareExtension' || op.label.includes('ShareExtension')));
    assert.equal(serializeOpsForCompare(plan.ops), serializeOpsForCompare(collectWorkspacePlan(workspaceGenerators, ctx).ops));
  });

  it('native-dependencies emits SPM and pod ops', () => {
    const ctx = createGeneratorContext(path.join(examples, 'native-dependencies'));
    const doc = buildPlanDocument(collectWorkspacePlan(workspaceGenerators, ctx));
    assert.ok(doc.operations.some((op) => op.kind === 'ios.swiftPackage.add'));
    assert.ok(doc.operations.some((op) => op.kind === 'ios.pod.add'));
  });

  it('android-gradle plans SDK, structured deps, and redacted signing', () => {
    const ctx = createGeneratorContext(path.join(examples, 'android-gradle'));
    const doc = buildPlanDocument(collectWorkspacePlan(workspaceGenerators, ctx));
    const sdk = doc.operations.find((op) => op.id === 'android.sdk.minSdkVersion');
    assert.equal(sdk?.desired, 26);
    const deps = doc.operations.find((op) => op.id === 'android.dependencies');
    assert.ok(Array.isArray(deps?.desired));
    assert.ok(
      (deps?.desired as Array<{ module?: string }>).some((dep) => dep.module?.includes('work-runtime-ktx')),
    );
    const password = doc.operations.find((op) => op.id === 'android.signing.storePassword');
    assert.deepEqual(password?.desired, { env: 'EXPO_WORKSPACE_RELEASE_STORE_PASSWORD' });
  });

  it('android-manifest plans permissions, uses-feature, and application attributes', () => {
    const ctx = createGeneratorContext(path.join(examples, 'android-manifest'));
    const doc = buildPlanDocument(collectWorkspacePlan(workspaceGenerators, ctx));
    assert.ok(doc.operations.some((op) => op.id === 'android.permission.android.permission.CAMERA'));
    const feature = doc.operations.find((op) => op.id === 'android.feature.android.hardware.camera');
    assert.equal((feature?.desired as { name: string }).name, 'android.hardware.camera');
    assert.equal((feature?.desired as { required?: boolean }).required, false);
    const attr = doc.operations.find((op) => op.id === 'android.appAttribute.android:largeHeap');
    assert.equal(attr?.desired, 'true');
  });

  it('multi-scheme and widget configs load', () => {
    for (const name of ['multi-scheme', 'widget']) {
      const ctx = createGeneratorContext(path.join(examples, name));
      const plan = collectWorkspacePlan(workspaceGenerators, ctx);
      assert.ok(plan.ops.length > 0, name);
    }
  });
});
