/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { sqlPath } from '@tmlmobilidade/go-utils-sql';
import { Logger } from '@tmlmobilidade/logger';

/* * */

const BOOTSTRAP_FILES = [
	'eta/bootstrap/create-tables.sql',
	'eta/bootstrap/mv-sync-curr-vehicle-events.sql',
	'eta/bootstrap/mv-predict-node-etas.sql',
	'eta/bootstrap/mv-predict-trip-stop-etas.sql',
] as const;

/* * */

/**
 * Creates the ETA database, its tables and its materialized views.
 *
 * Every statement is idempotent (`CREATE ... IF NOT EXISTS`), so this can run
 * at the start of every cycle outside production.
 */
export async function bootstrap(): Promise<void> {
	for (const filePath of BOOTSTRAP_FILES) {
		await labDb.queryEachStatementFromFile(sqlPath('hub', filePath));
		Logger.progress({ message: `Applied ${filePath}` });
	}
}
