import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CreateUserSchema, UpdateUserSchema, UserSchema } from '../src/users/user.js';

test('user forms exclude credentials while the stored user retains its verifier', () => {
 assert.equal('password_hash' in CreateUserSchema.shape, false);
 assert.equal('password_hash' in UpdateUserSchema.shape, false);
 assert.equal('password_hash' in UserSchema.shape, true);
 assert.equal(UpdateUserSchema.strict().safeParse({ first_name: 'Updated' }).success, true);
 assert.equal(UpdateUserSchema.strict().safeParse({ password_hash: 'client supplied' }).success, false);
});
