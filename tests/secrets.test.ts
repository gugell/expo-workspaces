import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { isLiteralSecret, redactDeep, resolveSecret } from '../packages/@expo-workspaces/core/src/secrets';

describe('secrets', () => {
  it('resolves { env } and env:VAR', () => {
    process.env.TEST_WORKSPACE_SECRET = 'from-env';
    assert.equal(resolveSecret({ env: 'TEST_WORKSPACE_SECRET' }, 'x'), 'from-env');
    assert.equal(resolveSecret('env:TEST_WORKSPACE_SECRET', 'x'), 'from-env');
    assert.equal(resolveSecret('literal', 'x'), 'literal');
  });

  it('flags literal secrets', () => {
    assert.equal(isLiteralSecret('hunter2'), true);
    assert.equal(isLiteralSecret({ env: 'X' }), false);
  });

  it('redacts password fields and leaves env refs inspectable', () => {
    const redacted = redactDeep({
      storePassword: 'hunter2',
      keyAlias: 'upload',
      nested: { keyPassword: 'abc' },
    });
    assert.equal(redacted.storePassword, '********');
    assert.equal(redacted.keyAlias, 'upload');
    assert.equal(redacted.nested.keyPassword, '********');
  });
});
