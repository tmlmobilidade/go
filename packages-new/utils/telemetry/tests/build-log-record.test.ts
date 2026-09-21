/* * */
import { buildLogRecord } from '@/logger/build-log-record.js';
import { extractAttributes } from '@/logger/extract-attributes.js';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/* * */

describe('buildLogRecord', () => {
	it('uses OpenTelemetry severity values', () => {
		assert.deepEqual(
			[
				buildLogRecord('debug', '').severity_number,
				buildLogRecord('info', '').severity_number,
				buildLogRecord('warning', '').severity_number,
				buildLogRecord('error', '').severity_number,
				buildLogRecord('critical', '').severity_number,
			],
			[5, 9, 13, 17, 21],
		);
		assert.equal(buildLogRecord('critical', '').severity_text, 'FATAL');
	});

	it('removes logger control fields from attributes', () => {
		assert.deepEqual(
			extractAttributes({
				agency_id: 'GO',
				message: 'Ride processed successfully',
				silentConsole: false,
				undefined_value: undefined,
			}),
			{ agency_id: 'GO' },
		);
	});

	it('adds OpenTelemetry exception attributes', () => {
		const error = new TypeError('Invalid ride');
		const record = buildLogRecord('error', error.message, { ride_id: 'ride-1' }, error);

		assert.equal(record.attributes?.['exception.type'], 'TypeError');
		assert.equal(record.attributes?.['exception.message'], 'Invalid ride');
		assert.equal(record.attributes?.ride_id, 'ride-1');
		assert.match(String(record.attributes?.['exception.stacktrace']), /TypeError: Invalid ride/);
	});
});
