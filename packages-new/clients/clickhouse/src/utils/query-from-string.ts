/* * */

import { preparePositionalQueryParams } from '@/utils/prepare-positional-query-params.js';
import { type ClickHouseClient } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';

/**
 * Executes a query from a string using positional parameters.
 * @param client The ClickHouse client to use for executing the query.
 * @param query The SQL query to execute, with optional $1, $2 placeholders for parameters.
 * @param params Optional key-value substitutions mapping parameter indices (as strings) to their values.
 * @returns Query result rows typed as `T`.
 * @example
 * const users = await queryFromString<User>(clickhouseClient,
 *   'SELECT * FROM users WHERE created_at >= $1 AND created_at <= $2',
 *   { '1': '2024-01-01', '2': '2024-12-31' }
 * );
 */
export async function queryFromString<T>(client: ClickHouseClient, query: string, params?: Record<string, number | string>): Promise<T[]> {
	// Validate query param keys and prepare the query statement
	const preparedQuery = preparePositionalQueryParams(query, params);
	try {
		const result = await client.query({
			format: 'JSONEachRow',
			query: preparedQuery.query,
			query_params: preparedQuery.query_params,
		});
		return result.json<T>();
	} catch (error) {
		Logger.error({ error, message: `CLICKHOUSE: Error @ queryFromString(): Failed to execute query "${query}": ${(error as Error).message}` });
		throw error;
	}
}
