/* * */

import { type Pool, PostgresDatabaseClient, type QueryResult, type QueryResultRow } from '@tmlmobilidade/go-clients-postgres';
import { asyncSingletonProxy } from '@tmlmobilidade/go-utils-exec';

/* * */

class LocationsDbClass {
	//

	private static _instance: LocationsDbClass;

	private readonly postgresClient: Pool;

	private constructor(postgresClient: Pool) {
		this.postgresClient = postgresClient;
	}

	/**
	 * Establishes a connection to the PostGIS / PostgreSQL database.
	 * @throws Error if required LOCATIONSDB_* environment variables are missing or if the connection fails.
	 */
	public static async getInstance() {
		if (!LocationsDbClass._instance) {
			const postgresClient = await PostgresDatabaseClient.getClient({ prefix: 'LOCATIONSDB', tunnelType: 'GO' });
			LocationsDbClass._instance = new LocationsDbClass(postgresClient);
		}
		return LocationsDbClass._instance;
	}

	/**
	 * Returns the underlying PostgreSQL pool.
	 * @deprecated Prefer {@link query} for typed data access.
	 */
	public getClient(): Pool {
		return this.postgresClient;
	}

	/**
	 * Executes a SQL query against the locations database.
	 * @param text The SQL query text (supports `$1`, `$2`, … placeholders).
	 * @param params Optional positional query parameters.
	 * @returns The query result rows typed as `T`.
	 */
	public async query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]): Promise<QueryResult<T>> {
		return await this.postgresClient.query<T>(text, params);
	}
}

/* * */

export const locationsDb = asyncSingletonProxy(LocationsDbClass);
