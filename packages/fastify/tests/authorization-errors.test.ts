/* * */

import { isUnauthorizedError } from '@/authorization-errors.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import assert from 'node:assert/strict';
import test from 'node:test';

/* * */

test('only classifies unauthorized HTTP errors as authentication failures', () => {
	assert.equal(isUnauthorizedError(new HttpException(HTTP_STATUS.UNAUTHORIZED, 'Session not found')), true);
	assert.equal(isUnauthorizedError(new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Database unavailable')), false);
	assert.equal(isUnauthorizedError(new Error('Database unavailable')), false);
});
