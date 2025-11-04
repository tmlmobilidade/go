/* * */

import { generateRandomString } from '@tmlmobilidade/go-utils-strings';
import BSQLite3, { type Database } from 'better-sqlite3';

/* * */

/**
 * A map-like structure backed by SQLite for persistent key-value storage.
 * Use it to store and retrieve data across sessions without memory constraints.
 * The API is similar to the native javascript Map object.
 */
export class SQLiteMap<K extends string, V> {
	//

	/**
	 * Returns the number of entries in the map.
	 */
	get size(): number {
		const row = this.databaseInstance
			.prepare(`SELECT COUNT(*) as count FROM map`)
			.get() as { count: number };
		return row.count;
	}

	private databaseInstance: Database;

	constructor() {
		//

		//
		// Set up a new database instance

		const databaseFileName = generateRandomString();

		this.databaseInstance = new BSQLite3(`/tmp/${databaseFileName}.db`);

		//
		// Create a new table if it doesn't exist

		this.databaseInstance.pragma('journal_mode = WAL');
		this.databaseInstance.pragma('synchronous = NORMAL');

		this.databaseInstance
			.prepare(`CREATE TABLE IF NOT EXISTS map (key TEXT PRIMARY KEY, value TEXT NOT NULL)`)
			.run();

		//
	}

	/**
	 * Clears all entries from the map.
	 */
	clear(): void {
		this.databaseInstance
			.prepare(`DELETE FROM map`)
			.run();
	}

	/**
	 * Deletes a key-value pair from the map.
	 * @param key The key of the entry to delete.
	 * @returns True if the entry was deleted, false if it didn't exist.
	 */
	delete(key: K): boolean {
		const result = this.databaseInstance
			.prepare(`DELETE FROM map WHERE key = ?`)
			.run(key);
		return result.changes > 0;
	}

	/**
	 * Returns an iterator over the entries in the map.
	 */
	* entries(): IterableIterator<[K, V]> {
		const statement = this.databaseInstance.prepare(`SELECT key, value FROM map`);
		for (const row of statement.iterate() as IterableIterator<{ key: string, value: string }>) {
			yield [JSON.parse(row.key), JSON.parse(row.value)];
		}
	}

	/**
	 * Retrieves the value associated with the given key.
	 * @param key The key of the entry to retrieve.
	 * @returns The value associated with the key, or undefined if it doesn't exist.
	 */
	get(key: K): undefined | V {
		const row = this.databaseInstance
			.prepare(`SELECT value FROM map WHERE key = ?`)
			.get(key) as undefined | { value: string };
		return row ? JSON.parse(row.value) : undefined;
	}

	/**
	 * Checks if the map contains a value for the given key.
	 * @param key The key to check.
	 * @returns True if the key exists, false otherwise.
	 */
	has(key: K): boolean {
		const row = this.databaseInstance
			.prepare(`SELECT 1 FROM map WHERE key = ?`)
			.get(key);
		return !!row;
	}

	/**
	 * Returns an iterator over the keys in the map.
	 */
	* keys(): IterableIterator<K> {
		const statement = this.databaseInstance.prepare(`SELECT key FROM map`);
		for (const row of statement.iterate() as IterableIterator<{ key: string }>) {
			yield JSON.parse(row.key);
		}
	}

	/**
	 * Sets the value for the given key.
	 * @param key The key of the entry to set.
	 * @param value The value to associate with the key.
	 */
	set(key: K, value: V): void {
		this.databaseInstance
			.prepare(`INSERT OR REPLACE INTO map (key, value) VALUES (?, ?)`)
			.run(key, JSON.stringify(value));
	}

	/**
	 * Returns an iterator over the entries in the map.
	 */
	[Symbol.iterator](): IterableIterator<[K, V]> {
		return this.entries();
	}

	/**
	 * Returns an iterator over the values in the map.
	 */
	* values(): IterableIterator<V> {
		const statement = this.databaseInstance.prepare(`SELECT value FROM map`);
		for (const row of statement.iterate() as IterableIterator<{ value: string }>) {
			yield JSON.parse(row.value) as V;
		}
	}

	//
}
