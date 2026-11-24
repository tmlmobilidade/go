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
	await writeFile(join(directory, 'agency.txt'), 'agency_id,agency_name\n01,Example Transit\n');
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
			rules: [
				{ rule_id: 'agency_file_exists', severity: 'forbidden' },
				{ modifiers: { type: 'options', values: [] }, rule_id: 'agency_name_valid', severity: 'info' },
				{
					modifiers: { type: 'compare', values: [{ key: '01', value: 'Other Transit' }] },
					rule_id: 'agency_id_matched_with_agency_name',
					severity: 'warning',
				},
			],
			source: { path },
		}),
	]);

	assert.deepEqual(valid, { results: [], totals: { errors: 0, infos: 0, warnings: 0 } });
	assert.deepEqual(invalid.totals, { errors: 1, infos: 1, warnings: 1 });
	const forbidden = invalid.results.find(result => result.rule_id === 'agency_file_exists');
	assert.equal(forbidden.severity, 'error');
	assert.deepEqual(forbidden.messages[0], { message: 'The forbidden agency.txt file is present.', rows: [] });
	const options = invalid.results.find(result => result.rule_id === 'agency_name_valid');
	assert.deepEqual(options.messages[0].rows, [2]);
	await assert.rejects(validateGtfs({
		rules: [{ options: [], rule_id: 'agency_name_valid', severity: 'error' }],
		source: { path },
	}), error => error.issues?.some(issue => issue.code === 'unrecognized_keys' && issue.keys.includes('options')));
	await assert.rejects(validateGtfs({
		rules: [{ rule_id: 'agency_file_exists', severity: 'error' }],
		source: { path: join(directory, 'missing.zip') },
	}), /GTFS validation failed \(2\)/);
});
