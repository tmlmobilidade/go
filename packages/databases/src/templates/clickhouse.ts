/* * */

import { type ClickHouseColumn, type ClickHouseTableEngine } from '@/types/index.js';
import { validateSqlParam } from '@/utils/validate-sql-param.js';
import { type ClickHouseClient, type DataFormat } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export abstract class ClickHouseInterfaceTemplate<T> {
	//

	public readonly abstract databaseName: string;
	public readonly engine: ClickHouseTableEngine = 'ReplicatedMergeTree';
	public readonly orderBy: string = '_id';
	public readonly abstract schema: ClickHouseColumn<T>[];
	public readonly abstract tableName: string;

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
	 * @returns A promise that resolves to an array of results matching the query.
	 */
	public async count(select: string, where: string): Promise<T[]> {
		const result = await this.client.query({
			format: 'JSONEachRow',
			query: `SELECT COUNT(${select}) FROM "${this.databaseName}"."${this.tableName}" WHERE ${where}`,
		});
		return result.json();
	}

	/**
	 * Inserts data into a specified ClickHouse table using the service's client.
	 * @param databaseName The name of the database where the table is located.
	 * @param tableName The name of the table to insert data into.
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
	 * @returns A promise that resolves to an array of results matching the query.
	 */
	public async select(select: string, where: string): Promise<T[]> {
		const result = await this.client.query({
			format: 'JSONEachRow',
			query: `SELECT ${select} FROM "${this.databaseName}"."${this.tableName}" WHERE ${where}`,
		});
		return result.json();
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
		// Validate required properties before attempting to connect
		if (!this.databaseName) throw new Error('CLICKHOUSE: databaseName is required.');
		if (!this.tableName) throw new Error('CLICKHOUSE: tableName is required.');
		if (!this.schema || this.schema.length === 0) throw new Error('CLICKHOUSE: schema is required and cannot be empty.');
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
	 * Ensures that the specified database exists in ClickHouse, creating it if it does not already exist.
	 * This method performs input validation to prevent SQL injection and logs the outcome of the operation.
	 * @throws Will throw an error if the database name is unsafe or if the database creation query fails.
	 * @returns A promise that resolves when the database is ensured to exist.
	 */
	private async ensureDatabase(): Promise<void> {
		// Validate the inputs are safe identifiers to prevent SQL injection
		if (!validateSqlParam(this.databaseName, false)) throw new Error(`CLICKHOUSE [${this.databaseName}]: Unsafe database name provided.`);
		// Perform the query to create the database if it does not exist
		try {
			await this.client.command({ query: `CREATE DATABASE IF NOT EXISTS "${this.databaseName}" on CLUSTER default_cluster;` });
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
		if (!validateSqlParam(this.engine, false)) throw new Error(`CLICKHOUSE [${this.engine}]: Unsafe engine type provided.`);
		if (!validateSqlParam(this.orderBy, false)) throw new Error(`CLICKHOUSE [${this.orderBy}]: Unsafe orderBy clause provided.`);
		// Validate the schema columns are safe identifiers
		const unsafeColumns = this.schema.filter(column => !validateSqlParam(column.name, false)).map(column => column.name);
		if (unsafeColumns.length > 0) throw new Error(`CLICKHOUSE [${this.tableName}]: Unsafe column names provided: ${unsafeColumns.join(', ')}.`);
		// Ensure the database exists before creating the table
		await this.ensureDatabase();
		// Setup the full CREATE TABLE query
		const createTableQuery = `
			CREATE TABLE IF NOT EXISTS "${this.databaseName}"."${this.tableName}" ON CLUSTER default_cluster (
				${this.schema.map(column => `${column.name} ${column.type}`).join(', ')}
			) ENGINE = ${this.getEngineString()}
			ORDER BY ${this.orderBy}
		`;
		// Perform the query to create the table
		try {
			await this.client.command({ query: createTableQuery });
			Logger.info(`CLICKHOUSE [${this.tableName}]: Table created.`);
		} catch (error) {
			Logger.error(`CLICKHOUSE [${this.tableName}]: Error @ createTable(): ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Constructs the appropriate engine string based on the provided engine type.
	 * @throws Will throw an error if an unsupported engine type is provided.
	 */
	private getEngineString(): string {
		switch (this.engine) {
			case 'ReplicatedMergeTree':
				return `ReplicatedMergeTree('/clickhouse/tables/{shard}/${this.databaseName}/${this.tableName}', '{replica}')`;
			default:
				throw new Error(`CLICKHOUSE [${this.databaseName}/${this.tableName}]: Unsupported engine type: ${this.engine}`);
		}
	}

	//
}
