/* * */

import { BSQLite3, type SQLiteColumn, SQLiteDatabase } from '@tmlmobilidade/go-clients-sqlite';
import { type OperationalDateInt, OperationalDateIntSchema } from '@tmlmobilidade/go-types-shared';

import { type GtfsSQLTables } from './types/index.js';

/* * */

/**
 * Opens the imported file or in-memory image and registers existing SQLite tables.
 */

export function initGtfsSqlTables<T extends GtfsSQLTables>(source: Buffer | string): T {
	const database = new SQLiteDatabase(typeof source === 'string' ? { instancePath: source } : { databaseInstance: new BSQLite3(source), memory: true });

	// Read the actual headers rather than imposing a GTFS schema.
	const registerTable = (tableName: string) => {
		const header = database.databaseInstance.prepare(`PRAGMA table_info("${tableName}")`).all() as { name: string }[];
		if (!header.length) throw new Error(`Table ${tableName} not found`);
		const columns: SQLiteColumn<any>[] = header.map(column => ({ name: column.name, type: 'TEXT' }));
		return database.registerTable<any>(tableName, { columns });
	};

	try {
		const calendarDates = new Map<string, OperationalDateInt[]>();
		const calendarDatesTable = registerTable('calendar_dates');
		if (calendarDatesTable) {
			const rows = calendarDatesTable.query<{ date: string, service_id: string }>(
				'SELECT DISTINCT service_id, date FROM calendar_dates WHERE exception_type = \'1\'',
			);
			for (const row of rows) {
				const dates = calendarDates.get(row.service_id) ?? [];
				dates.push(OperationalDateIntSchema.parse(row.date));
				calendarDates.set(row.service_id, dates);
			}
		}

		return {
			_db: database,
			calendar_dates: Object.fromEntries(calendarDates),
			routes: registerTable('routes'),
			shapes: registerTable('shapes'),
			stop_times: registerTable('stop_times'),
			stops: registerTable('stops'),
			trips: registerTable('trips'),
		} as unknown as T;
	} catch (error) {
		// Release the connection while preserving the imported file on failure.
		database.databaseInstance.close();
		throw error;
	}
}
