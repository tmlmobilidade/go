/* * */

import { splitClickHouseStatements } from '@tmlmobilidade/go-clients-clickhouse';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { readFile } from 'node:fs/promises';

/* * */

const BOOTSTRAP_FILES = [
	'eta/bootstrap/create-tables.sql',
	'eta/bootstrap/runtime-policy.sql',
	'eta/bootstrap/map-match-quality.sql',
	'eta/bootstrap/shared-road-segments.sql',
	'eta/bootstrap/mv-sync-curr-vehicle-events.sql',
	'eta/bootstrap/valid-vehicle-events.sql',
	'eta/bootstrap/dwell-tables.sql',
	'eta/bootstrap/mv-predict-node-etas.sql',
	'eta/bootstrap/live-traffic.sql',
	'eta/bootstrap/calibration-table.sql',
	'eta/bootstrap/mv-predict-trip-stop-etas.sql',
	'eta/bootstrap/prediction-snapshots.sql',
	'eta/bootstrap/arrival-labels.sql',
	'eta/bootstrap/bias-calibration.sql',
	'eta/bootstrap/stop-dwell.sql',
	'eta/bootstrap/ml-tables.sql',
	'eta/bootstrap/ml-quality-gates.sql',
	'eta/bootstrap/publishable-etas.sql',
] as const;

/* * */

/**
 * Creates the ETA database, its tables and its materialized views.
 *
 * Every statement is idempotent (`CREATE ... IF NOT EXISTS`), so this can run
 * at the start of every cycle outside production.
 */
export async function bootstrap(options: { schemaOnly?: boolean } = {}): Promise<void> {
	for (const filePath of BOOTSTRAP_FILES) {
		if (options.schemaOnly) {
			const sql = await readFile(sqlPath('hub', filePath), 'utf8');
			for (const statement of splitClickHouseStatements(sql)) {
				const executable = statement.replace(/--[^\n]*/g, '').trim();
				if (/^CREATE\s+(?:OR\s+REPLACE\s+)?MATERIALIZED\s+VIEW/i.test(executable)) continue;
				await labDb.command({ query: statement });
			}
		} else {
			await labDb.queryEachStatementFromFile(sqlPath('hub', filePath));
		}
		Logger.progress({ message: `Applied ${filePath}` });
	}
}
