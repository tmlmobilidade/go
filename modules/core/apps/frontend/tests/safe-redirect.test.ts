import { PAGE_ROUTES } from '@tmlmobilidade/consts';
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getSafeRedirectToUrl } from '../src/utils/get-safe-redirect-to-url.js';

test('redirects stay on the application origin after normalization', () => {
 const origin = new URL(PAGE_ROUTES.core.HOME_LIST).origin;
 for (const input of ['/.//evil.example', '/a/..//evil.example', '//evil.example', '/\\evil.example', 'https://evil.example']) {
  const result = getSafeRedirectToUrl(input);
  assert.equal(new URL(result, origin).origin, origin);
 }
 assert.equal(getSafeRedirectToUrl('/core/home?view=all#top'), '/core/home?view=all#top');
});
