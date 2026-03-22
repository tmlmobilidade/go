/* * */

import { ClickHouseClient, createClient } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';
import { type SshConfig, SshTunnelService, type SshTunnelServiceOptions } from '@tmlmobilidade/ssh';
import { readFile } from 'fs/promises';

/* * */

let GLOBAL_CHDB_TUNNEL_INSTANCE: SshTunnelService | undefined;

/* * */

export class ClickhouseService {
	//

	protected static _instance: unknown;

	protected static _instancePromise: null | Promise<unknown> = null;

	private static readonly safeQueryParamKey = /^[A-Za-z_][A-Za-z0-9_]*$/;

	protected client: ClickHouseClient;

	/**
	 * This is an escape hatch for executing queries that are not covered by the service's methods.
	 * It should be used with caution. Always prefer using the provided methods for common operations
	 * like creating tables or databases, or querying data, as they include safety checks and error handling.
	 * Directly using the client can lead to SQL injection vulnerabilities or other unintended side effects.
	 * @returns The ClickHouse client.
	 */
	public static async getClient(): Promise<ClickHouseClient> {
		const instance = await this.getInstance();
		return instance.client;
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
	public static async queryFromFile<T>(...args: Parameters<ClickhouseService['queryFromFile']>) {
		const instance = await this.getInstance();
		return instance.queryFromFile<T>(...args);
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
	public static async queryFromString<T>(...args: Parameters<ClickhouseService['queryFromString']>) {
		const instance = await this.getInstance();
		return instance.queryFromString<T>(...args);
	}

	/**
	 * Returns the singleton instance of the subclass.
	 */
	protected static async getInstance<T extends ClickhouseService>(this: new () => T): Promise<T> {
		// If already initialized, return immediately
		if (this['_instance']) return this['_instance'] as T;
		// If initialization is in progress, reuse it
		if (!this['_instancePromise']) {
			this['_instancePromise'] = (async () => {
				const instance = new this();
				// Optional lifecycle hooks
				if (typeof instance.connect === 'function') await instance.connect();
				if (typeof instance.init === 'function') await instance.init();
				this['_instance'] = instance;
				return instance;
			})();
		}
		return this['_instancePromise'] as Promise<T>;
	}

	/**
	 * This method is intentionally left blank in the base service class,
	 * as the ClickHouse database and tables are expected to be managed by subclasses.
	 * If you are implementing a subclass of ClickhouseService, you should override this method
	 * to include any necessary setup logic, such as creating databases or tables.
	 */
	protected async init() {
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
	protected async queryFromFile<T>(filePath: string, params?: Record<string, number | string>): Promise<T[]> {
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
	protected async queryFromString<T>(query: string, params?: Record<string, number | string>): Promise<T[]> {
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
