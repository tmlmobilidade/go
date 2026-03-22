/* * */

import { ClickhouseService } from '@/service.js';
import { type ClickHouseColumn, type ClickHouseTableEngine } from '@/types.js';
import { isSafeIdentifier } from '@/utils.js';
import { type DataFormat } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export class ClickhouseTable extends ClickhouseService {
	//

	public static readonly DatabaseName: string;

	public static readonly TableName: string;

	public static readonly TableSchema: ClickHouseColumn<any>[];

	static async createDatabase(...args: Parameters<ClickhouseTable['createDatabase']>) {
		const instance = await this.getInstance();
		return instance.createDatabase(...args);
	}

	/**
	 * Inserts data into a specified ClickHouse table using the service's client.
	 * @param databaseName The name of the database where the table is located.
	 * @param tableName The name of the table to insert data into.
	 * @param format The format of the data being inserted (default is 'JSONEachRow').
	 * @param values An array of data objects to insert into the table.
	 * @returns A promise that resolves when the data is inserted successfully.
	 */
	public static async insert<T>(format: DataFormat = 'JSONEachRow', values: T[]) {
		const instance = await this.getInstance();
		return instance.client.insert<T>({
			format: format,
			table: `"${this.DatabaseName}"."${this.TableName}"`,
			values: values,
		});
	}

	/**
	 * Creates a new table in ClickHouse with the specified schema, orderBy, and engine.
	 * @param schema An array of column definitions for the table schema.
	 * @param orderBy The column name to use in the ORDER BY clause (default is '_id').
	 * @param engine The ClickHouse table engine to use (default is 'ReplicatedMergeTree').
	 * @throws Will throw an error if any of the inputs are unsafe or if the table creation fails.
	 * @returns A promise that resolves when the table is created successfully.
	 * @example
	 * await clickhouseService.createTable('my_database', 'my_table', [
	 *   { name: 'id', type: 'UInt64' },
	 *   { name: 'name', type: 'String' },
	 *   { name: 'created_at', type: 'DateTime' },
	 * ], 'id', 'ReplicatedMergeTree');
	 */
	protected static async createTable<T>(databaseName: string, tableName: string, schema: ClickHouseColumn<T>[], orderBy = '_id', engine: ClickHouseTableEngine = 'ReplicatedMergeTree') {
		// Validate the inputs are safe identifiers to prevent SQL injection
		if (!isSafeIdentifier(databaseName)) throw new Error(`CLICKHOUSE [${databaseName}]: Unsafe database name provided.`);
		if (!isSafeIdentifier(tableName)) throw new Error(`CLICKHOUSE [${tableName}]: Unsafe table name provided.`);
		if (!isSafeIdentifier(engine)) throw new Error(`CLICKHOUSE [${engine}]: Unsafe engine type provided.`);
		if (!isSafeIdentifier(orderBy)) throw new Error(`CLICKHOUSE [${orderBy}]: Unsafe orderBy clause provided.`);
		// Validate the schema columns are safe identifiers
		const unsafeColumns = schema.filter(column => !isSafeIdentifier(column.name)).map(column => column.name);
		if (unsafeColumns.length > 0) throw new Error(`CLICKHOUSE [${tableName}]: Unsafe column names provided: ${unsafeColumns.join(', ')}.`);
		// Ensure the database exists before creating the table
		await this.createDatabase(databaseName);
		// Setup the engine string based on the provided engine type
		const engineString = this.getEngineQueryString(engine, tableName);
		// Setup the full CREATE TABLE query
		const createTableQuery = `
			CREATE TABLE IF NOT EXISTS "${databaseName}"."${tableName}" ON CLUSTER default_cluster (
				${schema.map(column => `${column.name} ${column.type}`).join(', ')}
			) ENGINE = ${engineString}
			ORDER BY ${orderBy}
		`;
		// Perform the query to create the table
		try {
			const instance = await this.getInstance();
			await instance.client.command({ query: createTableQuery });
			Logger.info(`CLICKHOUSE [${tableName}]: Table created.`);
		} catch (error) {
			Logger.error(`CLICKHOUSE [${tableName}]: Error @ createTable(): ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Deletes a table in ClickHouse if it exists.
	 * @param databaseName The name of the database where the table is located.
	 * @param tableName The name of the table to delete.
	 * @throws Will throw an error if any of the inputs are unsafe or if the table deletion fails.
	 * @returns A promise that resolves when the table is deleted successfully.
	 * @override This method can be overridden in subclasses to prevent accidental deletion of critical tables.
	 */
	protected static async deleteTable(databaseName: string, tableName: string) {
		// Validate the table name
		if (!isSafeIdentifier(databaseName)) throw new Error(`CLICKHOUSE [${databaseName}]: Unsafe database name provided.`);
		if (!isSafeIdentifier(tableName)) throw new Error(`CLICKHOUSE [${tableName}]: Unsafe table name provided.`);
		// Perform the query to delete the table
		try {
			const instance = await this.getInstance();
			await instance.client.command({ query: `DROP TABLE IF EXISTS "${databaseName}"."${tableName}" ON CLUSTER default_cluster` });
			Logger.info(`CLICKHOUSE [${tableName}]: Table deleted.`);
		} catch (error) {
			Logger.error(`CLICKHOUSE [${tableName}]: Error @ deleteTable(): ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Verifies that a table exists in ClickHouse by attempting to retrieve its schema.
	 * @throws Will throw an error if the table does not exist or if the table name is unsafe.
	 * @param databaseName The name of the database where the table is located.
	 * @param tableName The name of the table to verify.
	 * @param throwIfNotExists If true, the function will throw an error if the table does not exist.
	 * @instanceMethod This is the instance method. Use the static version at `ClickhouseService.verifyTableExists()`.
	 * @returns A boolean indicating whether the table exists
	 */
	protected static async verifyTableExists(databaseName: string, tableName: string, throwIfNotExists = true): Promise<boolean> {
		try {
			// Validate the table name
			if (!isSafeIdentifier(tableName)) throw new Error(`CLICKHOUSE [${tableName}]: Unsafe table name provided.`);
			if (!isSafeIdentifier(databaseName)) throw new Error(`CLICKHOUSE [${databaseName}]: Unsafe database name provided.`);
			const instance = await this.getInstance();
			const response = await instance.client.query({ format: 'JSONEachRow', query: `EXISTS TABLE "${databaseName}"."${tableName}";` });
			const responseData = await response.json<{ result: number }>();
			const tableExists = responseData[0]?.result === 1;
			// Throw an error if the table does not exist and throwIfNotExists is true
			if (!tableExists && throwIfNotExists) throw new Error(`CLICKHOUSE [${tableName}]: Table "${databaseName}"."${tableName}" does not exist.`);
			// Otherwise, return result
			return tableExists;
		} catch (error) {
			Logger.error(`CLICKHOUSE [${tableName}]: Error @ verifyTableExists(): ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Constructs the appropriate engine query string based on the provided engine type.
	 * @param engine The ClickHouse table engine type.
	 * @param tableName The name of the table (used for ReplicatedMergeTree).
	 * @returns The engine query string to be used in the CREATE TABLE statement.
	 * @throws Will throw an error if an unsupported engine type is provided.
	 */
	private static getEngineQueryString(engine: ClickHouseTableEngine, tableName: string): string {
		switch (engine) {
			case 'ReplicatedMergeTree':
				return `ReplicatedMergeTree('/clickhouse/tables/{shard}/${tableName}', '{replica}')`;
			default:
				throw new Error(`CLICKHOUSE [${tableName}]: Unsupported engine type: ${engine}`);
		}
	}

	/**
	 * Creates a new database in ClickHouse if it does not already exist.
	 * @throws Will throw an error if the database name is unsafe or if the database creation fails.
	 * @returns A promise that resolves when the database is created successfully.
	 */
	protected async createDatabase(databaseName: string) {
		// Validate the inputs are safe identifiers to prevent SQL injection
		if (!isSafeIdentifier(databaseName)) throw new Error(`CLICKHOUSE [${databaseName}]: Unsafe database name provided.`);
		// Setup the full CREATE TABLE query
		const createDatabaseQuery = `CREATE DATABASE IF NOT EXISTS "${databaseName}" on CLUSTER default_cluster;`;
		// Perform the query to create the table
		try {
			await this.client.command({ query: createDatabaseQuery });
			Logger.info(`CLICKHOUSE [${databaseName}]: Database created.`);
		} catch (error) {
			Logger.error(`CLICKHOUSE [${databaseName}]: Error @ createDatabase(): ${(error as Error).message}`);
			throw error;
		}
	}

	//
}
