/* * */

import { prepareNamedQueryParams } from '@/utils/clickhouse/prepare-named-query-params.js';
import { type ClickHouseClient } from '@clickhouse/client';
import { Logger } from '@tmlmobilidade/logger';
import { readFile } from 'node:fs/promises';

function chunkHasExecutableLine(chunk: string): boolean {
	return chunk.split('\n').some((line) => {
		const t = line.trim();
		return t !== '' && !t.startsWith('--');
	});
}

/**
 * Split script into top-level `;`-terminated statements. Ignores semicolons inside `--` / `block`
 * comments and single-quoted strings (naive `.split(';')` breaks DDL when comments contain `;`).
 */
export function splitClickHouseStatements(sql: string): string[] {
	const out: string[] = [];
	let buf = '';
	let i = 0;
	let lineComment = false;
	let blockComment = false;
	let inString = false;

	while (i < sql.length) {
		const c = sql[i];
		const next = i + 1 < sql.length ? sql[i + 1] : undefined;

		if (!c) {
			break;
		}
		if (lineComment) {
			buf += c;
			if (c === '\n') {
				lineComment = false;
			}
			i += 1;
			continue;
		}
		if (blockComment) {
			buf += c;
			if (c === '*' && next === '/') {
				buf += '/';
				i += 2;
				blockComment = false;
				continue;
			}
			i += 1;
			continue;
		}
		if (inString) {
			buf += c;
			if (c === '\'' && next === '\'') {
				buf += '\'';
				i += 2;
				continue;
			}
			if (c === '\'') {
				inString = false;
			}
			i += 1;
			continue;
		}

		if (c === '-' && next === '-') {
			lineComment = true;
			buf += '--';
			i += 2;
			continue;
		}
		if (c === '/' && next === '*') {
			blockComment = true;
			buf += '/*';
			i += 2;
			continue;
		}
		if (c === '\'') {
			inString = true;
			buf += c;
			i += 1;
			continue;
		}

		if (c === ';') {
			const chunk = buf.trim();
			buf = '';
			i += 1;
			if (chunk && chunkHasExecutableLine(chunk)) {
				out.push(chunk);
			}
			continue;
		}

		buf += c;
		i += 1;
	}

	const tail = buf.trim();
	if (tail && chunkHasExecutableLine(tail)) {
		out.push(tail);
	}
	return out;
}

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

/**
 * Like {@link queryFromFile}, but runs each `;`-terminated statement separately. Use when the file
 * contains multiple statements (ClickHouse rejects multi-statement queries by default).
 */
export async function queryEachStatementFromFile<T>(client: ClickHouseClient, filePath: string, params?: Record<string, number | string>): Promise<T[]> {
	let sql: string;
	try {
		sql = await readFile(filePath, { encoding: 'utf-8' });
	} catch (error) {
		Logger.error(`CLICKHOUSE: Error @ queryEachStatementFromFile(): Failed to read SQL file "${filePath}": ${(error as Error).message}`);
		throw error;
	}

	const statements = splitClickHouseStatements(sql);
	const merged: T[] = [];

	for (const statement of statements) {
		const { query, queryParams } = prepareNamedQueryParams(statement, params, filePath);
		try {
			const result = await client.query({
				format: 'JSONEachRow',
				query,
				query_params: queryParams,
			});
			merged.push(...(await result.json<T>()));
		} catch (error) {
			Logger.error(`CLICKHOUSE: Error @ queryEachStatementFromFile(): Failed to execute statement from file "${filePath}": ${(error as Error).message}`);
			throw error;
		}
	}

	return merged;
}
