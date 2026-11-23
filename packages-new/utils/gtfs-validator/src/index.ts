/* * */

import { type GtfsValidatorCliRule, GtfsValidatorCliRuleSchema, type GtfsValidatorCliSummary, GtfsValidatorCliSummarySchema } from '@tmlmobilidade/go-types-gtfs-validator';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* * */

const executablePath = fileURLToPath(new URL('./bin/gtfs-validator', import.meta.url));

export interface GtfsValidatorConfig {
	/** Maximum concurrent rules. Defaults to 1. */
	concurrency?: number
	rules: readonly GtfsValidatorCliRule[]
	/** Local ZIP path relative to the caller's working directory, or an HTTP(S) URL. */
	source: { path: string, url?: never } | { path?: never, url: string }
}

/** Runs the bundled Go validator and returns its report, including any error findings. */
export async function validateGtfs({ concurrency, rules, source }: GtfsValidatorConfig): Promise<GtfsValidatorCliSummary> {
	const rulesJson = JSON.stringify(GtfsValidatorCliRuleSchema.array().parse(rules));
	const directory = await mkdtemp(join(tmpdir(), 'validate-gtfs-'));

	try {
		const rulesPath = join(directory, 'rules.json');
		const reportPath = join(directory, 'report.json');
		const args = ['-rules', rulesPath, '-result', reportPath];
		if (source.path !== undefined) args.push('-path', source.path);
		if (source.url !== undefined) args.push('-url', source.url);
		if (concurrency !== undefined) args.push('-concurrency', String(concurrency));

		await writeFile(rulesPath, rulesJson);
		await runValidator(args);
		return GtfsValidatorCliSummarySchema.parse(JSON.parse(await readFile(reportPath, 'utf8')));
	} finally {
		await rm(directory, { force: true, recursive: true });
	}
}

/* * */

function runValidator(args: string[]): Promise<void> {
	return new Promise((resolve, reject) => {
		const child = spawn(executablePath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
		let stderr = '';
		child.stderr.setEncoding('utf8').on('data', (chunk: string) => {
			stderr += chunk;
			process.stderr.write(chunk);
		});
		child.once('error', reject);
		child.once('close', (code, signal) => {
			// The CLI uses exit 1 for a completed run with error findings.
			if (code === 0 || code === 1) return resolve();
			reject(new Error(`GTFS validation failed (${signal ?? code}): ${stderr.trim()}`));
		});
	});
}
