/* * */

import { ClickHouseClient, ClickHouseDatabaseClient, type ClickHouseQueryParams, queryFromFile, queryFromString } from '@tmlmobilidade/go-clients-clickhouse';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

import { OperationDatabase } from './databases/operation.js';
import { PerformanceDatabase } from './databases/performance.js';
import { SimplifiedApexDatabase } from './databases/simplified-apex.js';

/* * */

class LabDbClass {
	//

	private static _instance: null | Promise<LabDbClass> = null;

	public readonly operation: OperationDatabase;
	public readonly performance: PerformanceDatabase;
	public readonly simplifiedApex: SimplifiedApexDatabase;

	private readonly clickhouseClient: ClickHouseClient;

	private constructor(client: ClickHouseClient) {
		this.clickhouseClient = client;
		this.operation = new OperationDatabase(this.clickhouseClient);
		this.performance = new PerformanceDatabase(this.clickhouseClient);
		this.simplifiedApex = new SimplifiedApexDatabase(this.clickhouseClient);
	}

	/**
	 * Returns the singleton instance.
	 * Concurrent callers share the same initialization promise so schema setup runs once.
	 */
	public static async getInstance() {
		if (!LabDbClass._instance) {
			LabDbClass._instance = (async () => {
				const clickhouseClient = await ClickHouseDatabaseClient.getClient({ prefix: 'LABDB', tunnelType: 'GO' });
				const instance = new LabDbClass(clickhouseClient);
				// Behaves like an async constructor: create DBs/tables before the proxy exposes the instance.
				await instance.init();
				return instance;
			})();
		}
		return await LabDbClass._instance;
	}

	/**
	 * Returns the ClickHouse client.
	 * @returns The ClickHouse client.
	 * @deprecated Avoid using this method directly. Find alternative ways
	 * to query the database using the database-specific methods instead.
	 */
	public async getClient(): Promise<ClickHouseClient> {
		const instance = await LabDbClass.getInstance();
		return instance.clickhouseClient;
	}

	private async init() {
		await Promise.all([
			this.operation.init(),
			this.performance.init(),
			this.simplifiedApex.init(),
		]);
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
	public async queryFromFile<T>(filePath: string, params?: ClickHouseQueryParams): ReturnType<typeof queryFromFile<T>> {
		return await queryFromFile<T>(this.clickhouseClient, filePath, params);
	}

	/**
	 * Executes a query from a string.
	 * @param query The SQL query to execute, with optional $1, $2 placeholders for parameters.
	 * @param params Optional key-value substitutions mapping positional parameter numbers to values.
	 * @returns Query result rows typed as `T`.
	 * @example
	 * const users = await queryFromString<User>(clickhouseClient,
	 *   'SELECT * FROM users WHERE created_at >= $1 AND created_at <= $2',
	 *   { 1: '2024-01-01', 2: '2024-12-31' }
	 * );
	*/
	public async queryFromString<T>(query: string, params?: ClickHouseQueryParams): ReturnType<typeof queryFromString<T>> {
		return await queryFromString<T>(this.clickhouseClient, query, params);
	}
}

/* * */

export const labDb = asyncSingletonProxy(LabDbClass);
