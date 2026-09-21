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
	return import(`../src/logger/index.js?environment=${environment}`);
}

describe('dev vs production logging', () => {
	it('info is pretty in development and JSON in production', async () => {
		const lines: string[] = [];
		mock.method(console, 'log', (value?: unknown) => {
			lines.push(String(value ?? ''));
		});

		const { logger: loggerDev } = await loadLogger('dev');
		loggerDev.info({
			contextOrSpacesAfter: { agency_id: 'CARRIS', ride_id: 'ride-1' },
			message: 'Ride processed successfully',
		});

		const { logger: loggerPrd } = await loadLogger('prd');
		loggerPrd.info({
			contextOrSpacesAfter: { agency_id: 'CARRIS', ride_id: 'ride-1' },
			message: 'Ride processed successfully',
		});

		assert.equal(lines[0], '→ Ride processed successfully');

		const record = JSON.parse(lines[1]);
		assert.equal(record.body, 'Ride processed successfully');
		assert.equal(record.severity_text, 'INFO');
		assert.equal(record.severity_number, 9);
		assert.deepEqual(record.attributes, { agency_id: 'CARRIS', ride_id: 'ride-1' });
		assert.match(record.timestamp, /^\d{4}-\d{2}-\d{2}T/);
	});

	it('success is pretty in development and JSON in production', async () => {
		const lines: string[] = [];
		mock.method(console, 'log', (value?: unknown) => {
			lines.push(String(value ?? ''));
		});

		const { logger: loggerDev } = await loadLogger('dev');
		loggerDev.success('Done');

		const { logger: loggerPrd } = await loadLogger('prd');
		loggerPrd.success('Done');

		assert.equal(lines[0], '✓ Done');

		const record = JSON.parse(lines[1]);
		assert.equal(record.body, 'Done');
		assert.equal(record.severity_text, 'INFO');
		assert.equal(record.severity_number, 9);
	});

	it('divider prints in development and is a no-op in production', async () => {
		const lines: string[] = [];
		mock.method(console, 'log', (value?: unknown) => {
			lines.push(String(value ?? ''));
		});

		const { logger: loggerDev } = await loadLogger('dev');
		loggerDev.divider('Section', 20);
		assert.deepEqual(lines, ['', '- Section -----------', '']);

		const { logger: loggerPrd } = await loadLogger('prd');
		loggerPrd.divider('Section', 20);
		assert.equal(lines.length, 3);
	});
});
