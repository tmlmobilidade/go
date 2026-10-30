import assert from 'node:assert/strict';
import { test } from 'node:test';
import { PasswordRequirementsSchema } from '../src/auth/password-requirements.js';

test('accepts passphrases and rejects invalid lengths and common passwords', () => {
 assert.equal(PasswordRequirementsSchema.safeParse({ password: 'a sufficiently long passphrase' }).success, true);
 for (const password of ['', 'short', 'passwordpassword', '123456789012345', 'é'.repeat(37)]) {
  assert.equal(PasswordRequirementsSchema.safeParse({ password }).success, false);
 }
 assert.equal(PasswordRequirementsSchema.safeParse({ password: 'é'.repeat(36) }).success, true);
});
