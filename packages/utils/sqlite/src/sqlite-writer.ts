/* * */

import { SQLiteTableInstance } from '@/sqlite-db.js';
import { type SQLiteTable } from '@/types.js';
import { generateRandomString } from '@tmlmobilidade/go-utils-strings';
import BSQLite3, { type Database } from 'better-sqlite3';

/* * */

/**
 * @deprecated Use `SQLiteDatabase` instead.
 */
export class SQLiteWriter<T> extends SQLiteTableInstance<T> {
	//

	//
	// Properties
	public readonly instanceName: string;
	public readonly instancePath: string;

	//
	// Constructor
	constructor(params: SQLiteTable<T>) {
		//

		//
		// Otherwise, generate a random instance name and path
		// and create a new database instance

		const instanceName = generateRandomString({ type: 'alphabetic' });
		const instancePath = `/tmp/${instanceName}.db`;

		const db = SQLiteWriter.createDatabase(instancePath);

		super(db, instanceName, params);

		this.instanceName = instanceName;
		this.instancePath = instancePath;
	}

	//
	//  Methods

	private static createDatabase(path: string): Database {
		//
		// Set up the database
		const db = new BSQLite3(path);

		db.pragma('journal_mode = WAL');
		db.pragma('synchronous = OFF');
		db.pragma('temp_store = MEMORY');

		//
		// Return the database
		return db;
	}
}
