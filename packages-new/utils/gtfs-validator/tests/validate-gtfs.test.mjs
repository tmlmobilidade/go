import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

import { validateGtfs } from '@tmlmobilidade/go-utils-gtfs-validator';

test('returns completed reports and rejects a failed feed import', async (t) => {
	const directory = await mkdtemp(join(tmpdir(), 'gtfs-validator-test-'));
	t.after(() => rm(directory, { force: true, recursive: true }));
	const path = join(directory, 'feed.zip');
	await writeFile(join(directory, 'agency.txt'), 'agency_name\nExample\n');
	execFileSync('zip', ['-q', path, 'agency.txt'], { cwd: directory });

	const [valid, invalid] = await Promise.all([
		validateGtfs({
			concurrency: 2,
			rules: [
				{ rule_id: 'agency_file_exists', severity: 'error' },
				{ depends_on: ['agency_file_exists'], rule_id: 'agency_name_exists', severity: 'error' },
			],
			source: { path },
		}),
		validateGtfs({
			rules: [{ rule_id: 'agency_file_exists', severity: 'forbidden' }],
			source: { path },
		}),
	]);

	assert.deepEqual(valid, { messages: [], total_errors: 0, total_warnings: 0 });
	assert.equal(invalid.total_errors, 1);
	assert.equal(invalid.messages[0].severity, 'forbidden');
	assert.equal(invalid.messages[0].messages[0].severity, 'forbidden');
	await assert.rejects(validateGtfs({
		rules: [{ rule_id: 'agency_file_exists', severity: 'error' }],
		source: { path: join(directory, 'missing.zip') },
	}), /GTFS validation failed \(2\)/);
});
