/* * */

import { type ClickHouseColumn, type ClickHouseSchema, type ClickHouseTableEngine } from '@/types/index.js';
import { preparePositionalQueryParams } from '@/utils/clickhouse/prepare-positional-query-params.js';
import { queryFromFile } from '@/utils/clickhouse/query-from-file.js';
import { queryFromString } from '@/utils/clickhouse/query-from-string.js';
import { validateSqlParam } from '@/utils/clickhouse/validate-sql-param.js';
import { type ClickHouseClient, ClickHouseError, type DataFormat } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export abstract class ClickHouseInterfaceTemplate<T extends object> {
	//

	protected readonly abstract databaseName: string;
	protected readonly abstract schema: ClickHouseSchema<T>;
	protected readonly abstract tableName: string;

	protected readonly engine: ClickHouseTableEngine = 'MergeTree';
	protected readonly orderBy: string = '_id';
	protected readonly partitionBy: null | string = null;

	private client: ClickHouseClient;

	/**
	 * Disallow direct instantiation of the service.
	 * Use getClient() instead to ensure singleton behavior.
	 */
	protected constructor() {}

	/**
	 * Executes a COUNT query on the ClickHouse table using the service's client.
	 * @param select The columns to select in the query (e.g., `"*"`, `"column1, column2"`).
	 * @param where The WHERE clause to filter the results (e.g., `"id = 1"`).
	 * @param params Optional key-value substitutions applied to the WHERE clause (replaces $1, $2, etc.).
	 * @returns A promise that resolves to an array of results matching the query.
	 */
	public async count(select: string, where: string, params?: Record<string, number | string>): Promise<number> {
		const result = await queryFromString<{ count: number }>(this.client, `SELECT COUNT(${select}) AS count FROM "${this.databaseName}"."${this.tableName}" WHERE ${where}`, params);
		return result.length > 0 ? result[0].count : 0;
	}

	/**
	 * Executes a DELETE query on the ClickHouse table using the service's client.
	 * @param where The WHERE clause to filter the results (e.g., `"id = 1"`).
	 * @param params Optional key-value substitutions applied to the WHERE clause (replaces $1, $2, etc.).
	 * @returns A promise that resolves when the delete operation is complete.
	 */
	public async delete(where: string, params?: Record<string, number | string>): Promise<void> {
		const preparedQuery = preparePositionalQueryParams(`DELETE FROM "${this.databaseName}"."${this.tableName}" WHERE ${where}`, params);
		await this.client.command({
			query: preparedQuery.query,
			query_params: preparedQuery.query_params,
		});
	}

	/**
	 * Executes a DISTINCT query on the ClickHouse table using the service's client.
	 * @param select The columns to select in the query (e.g., `"*"`, `"column1, column2"`).
	 * @param where The WHERE clause to filter the results (e.g., `"id = 1"`).
	 * @param params Optional key-value substitutions applied to the WHERE clause (replaces $1, $2, etc.).
	 * @returns A promise that resolves to an array of distinct values matching the query.
	 */
	public async distinct<T>(field: keyof T, where: string, params?: Record<string, number | string>): Promise<T[keyof T][]> {
		const result = await queryFromString<T>(this.client, `SELECT ${String(field)} FROM "${this.databaseName}"."${this.tableName}" WHERE ${where}`, params);
		return result.map(doc => doc[field]);
	}

	/**
	 * Provides access to the ClickHouse client instance,
	 * initializing it if it has not already been created.
	 * @returns A promise that resolves to the ClickHouse client instance.
	 * @warning Use with caution: direct access to the client allows for executing arbitrary queries.
	 */
	public async getClient(): Promise<ClickHouseClient> {
		if (!this.client) await this.init();
		return this.client;
	}

	/**
	 * Returns the name of the database used by this service.
	 */
	async getDatabaseName() {
		return this.databaseName;
	}

	/**
	 * Returns the name of the table used by this service.
	 */
	async getTableName() {
		return this.tableName;
	}

	/**
	 * Inserts data into a specified ClickHouse table using the service's client.
	 * @param format The format of the data being inserted (default is 'JSONEachRow').
	 * @param values An array of data objects to insert into the table.
	 * @returns A promise that resolves when the data is inserted successfully.
	 */
	public async insert<T>(format: DataFormat = 'JSONEachRow', values: T[]) {
		return this.client.insert<T>({
			format: format,
			table: `"${this.databaseName}"."${this.tableName}"`,
			values: values,
		});
	}

	/**
	 * Executes a simple SELECT query on the ClickHouse table using the service's client.
	 * @param select The columns to select in the query (e.g., `"*"`, `"column1, column2"`).
	 * @param where The WHERE clause to filter the results (e.g., `"id = 1"`).
	 * @param params Optional key-value substitutions applied to the WHERE clause (replaces $1, $2, etc.).
	 * @returns A promise that resolves to an array of results matching the query.
	 */
	public async select(select: string, where: string, params?: Record<string, number | string>): Promise<T[]> {
		return await queryFromString<T>(this.client, `SELECT ${select} FROM "${this.databaseName}"."${this.tableName}" WHERE ${where}`, params);
	}

	/**
	 * Abstract method to establish a connection to ClickHouse.
	 * This method must be implemented by subclasses to define the specific connection logic,
	 * such as handling SSH tunneling or configuring connection parameters.
	 */
	protected abstract connectToClient(): Promise<ClickHouseClient>;

	/**
	 * Initializes the ClickHouse client and ensures that the specified database and table exist.
	 * This method should be called before performing any operations on the database or table.
	 * It handles the asynchronous setup process and logs any errors that occur during initialization.
	 * @throws Will throw an error if the client initialization or database/table setup fails.
	 * @returns A promise that resolves when the initialization process is complete.
	 */
	protected async init() {
		// Skip if already initialized
		if (this.client) return;
		// Validate required properties before attempting to connect
		if (!this.databaseName) throw new Error('CLICKHOUSE: databaseName is required.');
		if (!this.tableName) throw new Error('CLICKHOUSE: tableName is required.');
		if (!this.schema || Object.entries(this.schema).length === 0) throw new Error('CLICKHOUSE: schema is required and cannot be empty.');
		// Connect to the ClickHouse client
		this.client = await this.connectToClient();
		// Ensure the database and table exist, and perform any additional setup
		await this.ensureDatabase();
		await this.ensureTable();
		await this.postInit();
	}

	/**
	 * Optional override for custom setup logic:
	 * indexes, materialized views, constraints, etc.
	 */
	protected async postInit(): Promise<void> {
		// no-op by default
	}

	/**
	 * Executes a query from a .sql file with optional parameter substitutions.
	 * @param filePath Absolute or relative path to the .sql file.
	 * @param params Optional key-value substitutions applied to the query (replaces {key} placeholders).
	 * @returns Query result rows typed as `T`.
	 * @example
	 * // Given a SQL file "get_users.sql" with the content:
	 * // SELECT * FROM users WHERE created_at >= {start_date} AND created_at <= {end_date}
	 * const users = await clickhouseService.queryFromFile<User>('get_users.sql', {
	 *   start_date: '2024-01-01',
	 *   end_date: '2024-12-31',
	 * });
	*/
	public async queryFromFile<T>(filePath: string, params?: Record<string, number | string>): ReturnType<typeof queryFromFile<T>> {
		return await queryFromFile<T>(this.client, filePath, params);
	}

	/**
	 * Executes a query from a string.
	 * @param client The ClickHouse client to use for executing the query.
	 * @param query The SQL query to execute, with optional {key} placeholders for parameters.
	 * @param params Optional key-value substitutions applied to the query (replaces {key} placeholders).
	 * @returns Query result rows typed as `T`.
	 * @example
	 * const users = await queryFromString<User>(clickhouseClient,
	 *   'SELECT * FROM users WHERE created_at >= {start_date} AND created_at <= {end_date}',
	 *   { start_date: '2024-01-01', end_date: '2024-12-31' }
	 * );
	*/
	public async queryFromString<T>(query: string, params?: Record<string, number | string>): ReturnType<typeof queryFromString<T>> {
		return await queryFromString<T>(this.client, query, params);
	}

	private async ensureDatabase(): Promise<void> {
		// Validate the inputs are safe identifiers to prevent SQL injection
		if (!validateSqlParam(this.databaseName, false)) throw new Error(`CLICKHOUSE [${this.databaseName}]: Unsafe database name provided.`);
		// Perform the query to create the database if it does not exist
		try {
			await this.client.command({ query: `CREATE DATABASE IF NOT EXISTS "${this.databaseName}"` });
			Logger.info(`CLICKHOUSE [${this.databaseName}]: Database created.`);
		} catch (error) {
			Logger.error(`CLICKHOUSE [${this.databaseName}]: Error @ createDatabase(): ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Ensures that the specified table exists in ClickHouse, creating it if it does not already exist.
	 * This method performs input validation to prevent SQL injection and logs the outcome of the operation.
	 * It constructs a CREATE TABLE query based on the provided schema and engine type, and executes it using the client.
	 * @throws Will throw an error if any of the inputs are unsafe or if the table creation query fails.
	 * @returns A promise that resolves when the table is ensured to exist.
	 */
	private async ensureTable(): Promise<void> {
		// Validate the inputs are safe identifiers to prevent SQL injection
		if (!validateSqlParam(this.databaseName, false)) throw new Error(`CLICKHOUSE [${this.databaseName}]: Unsafe database name provided.`);
		if (!validateSqlParam(this.tableName, false)) throw new Error(`CLICKHOUSE [${this.tableName}]: Unsafe table name provided.`);
		// Validate the schema columns are safe identifiers
		const unsafeColumns = Object.keys(this.schema).filter(key => !validateSqlParam(key, false));
		if (unsafeColumns.length > 0) throw new Error(`CLICKHOUSE [${this.tableName}]: Unsafe column names provided: ${unsafeColumns.join(', ')}.`);
		// Ensure the database exists before creating the table
		await this.ensureDatabase();
		// Setup the full CREATE TABLE query
		const createTableQuery = `
			CREATE TABLE IF NOT EXISTS "${this.databaseName}"."${this.tableName}" (
				${Object.entries<ClickHouseColumn>(this.schema).map(([key, column]) => `${key} ${column.type}`).join(', ')}
			) ENGINE = ${this.getEngineString()}
			${this.orderBy ? `ORDER BY (${this.orderBy})` : ''}
			${this.partitionBy ? `PARTITION BY (${this.partitionBy})` : ''}
		`;
		// Perform the query to create the table
		try {
			await this.client.command({ query: createTableQuery });
			Logger.info(`CLICKHOUSE [${this.tableName}]: Table created.`);
		} catch (error) {
			// If the error is not an ACCESS_DENIED, throw it right away
			if (!(error instanceof ClickHouseError) || error.code !== '497') {
				Logger.error(`CLICKHOUSE [${this.tableName}]: Error @ createTable(): ${(error as Error).message}`);
				throw error;
			}

			// If the error is an ACCESS_DENIED, check if the table exists
			try {
				const resultSet = await this.client.query({
					format: 'JSONEachRow',
					query: `SHOW TABLES FROM "${this.databaseName}" LIKE '${this.tableName}'`,
				});
				const tables = await resultSet.json();
				if (Array.isArray(tables) && tables.length > 0) return;

				Logger.error(`CLICKHOUSE [${this.tableName}]: ACCESS_DENIED and table does not exist. ${error.message}`);
				throw error;
			} catch (verifyError) {
				//

				Logger.error(`CLICKHOUSE [${this.tableName}]: Failed to verify table existence after ACCESS_DENIED: ${(verifyError as Error).message}`);
				throw verifyError;
			}
		}
	}

	/**
	 * Constructs the appropriate engine string based on the provided engine type.
	 * @throws Will throw an error if an unsupported engine type is provided.
	 */
	private getEngineString(): string {
		switch (this.engine) {
			case 'MergeTree':
				return `MergeTree()`;
			case 'ReplacingMergeTree':
				return `ReplacingMergeTree()`;
			default:
				throw new Error(`CLICKHOUSE [${this.databaseName}/${this.tableName}]: Unsupported engine type: ${this.engine}`);
		}
	}

	//
}
