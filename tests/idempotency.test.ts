import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { mergeContents } from '@expo/config-plugins/build/utils/generateCode';

describe('idempotency', () => {
  it('tagged Podfile merge is a no-op on the second apply', () => {
    const original = `target 'App' do\n  use_expo_modules!\nend\n`;
    const first = mergeContents({
      tag: 'declarative-workspace-remote-pods',
      src: original,
      newSrc: "  pod 'Alamofire', '~> 5.9'",
      anchor: /use_expo_modules!/,
      offset: 1,
      comment: '#',
    });
    assert.equal(first.didMerge, true);
    const second = mergeContents({
      tag: 'declarative-workspace-remote-pods',
      src: first.contents,
      newSrc: "  pod 'Alamofire', '~> 5.9'",
      anchor: /use_expo_modules!/,
      offset: 1,
      comment: '#',
    });
    assert.equal(second.contents, first.contents);
  });
});
