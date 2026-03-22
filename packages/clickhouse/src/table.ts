/* * */

import { type ClickHouseColumn, type ClickHouseTableEngine } from '@/types.js';
import { isSafeIdentifier } from '@/utils.js';
import { ClickHouseClient, type DataFormat } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';
import { readFile } from 'fs/promises';

import { GODBClickHouseService } from '../../databases/dist/index.js';

/* * */

export abstract class ClickHouseTable<T> {
	//

	private static readonly safeQueryParamKey = /^[A-Za-z_][A-Za-z0-9_]*$/;

	protected abstract databaseName: string;

	protected abstract engine: ClickHouseTableEngine;
	protected abstract orderBy: string;
	protected abstract schema: ClickHouseColumn<T>[];
	protected abstract tableName: string;

	private client: ClickHouseClient;

	public async init() {
		this.client = await GODBClickHouseService.getClient();
		await this.ensureDatabase();
		await this.ensureTable();
		await this.postInit();
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
	 * @returns Query result rows typed as `T`.
	 * @example
	 * const users = await clickhouseService.queryFromString<User>(
	 *   'SELECT * FROM users WHERE created_at >= {start_date} AND created_at <= {end_date}',
	 *   { start_date: '2024-01-01', end_date: '2024-12-31' }
	 * );
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
	 * Ensures that the specified database exists in ClickHouse, creating it if it does not already exist.
	 * This method performs input validation to prevent SQL injection and logs the outcome of the operation.
	 * @throws Will throw an error if the database name is unsafe or if the database creation query fails.
	 * @returns A promise that resolves when the database is ensured to exist.
	 */
	protected async ensureDatabase(): Promise<void> {
		// Validate the inputs are safe identifiers to prevent SQL injection
		if (!isSafeIdentifier(this.databaseName)) throw new Error(`CLICKHOUSE [${this.databaseName}]: Unsafe database name provided.`);
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
	protected async ensureTable(): Promise<void> {
		// Validate the inputs are safe identifiers to prevent SQL injection
		if (!isSafeIdentifier(this.databaseName)) throw new Error(`CLICKHOUSE [${this.databaseName}]: Unsafe database name provided.`);
		if (!isSafeIdentifier(this.tableName)) throw new Error(`CLICKHOUSE [${this.tableName}]: Unsafe table name provided.`);
		if (!isSafeIdentifier(this.engine)) throw new Error(`CLICKHOUSE [${this.engine}]: Unsafe engine type provided.`);
		if (!isSafeIdentifier(this.orderBy)) throw new Error(`CLICKHOUSE [${this.orderBy}]: Unsafe orderBy clause provided.`);
		// Validate the schema columns are safe identifiers
		const unsafeColumns = this.schema.filter(column => !isSafeIdentifier(column.name)).map(column => column.name);
		if (unsafeColumns.length > 0) throw new Error(`CLICKHOUSE [${this.tableName}]: Unsafe column names provided: ${unsafeColumns.join(', ')}.`);
		// Ensure the database exists before creating the table
		await this.ensureDatabase();
		// Setup the full CREATE TABLE query
		const createTableQuery = `
			CREATE TABLE IF NOT EXISTS "${this.databaseName}"."${this.tableName}" ON CLUSTER default_cluster (
				${this.schema.map(column => `${column.name} ${column.type}`).join(', ')}
			) ENGINE = ${this.getEngine()}
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
	 * Optional override for custom setup logic:
	 * indexes, materialized views, constraints, etc.
	 */
	protected async postInit(): Promise<void> {
		// no-op by default
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
	 * Constructs the appropriate engine string based on the provided engine type.
	 * @throws Will throw an error if an unsupported engine type is provided.
	 */
	private getEngine(): string {
		switch (this.engine) {
			case 'ReplicatedMergeTree':
				return `ReplicatedMergeTree('/clickhouse/tables/{shard}/${this.databaseName}/${this.tableName}', '{replica}')`;
			default:
				throw new Error(`CLICKHOUSE [${this.databaseName}/${this.tableName}]: Unsupported engine type: ${this.engine}`);
		}
	}

	private prepareNamedQueryParams(query: string, params?: Record<string, number | string>, context?: string): { query: string, queryParams: Record<string, number | string> } {
		const queryParams: Record<string, number | string> = {};
		const providedParams = params ?? {};
		const usedKeys = new Set<string>();

		for (const key of Object.keys(providedParams)) {
			if (!ClickHouseTable.safeQueryParamKey.test(key)) {
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

	//
}
