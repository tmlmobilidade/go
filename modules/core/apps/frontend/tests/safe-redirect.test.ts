import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getSafeRedirectToUrl } from '../src/utils/get-safe-redirect-to-url.js';

test('redirects stay on the application origin after normalization', () => {
 for (const input of ['/.//evil.example', '/a/..//evil.example', '//evil.example', '/\\evil.example', 'https://evil.example']) {
  const result = getSafeRedirectToUrl(input);
  assert.equal(new URL(result, 'https://go.tmlmobilidade.pt').origin, 'https://go.tmlmobilidade.pt');
 }
 assert.equal(getSafeRedirectToUrl('/core/home?view=all#top'), '/core/home?view=all#top');
});
