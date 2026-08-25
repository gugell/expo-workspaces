import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { normalizeWorkspaceConfig } from '../packages/@expo-workspaces/core/src/normalize';

describe('normalizeWorkspaceConfig', () => {
  it('flattens nested workspace.config.ts into generator-facing fields', () => {
    const manifest = normalizeWorkspaceConfig({
      schemaVersion: 1,
      ios: {
        deploymentTarget: '16.4',
        targets: [{ name: 'ShareExtension', type: 'share' }],
        packages: [
          {
            url: 'https://github.com/apple/swift-collections',
            requirement: { kind: 'upToNextMajorVersion', minimumVersion: '1.0.0' },
            products: ['Collections'],
          },
        ],
        pods: [
          { pod: 'Alamofire', version: '~> 5.9' },
          { pod: 'LocalKit', path: '../packages/kit' },
        ],
        schemes: [{ name: 'Development', configuration: 'Debug' }],
      },
      android: { minSdkVersion: 26 },
    });

    assert.equal(manifest.manifestVersion, 1);
    assert.equal((manifest.targets as { name: string }[])[0].name, 'ShareExtension');
    assert.equal((manifest.targets as { deploymentTarget: string }[])[0].deploymentTarget, '16.4');
    assert.equal((manifest.swiftPackages as { remote: unknown[] }).remote.length, 1);
    assert.equal((manifest.remotePods as unknown[]).length, 1);
    assert.equal((manifest.localPods as unknown[]).length, 1);
    assert.equal((manifest.android as { minSdkVersion: number }).minSdkVersion, 26);
  });

  it('keeps a legacy flat workspace.manifest.js working', () => {
    const manifest = normalizeWorkspaceConfig({
      manifestVersion: 1,
      targets: [{ name: 'Clip', type: 'clip' }],
      localPods: [{ pod: 'X', path: '../x' }],
    });
    assert.equal((manifest.targets as { name: string }[])[0].name, 'Clip');
    assert.equal((manifest.localPods as { pod: string }[])[0].pod, 'X');
  });

  it('rejects an unsupported schema version', () => {
    assert.throws(() => normalizeWorkspaceConfig({ schemaVersion: 2 }), /Unsupported/);
  });
});
