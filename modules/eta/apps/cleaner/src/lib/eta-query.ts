/* * */

import type { ClickHouseClient } from '@clickhouse/client';

import { substituteEtaDatabase } from '@/lib/eta-database.js';
import { queryFromString, splitClickHouseStatements } from '@tmlmobilidade/databases';
import { readFile } from 'node:fs/promises';

/* * */

export async function queryEtaFromFile<T>(
	client: ClickHouseClient,
	filePath: string,
	params?: Record<string, number | string>,
): Promise<T[]> {
	const sql = substituteEtaDatabase(await readFile(filePath, { encoding: 'utf-8' }));
	return queryFromString<T>(client, sql, params);
}

export async function queryEachEtaStatementFromFile<T>(
	client: ClickHouseClient,
	filePath: string,
	params?: Record<string, number | string>,
): Promise<T[]> {
	const sql = substituteEtaDatabase(await readFile(filePath, { encoding: 'utf-8' }));
	const statements = splitClickHouseStatements(sql);
	const merged: T[] = [];

	for (const statement of statements) {
		merged.push(...(await queryFromString<T>(client, statement, params)));
	}

	return merged;
}
