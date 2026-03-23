/* * */

import { prepareNamedQueryParams } from '@/utils/prepare-named-query-params.js';
import { type ClickHouseClient } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';
import { readFile } from 'node:fs/promises';

/**
 * Executes a query from a .sql file with optional parameter substitutions.
 * @param client The ClickHouse client to use for executing the query.
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
export async function queryFromFile<T>(client: ClickHouseClient, filePath: string, params?: Record<string, number | string>): Promise<T[]> {
	let sql: string;
	try {
		sql = await readFile(filePath, { encoding: 'utf-8' });
	} catch (error) {
		Logger.error(`CLICKHOUSE: Error @ queryFromFile(): Failed to read SQL file "${filePath}": ${(error as Error).message}`);
		throw error;
	}
	const { query, queryParams } = prepareNamedQueryParams(sql, params, filePath);
	try {
		const result = await client.query({
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
