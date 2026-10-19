/* * */

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { SEVERITY } from '../src/logger/levels.js';
import { toRecord } from '../src/logger/to-record.js';

/* * */

describe('toRecord', () => {
	it('wraps a string', () => {
		assert.deepEqual(toRecord('info', 'hello'), { level: 'info', message: 'hello' });
	});

	it('treats a bare Error as an attached error, not as an entry', () => {
		const error = new TypeError('Invalid ride');
		assert.deepEqual(toRecord('error', error), { error, level: 'error', message: 'Invalid ride' });
	});

	it('defaults the message to the attached error message', () => {
		const error = new Error('boom');
		assert.equal(toRecord('critical', { error, attributes: { a: 1 } }).message, 'boom');
	});
});

describe('SEVERITY', () => {
	it('uses OpenTelemetry severity values', () => {
		assert.deepEqual(
			(['debug', 'info', 'success', 'progress', 'warning', 'error', 'critical'] as const).map(level => SEVERITY[level].number),
			[5, 9, 9, 9, 13, 17, 21],
		);
		assert.equal(SEVERITY.critical.text, 'FATAL');
	});
});
