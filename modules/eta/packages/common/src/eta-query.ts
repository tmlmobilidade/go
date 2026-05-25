import type { ClickHouseClient } from '@clickhouse/client';

import { substituteEtaDatabase } from '@/eta-database.js';
import { queryFromString, splitClickHouseStatements } from '@tmlmobilidade/databases';
import { readFile } from 'node:fs/promises';

/**
 * Executes a single SQL query from the specified file in the current ETA database using the provided ClickHouse client.
 *
 * - Substitutes all `{database}` placeholders with the active ETA database name (see substituteEtaDatabase).
 * - Supports parameter interpolation using the `params` object.
 *
 * @template T - The type representing each returned row.
 * @param client - The ClickHouseClient instance to use for executing the query.
 * @param filePath - Path to the SQL file to be executed.
 * @param params - Optional record of query parameters (string or number) to inject into the query.
 * @returns A promise that resolves to an array of results of type T.
 */
export async function queryEtaFromFile<T>(client: ClickHouseClient, filePath: string, params?: Record<string, number | string>): Promise<T[]> {
	const sql = substituteEtaDatabase(await readFile(filePath, { encoding: 'utf-8' }));
	return queryFromString<T>(client, sql, params);
}

/**
 * Runs each individual SQL statement (separated by semicolons) from a file in the active ETA database,
 * merges all results, and returns them as a single array.
 *
 * - Expands `{database}` placeholders using the current ETA database (see substituteEtaDatabase).
 * - Supports parameter interpolation in each statement.
 *
 * @template T - Expected row type for the returned results.
 * @param client - ClickHouseClient to run the queries.
 * @param filePath - Path to the SQL file containing one or more statements.
 * @param params - Optional query parameters to replace in each statement.
 * @returns Array of all rows returned from all statements in order.
 */
export async function queryEachEtaStatementFromFile<T>(client: ClickHouseClient, filePath: string, params?: Record<string, number | string>): Promise<T[]> {
	const sql = substituteEtaDatabase(await readFile(filePath, { encoding: 'utf-8' }));
	const statements = splitClickHouseStatements(sql);
	const merged: T[] = [];

	for (const statement of statements) {
		merged.push(...(await queryFromString<T>(client, statement, params)));
	}

	return merged;
}
