/* * */

import { ClickHouseClient, createClient } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { readFile } from 'fs/promises';

import { ClickHouseColumn } from './types.js';

/* * */

class ClickhouseService {
	private static _instance: ClickhouseService;
	private static readonly safeQueryParamKey = /^[A-Za-z_][A-Za-z0-9_]*$/;
	private client: ClickHouseClient;

	private constructor() {
		// Check missing environment variables
		const missingEnvVars = ['CLICKHOUSE_DATABASE', 'CLICKHOUSE_URI'].filter(envVar => !process.env[envVar]);
		if (missingEnvVars.length > 0) {
			throw new Error(`Missing ClickHouse environment variables: ${missingEnvVars.join(', ')}`);
		}

		this.client = createClient({
			database: process.env.CLICKHOUSE_DATABASE,
			url: process.env.CLICKHOUSE_URI,
		});
	}

	public static async getInstance() {
		if (!ClickhouseService._instance) {
			const instance = new ClickhouseService();
			ClickhouseService._instance = instance;
		}

		return ClickhouseService._instance;
	}

	/**
	 * Creates a table in ClickHouse if it doesn't exist.
	 *
	 * @param table The name of the table to create
	 * @param schema The schema of the table to create
	 * @param engine The ClickHouse table engine to use (default: MergeTree)
	 * @param orderBy The ORDER BY clause for the table (default: tuple())
	 */
	public async createTable<T>(table: string, schema: ClickHouseColumn<T>[], engine = 'MergeTree', orderBy = 'tuple()') {
		try {
			const createTableQuery = `
				CREATE TABLE IF NOT EXISTS ${table} (
					${schema.map(column => `${column.name} ${column.type}`).join(', ')}
				) ENGINE = ${engine}
				ORDER BY ${orderBy}
			`;

			await this.client.command({ query: createTableQuery });
			Logger.info(`CLICKHOUSE [${table}]: Table created.`);
		} catch (error) {
			Logger.error(`CLICKHOUSE [${table}]: Error @ createTable(): ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Deletes a table in ClickHouse if it exists.
	 *
	 * @param table The name of the table to delete
	 */
	public async deleteTable(table: string) {
		try {
			await this.client.command({ query: `DROP TABLE IF EXISTS ${table}` });
			Logger.info(`CLICKHOUSE [${table}]: Table deleted.`);
		} catch (error) {
			Logger.error(`CLICKHOUSE [${table}]: Error @ deleteTable(): ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Gets the ClickHouse client.
	 *
	 * @returns The ClickHouse client
	 */
	public async getClient(): Promise<ClickHouseClient> {
		return Promise.resolve(this.client);
	}

	/**
	 * Gets a table in ClickHouse if it exists.
	 *
	 * @param table The name of the table to get
	 * @returns The table schema
	 */
	public async getTable(table: string) {
		try {
			const result = await this.client.command({ query: `SHOW CREATE TABLE ${table}` });
			Logger.info(`CLICKHOUSE [${table}]: Table schema retrieved.`);
			return result;
		} catch (error) {
			Logger.error(`CLICKHOUSE [${table}]: Error @ getTable(): ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Executes a query from a SQL file.
	 *
	 * @param filePath Absolute or relative path to the .sql file
	 * @param params Optional key-value substitutions applied to the query (replaces {key} placeholders)
	 * @returns Query result rows typed as T
	 */
	public async queryFromFile<T>(filePath: string, params?: Record<string, number | string>): Promise<T[]> {
		let sql: string;

		try {
			sql = await readFile(filePath, { encoding: 'utf-8' });
		} catch (error) {
			Logger.error(`CLICKHOUSE: Error reading SQL file "${filePath}": ${(error as Error).message}`);
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
			Logger.error(`CLICKHOUSE: Error @ queryFromFile() "${filePath}": ${(error as Error).message}`);
			throw error;
		}
	}

	/**
	 * Query from string
	 *
	 * @param query The SQL query to execute
	 * @param params Optional positional substitutions applied to the query (replaces $1, $2, ... placeholders)
	 */
	public async queryFromString<T>(query: string, params?: Record<string, number | string>): Promise<T[]> {
		const { query: normalizedQuery, queryParams } = this.preparePositionalQueryParams(query, params);

		try {
			const result = await this.client.query({
				format: 'JSONEachRow',
				query: normalizedQuery,
				query_params: queryParams,
			});
			return result.json<T>();
		} catch (error) {
			Logger.error(`CLICKHOUSE: Error @ queryFromString() "${query}": ${(error as Error).message}`);
			throw error;
		}
	}

	private getClickHouseParamType(value: number | string): 'Float64' | 'Int64' | 'String' {
		if (typeof value === 'number') {
			if (!Number.isFinite(value)) {
				throw new Error('CLICKHOUSE: Query params do not support non-finite numbers.');
			}
			return Number.isInteger(value) ? 'Int64' : 'Float64';
		}

		return 'String';
	}

	private prepareNamedQueryParams(
		query: string,
		params?: Record<string, number | string>,
		context?: string,
	): { query: string, queryParams: Record<string, number | string> } {
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

	private preparePositionalQueryParams(
		query: string,
		params?: Record<string, number | string>,
	): { query: string, queryParams: Record<string, number | string> } {
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

		return { query: normalizedQuery, queryParams };
	}
}

export const clickhouseService = asyncSingletonProxy(ClickhouseService);
export type { ClickHouseColumn };
export type { ClickHouseClient };
