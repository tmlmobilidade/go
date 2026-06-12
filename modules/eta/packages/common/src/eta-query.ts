import type { ClickHouseClient } from '@clickhouse/client';

import { prepareNamedQueryParams, splitClickHouseStatements } from '@tmlmobilidade/databases';
import { readFile } from 'node:fs/promises';

import { substituteEtaDatabase } from './eta-database.js';

async function queryEtaFromSql<T>(
	client: ClickHouseClient,
	database: string,
	sql: string,
	context: string,
	params?: Record<string, number | string>,
): Promise<T[]> {
	const { query, queryParams } = prepareNamedQueryParams(substituteEtaDatabase(database, sql), params, context);
	const result = await client.query({
		format: 'JSONEachRow',
		query,
		query_params: queryParams,
	});
	return result.json<T>();
}

/**
 * Executes a single SQL query from the specified file using the given database.
 *
 * - Substitutes all `{database}` placeholders with the provided database name.
 * - Supports parameter interpolation using the `params` object.
 *
 * @template T - The type representing each returned row.
 * @param client - The ClickHouseClient instance to use for executing the query.
 * @param database - The database name to substitute for `{database}` placeholders.
 * @param filePath - Path to the SQL file to be executed.
 * @param params - Optional record of query parameters (string or number) to inject into the query.
 * @returns A promise that resolves to an array of results of type T.
 */
export async function queryEtaFromFile<T>(client: ClickHouseClient, database: string, filePath: string, params?: Record<string, number | string>): Promise<T[]> {
	const sql = await readFile(filePath, { encoding: 'utf-8' });
	return queryEtaFromSql<T>(client, database, sql, filePath, params);
}

/**
 * Runs each individual SQL statement (separated by semicolons) from a file using the given database,
 * merges all results, and returns them as a single array.
 *
 * - Expands `{database}` placeholders with the provided database name.
 * - Supports parameter interpolation in each statement.
 *
 * @template T - Expected row type for the returned results.
 * @param client - ClickHouseClient to run the queries.
 * @param database - The database name to substitute for `{database}` placeholders.
 * @param filePath - Path to the SQL file containing one or more statements.
 * @param params - Optional query parameters to replace in each statement.
 * @returns Array of all rows returned from all statements in order.
 */
export async function queryEachEtaStatementFromFile<T>(client: ClickHouseClient, database: string, filePath: string, params?: Record<string, number | string>): Promise<T[]> {
	const sql = await readFile(filePath, { encoding: 'utf-8' });
	const statements = splitClickHouseStatements(sql);
	const merged: T[] = [];

	for (const statement of statements) {
		merged.push(...(await queryEtaFromSql<T>(client, database, statement, filePath, params)));
	}

	return merged;
}
