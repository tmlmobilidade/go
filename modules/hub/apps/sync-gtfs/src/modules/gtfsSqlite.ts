/* * */

import type { Database } from 'better-sqlite3';

import allGtfsFiles from '@/config/files.js';
import { SQLiteDatabase, type SQLiteTableInstance } from '@tmlmobilidade/sqlite';

/* * */

type GenericRow = Record<string, boolean | number | string>;

interface GtfsSqliteContext {
	database: SQLiteDatabase
	db: Database
	tables: Map<string, SQLiteTableInstance<GenericRow>>
}

/* * */

let GTFS_SQLITE_CONTEXT: GtfsSqliteContext | null = null;

/* * */

export function initGtfsSqliteContext() {
	const database = new SQLiteDatabase({ memory: true });
	const tables = new Map<string, SQLiteTableInstance<GenericRow>>();

	for (const gtfsFile of allGtfsFiles) {
		const table = database.registerTable<GenericRow>(gtfsFile._key, {
			batch_size: gtfsFile.batch_size,
			columns: gtfsFile.columns,
		});

		tables.set(gtfsFile._key, table);
	}

	GTFS_SQLITE_CONTEXT = {
		database,
		db: database.databaseInstance,
		tables,
	};

	return GTFS_SQLITE_CONTEXT;
}

export function getGtfsSqliteContext() {
	if (!GTFS_SQLITE_CONTEXT) {
		throw new Error('GTFS SQLite context not initialized.');
	}

	return GTFS_SQLITE_CONTEXT;
}
