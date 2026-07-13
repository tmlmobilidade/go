/* * */

import { ClickHouseClient, ClickHouseDatabaseClient, queryFromFile, queryFromString } from '@tmlmobilidade/go-clients-clickhouse';
import { asyncSingletonProxy } from '@tmlmobilidade/utils';

import { OperationDatabase } from './databases/operation.js';
import { PerformanceDatabase } from './databases/performance.js';
import { SimplifiedApexDatabase } from './databases/simplified-apex.js';

/* * */

class LabDbClass {
	//

	//
	//
	private static _instance: LabDbClass;

	private clickhouseClient: ClickHouseClient;

	//
	// Databases
	public readonly operation: OperationDatabase;
	public readonly performance: PerformanceDatabase;
	public readonly simplifiedApex: SimplifiedApexDatabase;

	/**
	 * Establishes a connection to the Mongo database and initializes the collection.
	 * @param options Optional Mongo client connection options.
	 * @throws Error if the environment variable for the database URI is missing or if the connection fails.
	 */
	public static async getInstance() {
		if (!LabDbClass._instance) {
			const instance = new LabDbClass();
			await instance.connect();
			LabDbClass._instance = instance;
		}
		return LabDbClass._instance;
	}

	private async connect() {
		// Attempt to connect to the Lab Database
		const clickhouseClient = await ClickHouseDatabaseClient.getClient({ prefix: 'LAB_DB' });
		// Initialize the ClickHouse connector
		this.clickhouseClient = clickhouseClient;
	}

	//
	// Constructor
	private constructor() {
		this.operation = new OperationDatabase(this.clickhouseClient);
		this.performance = new PerformanceDatabase(this.clickhouseClient);
		this.simplifiedApex = new SimplifiedApexDatabase(this.clickhouseClient);
	}

	//
	// Queries

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
		return await queryFromFile<T>(this.clickhouseClient, filePath, params);
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
		return await queryFromString<T>(this.clickhouseClient, query, params);
	}
}

export const labDb = asyncSingletonProxy(LabDbClass);
