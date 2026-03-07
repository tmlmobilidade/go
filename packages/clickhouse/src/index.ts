/* * */

import { ClickHouseClient, createClient } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';
import { readFile } from 'fs/promises';

import { ClickHouseColumn } from './types.js';
import { isSafeIdentifier } from './utils.js';

/* * */

class ClickhouseService {
	private static _instance: ClickhouseService;
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
		// Validate the table name
		if (!isSafeIdentifier(table)) {
			throw new Error(`CLICKHOUSE [${table}]: Unsafe table name provided.`);
		}

		// Validate the engine
		if (!isSafeIdentifier(engine)) {
			throw new Error(`CLICKHOUSE [${engine}]: Unsafe engine type provided.`);
		}

		// Validate the orderBy
		if (!isSafeIdentifier(orderBy)) {
			throw new Error(`CLICKHOUSE [${orderBy}]: Unsafe orderBy clause provided.`);
		}

		// Validate the schema
		const unsafeColumns = schema.filter(column => !isSafeIdentifier(column.name)).map(column => column.name);
		if (unsafeColumns.length > 0) {
			throw new Error(`CLICKHOUSE [${table}]: Unsafe column names provided: ${unsafeColumns.join(', ')}.`);
		}

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
		// Validate the table name
		if (!isSafeIdentifier(table)) {
			throw new Error(`CLICKHOUSE [${table}]: Unsafe table name provided.`);
		}

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
			// Validate the table name
			if (!isSafeIdentifier(table)) {
				throw new Error(`CLICKHOUSE [${table}]: Unsafe table name provided.`);
			}

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

		// Simple named placeholder substitution
		if (params) {
			sql = sql.replace(/\{(\w+)\}/g, (_, key) => {
				if (!(key in params)) throw new Error(`CLICKHOUSE "${filePath}": Missing query param: ${key}`);
				return String(params[key]);
			});
		}

		try {
			const result = await this.client.query({ format: 'JSONEachRow', query: sql });
			return result.json<T>();
		} catch (error) {
			Logger.error(`CLICKHOUSE: Error @ queryFromFile() "${filePath}": ${(error as Error).message}`);
			throw error;
		}
	}
}

export const clickhouseService = asyncSingletonProxy(ClickhouseService);
export type { ClickHouseColumn };
