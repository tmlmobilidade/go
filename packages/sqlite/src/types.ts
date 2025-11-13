/* * */

import { type Database } from 'better-sqlite3';

/* * */

export interface SQLiteDatabaseConfig {
	/**
	 * The BetterSQLite3 database instance to use.
	 * If not provided, a temporary database will be created.
	 */
	databaseInstance?: Database

	/**
	 * Optional custom instance name.
	 * If not provided, a random name will be generated.
	 */
	instanceName?: string

	/**
	 * Optional custom database file path.
	 * If not provided, a temporary file path will be generated.
	 */
	instancePath?: string

	/**
	 * If true, the database will be created in memory.
	 * Defaults to false.
	 * Note: If using in-memory, data will be lost when the process exits.
	 * Also, multiple instances will not share the same data.
	 * Use only for testing or ephemeral data storage.
	 * If true, instancePath is ignored.
	 * @default false
	 */
	memory?: boolean

}

/* * */

export interface SQLiteColumn<T> {
	indexed?: boolean
	name: Extract<keyof T, string>
	not_null?: boolean
	primary_key?: boolean
	type: 'BLOB' | 'BOOLEAN' | 'INTEGER' | 'REAL' | 'TEXT'
}

/* * */

export interface SQLiteTable<T> {

	/**
	 * The maximum number of items to hold in memory
	 * before flushing to the database.
	 * @default 3000
	 */
	batch_size?: number

	/**
	 * Columns in the table.
	 * Order matters for INSERT.
	 * Must be keys of T or custom names.
	 */
	columns: SQLiteColumn<T>[]

}
