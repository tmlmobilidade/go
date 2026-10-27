/* * */

import { BSQLite3, type SQLiteColumn, SQLiteDatabase } from '@tmlmobilidade/go-clients-sqlite';

import { type GtfsRow, type GtfsSQLTables } from './types.js';

/* * */

/**
 * Opens the imported file or in-memory image and registers existing SQLite tables.
 */
export function initGtfsSqlTables(source: Buffer | string): GtfsSQLTables {
	const database = new SQLiteDatabase(typeof source === 'string' ? { instancePath: source } : { databaseInstance: new BSQLite3(source), memory: true });

	// Read the actual headers rather than imposing a GTFS schema.
	const registerTable = (tableName: string) => {
		const header = database.databaseInstance.prepare(`PRAGMA table_info("${tableName}")`).all() as { name: string }[];
		if (!header.length) return undefined;
		const columns: SQLiteColumn<GtfsRow>[] = header.map(column => ({ name: column.name, type: 'TEXT' }));
		return database.registerTable<GtfsRow>(tableName, { columns });
	};

	try {
		return {
			_db: database,
			calendar_dates: registerTable('calendar_dates'),
			routes: registerTable('routes'),
			shapes: registerTable('shapes'),
			stop_times: registerTable('stop_times'),
			stops: registerTable('stops'),
			trips: registerTable('trips'),
		};
	} catch (error) {
		// Release the connection while preserving the imported file on failure.
		database.databaseInstance.close();
		throw error;
	}
}
