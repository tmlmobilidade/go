/* * */

import { MongoDatabaseClient } from '@tmlmobilidade/go-clients-mongo';
import { renderAgencyValidationRulesReport } from '@tmlmobilidade/go-core-pckg-utils';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseArgs } from 'node:util';

/* * */

async function main() {
	//

	//
	// A. Fetch all agencies with their validation rules

	const { values } = parseArgs({ options: { output: { type: 'string' } } });
	const outputPath = resolve(process.env.INIT_CWD ?? process.cwd(), values.output ?? '.output/agency-validation-rules.html');

	//
	// B. Initialize the logger and timer

	Logger.init();
	const timer = new Timer();

	//
	// C. Fetch all agencies with their validation rules

	const agencies = await goDb.core.agencies.findMany({}, {
		projection: { '_id': 1, 'name': 1, 'plans.validation_rules': 1, 'short_name': 1 },
	});
	if (!agencies.length) throw new Error('No agencies found. Check the selected database environment.');

	//
	// D. Export the report

	await mkdir(dirname(outputPath), { recursive: true });
	await writeFile(outputPath, renderAgencyValidationRulesReport(agencies), 'utf8');

	Logger.info({ message: `HTML report: ${outputPath}` });
	Logger.terminate(`Exported ${agencies.length} agencies in ${timer.get()}`);
}

/* * */

/**
 * One-shot local batch: export the snapshot and close database/SSH connections.
 */
try {
	//
	// A. Run the main function

	await main();
} catch (error) {
	//
	// B. Log the error and exit with code 1

	Logger.error({ error, message: 'Failed to export agency validation rules' });
	process.exitCode = 1;
} finally {
	//
	// C. Disconnect from the database

	await MongoDatabaseClient.disconnectAll();
}
