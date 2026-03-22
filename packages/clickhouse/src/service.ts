/* * */

import { type ClickHouseColumn, ClickHouseTableEngine } from '@/types.js';
import { isSafeIdentifier } from '@/utils.js';
import { ClickHouseClient, createClient } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';
import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { readFile } from 'fs/promises';

/* * */

let GLOBAL_CHDB_TUNNEL_INSTANCE: SshTunnelService | undefined;

/* * */

export class ClickhouseService {
	//

	private static _instance: ClickhouseService;

	private static readonly safeQueryParamKey = /^[A-Za-z_][A-Za-z0-9_]*$/;
	private client: ClickHouseClient;

	public static async getInstance() {
		if (!ClickhouseService._instance) {
			const instance = new ClickhouseService();
			await instance.connect();
			await instance.init();
			ClickhouseService._instance = instance;
		}
		return ClickhouseService._instance;
	}

	/**
	 * Creates a new database in ClickHouse if it does not already exist.
	 * @throws Will throw an error if the database name is unsafe or if the database creation fails.
	 * @param databaseName The name of the database to create.
	 * @returns A promise that resolves when the database is created successfully.
	 */
	public async createDatabase(databaseName: string) {
		// Validate the inputs are safe identifiers to prevent SQL injection
		if (!isSafeIdentifier(databaseName)) throw new Error(`CLICKHOUSE [${databaseName}]: Unsafe database name provided.`);
		// Setup the full CREATE TABLE query
		const createTableQuery = `CREATE DATABASE IF NOT EXISTS "${databaseName}" on CLUSTER default_cluster;`;
		// Perform the query to create the table
		try {
			await this.client.command({ query: createTableQuery });
			Logger.info(`CLICKHOUSE [${databaseName}]: Database created.`);
		} catch (error) {
			Logger.error(`CLICKHOUSE [${databaseName}]: Error @ createDatabase(): ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Creates a new table in ClickHouse with the specified schema, orderBy, and engine.
	 * @param databaseName The name of the database where the table will be created.
	 * @param tableName The name of the table to create.
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
	public async createTable<T>(databaseName: string, tableName: string, schema: ClickHouseColumn<T>[], orderBy = '_id', engine: ClickHouseTableEngine = 'ReplicatedMergeTree') {
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
			await this.client.command({ query: createTableQuery });
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
	public async deleteTable(databaseName: string, tableName: string) {
		// Validate the table name
		if (!isSafeIdentifier(databaseName)) throw new Error(`CLICKHOUSE [${databaseName}]: Unsafe database name provided.`);
		if (!isSafeIdentifier(tableName)) throw new Error(`CLICKHOUSE [${tableName}]: Unsafe table name provided.`);
		// Perform the query to delete the table
		try {
			await this.client.command({ query: `DROP TABLE IF EXISTS "${databaseName}"."${tableName}" ON CLUSTER default_cluster` });
			Logger.info(`CLICKHOUSE [${tableName}]: Table deleted.`);
		} catch (error) {
			Logger.error(`CLICKHOUSE [${tableName}]: Error @ deleteTable(): ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * This is an escape hatch for executing queries that are not covered by the service's methods.
	 * It should be used with caution. Always prefer using the provided methods for common operations
	 * like creating tables or databases, or querying data, as they include safety checks and error handling.
	 * Directly using the client can lead to SQL injection vulnerabilities or other unintended side effects.
	 * @returns The ClickHouse client.
	 */
	public async getClient(): Promise<ClickHouseClient> {
		return Promise.resolve(this.client);
	}

	/**
	 * Gets a table in ClickHouse if it exists.
	 * @param databaseName The name of the database where the table is located.
	 * @param tableName The name of the table to get.
	 * @returns The table schema.
	 */
	public async getTable(databaseName: string, tableName: string) {
		try {
			// Validate the table name
			if (!isSafeIdentifier(databaseName)) {
				throw new Error(`CLICKHOUSE [${databaseName}]: Unsafe database name provided.`);
			}
			if (!isSafeIdentifier(tableName)) {
				throw new Error(`CLICKHOUSE [${tableName}]: Unsafe table name provided.`);
			}
			const result = await this.client.command({ query: `SHOW CREATE TABLE "${databaseName}"."${tableName}"` });
			Logger.info(`CLICKHOUSE [${tableName}]: Table schema retrieved.`);
			return result;
		} catch (error) {
			Logger.error(`CLICKHOUSE [${tableName}]: Error @ getTable(): ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * This method is intentionally left blank in the base service class,
	 * as the ClickHouse database and tables are expected to be managed by subclasses.
	 * If you are implementing a subclass of ClickhouseService, you should override this method
	 * to include any necessary setup logic, such as creating databases or tables.
	 */
	public async init() {
		console.warn('CLICKHOUSE: You are using ClickhouseService directly.');
		console.log('CLICKHOUSE: Consider creating a subclass of ClickhouseService and overriding the init() method to include setup logic for your specific use case.');
	}

	/**
	 * Executes a query from a .sql file with optional parameter substitutions.
	 * @param filePath Absolute or relative path to the .sql file.
	 * @param params Optional key-value substitutions applied to the query (replaces {key} placeholders).
	 * @returns Query result rows typed as `T`.
	 * @example
	 * // Given a SQL file "get_users.sql" with the content:
	 * // SELECT * FROM users WHERE created_at >= {start_date} AND created_at <= {end_date}
	 *
	 * const users = await clickhouseService.queryFromFile<User>('get_users.sql', {
	 *   start_date: '2024-01-01',
	 *   end_date: '2024-12-31',
	 * });
	 */
	public async queryFromFile<T>(filePath: string, params?: Record<string, number | string>): Promise<T[]> {
		let sql: string;
		try {
			sql = await readFile(filePath, { encoding: 'utf-8' });
		} catch (error) {
			Logger.error(`CLICKHOUSE: Error @ queryFromFile(): Failed to read SQL file "${filePath}": ${(error as Error).message}`);
			throw error;
		}

		const { query, queryParams } = this.prepareNamedQueryParams(sql, params, filePath);

		try {
			const result = await this.client.query({
				format: 'JSONEachRow',
				query,
				query_params: queryParams,
			});
			return result.json<T>();
		} catch (error) {
			Logger.error(`CLICKHOUSE: Error @ queryFromFile(): Failed to execute query from file "${filePath}": ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Executes a query from a string.
	 * @param query The SQL query to execute, with optional {key} placeholders for parameters.
	 * @param params Optional key-value substitutions applied to the query (replaces {key} placeholders).
	 */
	public async queryFromString<T>(query: string, params?: Record<string, number | string>): Promise<T[]> {
		// Validate query param keys and prepare the query statement
		const preparedQuery = this.preparePositionalQueryParams(query, params);
		try {
			const result = await this.client.query({
				format: 'JSONEachRow',
				query: preparedQuery.query,
				query_params: preparedQuery.query_params,
			});
			return result.json<T>();
		} catch (error) {
			Logger.error(`CLICKHOUSE: Error @ queryFromString(): Failed to execute query "${query}": ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Verifies that a table exists in ClickHouse by attempting to retrieve its schema.
	 * @throws Will throw an error if the table does not exist or if the table name is unsafe.
	 * @param databaseName The name of the database where the table is located.
	 * @param tableName The name of the table to verify.
	 * @param throwIfNotExists If true, the function will throw an error if the table does not exist.
	 * @returns A boolean indicating whether the table exists
	 */
	public async verifyTableExists(databaseName: string, tableName: string, throwIfNotExists = true): Promise<boolean> {
		try {
			// Validate the table name
			if (!isSafeIdentifier(tableName)) throw new Error(`CLICKHOUSE [${tableName}]: Unsafe table name provided.`);
			const response = await this.client.query({ format: 'JSONEachRow', query: `EXISTS TABLE "${databaseName}"."${tableName}";` });
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
	 * Connects to ClickHouse, setting up the client instance.
	 * If SSH tunneling is required, it establishes the tunnel first.
	 * This method is called internally by the service and should not be used directly.
	 */
	private async connect() {
		const clickhouseConnectionString = await this.getClickhouseConnectionString();
		this.client = createClient({ url: clickhouseConnectionString });
	}

	/**
	 * Constructs the ClickHouse connection string based on environment variables
	 * and SSH tunneling configuration, and handles both direct connections and SSH-tunneled
	 * connections, validating the necessary environment variables for each case.
	 * This method is called internally by the service and should not be used directly.
	 * @throws Will throw an error if required environment variables are missing or if the SSH tunnel setup fails.
	 * @returns A promise that resolves to the ClickHouse connection string.
	 */
	private async getClickhouseConnectionString(): Promise<string> {
		//

		//
		// Validate required environment variables

		if (process.env.CLICKHOUSE_TUNNEL_ENABLED !== 'true' && process.env.CLICKHOUSE_TUNNEL_ENABLED !== 'false') {
			throw new Error('Missing CLICKHOUSE_TUNNEL_ENABLED. Please indicate whether SSH tunneling is required by setting CLICKHOUSE_TUNNEL_ENABLED to "true" or "false".');
		}

		if (!process.env.CLICKHOUSE_HOST || !process.env.CLICKHOUSE_PORT) {
			throw new Error('Missing CLICKHOUSE_HOST or CLICKHOUSE_PORT');
		}

		if (process.env.CLICKHOUSE_TUNNEL_ENABLED === 'false') {
			return `http://${process.env.CLICKHOUSE_USER}:${process.env.CLICKHOUSE_PASSWORD}@${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`;
		}

		// SSH required
		if (!process.env.CLICKHOUSE_TUNNEL_LOCAL_PORT) {
			throw new Error('Missing CLICKHOUSE_TUNNEL_LOCAL_PORT');
		}

		if (!process.env.CLICKHOUSE_TUNNEL_SSH_HOST || !process.env.CLICKHOUSE_TUNNEL_SSH_USERNAME) {
			throw new Error('Missing SSH config');
		}

		const sshConfig: SshConfig = {
			forwardOptions: {
				dstAddr: process.env.CLICKHOUSE_HOST,
				dstPort: Number(process.env.CLICKHOUSE_PORT),
				srcAddr: 'localhost',
				srcPort: Number(process.env.CLICKHOUSE_TUNNEL_LOCAL_PORT),
			},
			serverOptions: {
				port: Number(process.env.CLICKHOUSE_TUNNEL_LOCAL_PORT),
			},
			sshOptions: {
				agent: process.env.SSH_AUTH_SOCK,
				host: process.env.CLICKHOUSE_TUNNEL_SSH_HOST,
				keepaliveCountMax: 3,
				keepaliveInterval: 10_000,
				port: 22,
				username: process.env.CLICKHOUSE_TUNNEL_SSH_USERNAME,
			},
			tunnelOptions: {
				autoClose: false,
				reconnectOnError: true,
			},
		};

		const sshOptions: SshTunnelServiceOptions = {
			maxRetries: 3,
		};

		if (!GLOBAL_CHDB_TUNNEL_INSTANCE) {
			GLOBAL_CHDB_TUNNEL_INSTANCE = new SshTunnelService(sshConfig, sshOptions);
		}

		Logger.info('Setting up SSH Tunnel for ClickHouse...');

		const connection = await GLOBAL_CHDB_TUNNEL_INSTANCE.connect();
		const addr = connection.address();

		if (!addr || typeof addr !== 'object') {
			throw new Error('Failed to retrieve SSH tunnel address');
		}

		// ClickHouse HTTP interface
		return `http://${process.env.CLICKHOUSE_USER}:${process.env.CLICKHOUSE_PASSWORD}@localhost:${addr.port}`;
	}

	/**
	 * Determines the appropriate ClickHouse parameter type based on the value's JavaScript type.
	 * This is used to convert untyped query placeholders into typed ClickHouse parameters.
	 * @param value
	 * @returns
	 */
	private getClickHouseParamType(value: number | string): 'Float64' | 'Int64' | 'String' {
		if (typeof value === 'number') {
			if (!Number.isFinite(value)) {
				throw new Error('CLICKHOUSE: Query params do not support non-finite numbers.');
			}
			return Number.isInteger(value) ? 'Int64' : 'Float64';
		}
		return 'String';
	}

	/**
	 * Constructs the appropriate engine query string based on the provided engine type.
	 * @param engine The ClickHouse table engine type.
	 * @param tableName The name of the table (used for ReplicatedMergeTree).
	 * @returns The engine query string to be used in the CREATE TABLE statement.
	 * @throws Will throw an error if an unsupported engine type is provided.
	 */
	private getEngineQueryString(engine: ClickHouseTableEngine, tableName: string): string {
		switch (engine) {
			case 'ReplicatedMergeTree':
				return `ReplicatedMergeTree('/clickhouse/tables/{shard}/${tableName}', '{replica}')`;
			default:
				throw new Error(`CLICKHOUSE [${tableName}]: Unsupported engine type: ${engine}`);
		}
	}

	private prepareNamedQueryParams(query: string, params?: Record<string, number | string>, context?: string): { query: string, queryParams: Record<string, number | string> } {
		const queryParams: Record<string, number | string> = {};
		const providedParams = params ?? {};
		const usedKeys = new Set<string>();

		for (const key of Object.keys(providedParams)) {
			if (!ClickhouseService.safeQueryParamKey.test(key)) {
				throw new Error(`CLICKHOUSE "${context ?? 'query'}": Unsafe query param name: "${key}"`);
			}
		}

		// Backward compatibility: convert untyped placeholders ({name}) into typed ClickHouse params.
		const normalizedQuery = query.replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, key: string) => {
			if (!(key in providedParams)) {
				throw new Error(`CLICKHOUSE "${context ?? 'query'}": Missing query param: ${key}`);
			}

			usedKeys.add(key);
			const value = providedParams[key];
			queryParams[key] = value;

			return `{${key}:${this.getClickHouseParamType(value)}}`;
		});

		// Also include explicitly typed placeholders already present in query (e.g. {id:UInt64}).
		for (const match of normalizedQuery.matchAll(/\{([A-Za-z_][A-Za-z0-9_]*):[^}]+\}/g)) {
			const key = match[1];
			if (!(key in providedParams)) {
				throw new Error(`CLICKHOUSE "${context ?? 'query'}": Missing query param: ${key}`);
			}
			usedKeys.add(key);
			queryParams[key] = providedParams[key];
		}

		for (const key of Object.keys(providedParams)) {
			if (!usedKeys.has(key)) {
				throw new Error(`CLICKHOUSE "${context ?? 'query'}": Unused query param: ${key}`);
			}
		}

		return { query: normalizedQuery, queryParams };
	}

	private preparePositionalQueryParams(query: string, params?: Record<string, number | string>): { query: string, query_params: Record<string, number | string> } {
		const queryParams: Record<string, number | string> = {};
		const providedParams = params ?? {};
		const usedKeys = new Set<string>();

		const normalizedQuery = query.replace(/\$(\d+)/g, (_, index: string) => {
			const key = String(index);
			if (!(key in providedParams)) {
				throw new Error(`CLICKHOUSE "${query}": Missing query param: $${key}`);
			}

			usedKeys.add(key);
			const queryParamKey = `p${key}`;
			const value = providedParams[key];
			queryParams[queryParamKey] = value;

			return `{${queryParamKey}:${this.getClickHouseParamType(value)}}`;
		});

		for (const key of Object.keys(providedParams)) {
			if (!/^\d+$/.test(key)) {
				throw new Error(`CLICKHOUSE "${query}": Invalid positional query param key: "${key}"`);
			}
			if (!usedKeys.has(key)) {
				throw new Error(`CLICKHOUSE "${query}": Unused query param: $${key}`);
			}
		}

		return { query: normalizedQuery, query_params: queryParams };
	}
}

/* * */

export const clickhouseService = asyncSingletonProxy(ClickhouseService);
