/* * */

import assert from 'node:assert/strict';
import { afterEach, describe, it, mock } from 'node:test';

/* * */

afterEach(() => {
	mock.restoreAll();
});

/**
 * Reloads the logger with a fresh module graph so IS_DEV is evaluated again.
 */
async function loadLogger(environment: string) {
	process.env.ENVIRONMENT = environment;
	const module: typeof import('../src/logger/index.js') = await import(`../src/logger/index.js?environment=${environment}`);
	return module.Logger;
}

function captureConsole(method: 'error' | 'log'): string[] {
	const lines: string[] = [];
	mock.method(console, method, (value?: unknown) => {
		lines.push(String(value ?? ''));
	});
	return lines;
}

describe('dev vs production logging', () => {
	it('info is pretty in development and JSON in production', async () => {
		const lines = captureConsole('log');

		const entry = { attributes: { agency_id: 'CARRIS', ride_id: 'ride-1' }, message: 'Ride processed successfully' };
		(await loadLogger('dev')).info(entry);
		(await loadLogger('prd')).info(entry);

		assert.equal(lines[0], '→ Ride processed successfully');

		const record = JSON.parse(lines[1]);
		assert.equal(record.body, 'Ride processed successfully');
		assert.equal(record.severity_text, 'INFO');
		assert.equal(record.severity_number, 9);
		assert.deepEqual(record.attributes, { agency_id: 'CARRIS', ride_id: 'ride-1' });
		assert.match(record.timestamp, /^\d{4}-\d{2}-\d{2}T/);
	});

	it('success accepts a bare string in both environments', async () => {
		const lines = captureConsole('log');

		(await loadLogger('dev')).success('Done');
		(await loadLogger('prd')).success('Done');

		assert.equal(lines[0], '✓ Done');

		const record = JSON.parse(lines[1]);
		assert.equal(record.body, 'Done');
		assert.equal(record.severity_text, 'INFO');
	});

	it('error accepts a bare Error and keeps its stack', async () => {
		const lines = captureConsole('error');
		const error = new RangeError('Out of range');

		(await loadLogger('dev')).error(error);
		(await loadLogger('prd')).error(error);

		assert.equal(lines[0], '✘ Out of range');
		assert.match(lines[1], /^RangeError: Out of range/);

		const record = JSON.parse(lines[2]);
		assert.equal(record.body, 'Out of range');
		assert.equal(record.severity_text, 'ERROR');
		assert.equal(record.attributes['exception.type'], 'RangeError');
		assert.match(record.attributes['exception.stacktrace'], /RangeError: Out of range/);
	});

	it('divider prints the same in both environments', async () => {
		const lines = captureConsole('log');

		(await loadLogger('dev')).divider('Section', 20);
		(await loadLogger('prd')).divider('Section', 20);

		assert.deepEqual(lines, ['', '- Section -----------', '', '', '- Section -----------', '']);
	});
});
