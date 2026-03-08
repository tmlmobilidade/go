/* * */

import { createClient } from '@clickhouse/client';

/* * */

const clickhouseClient = createClient({
	database: process.env.CLICKHOUSE_DATABASE,
	password: process.env.CLICKHOUSE_PASSWORD,
	url: `${process.env.CLICKHOUSE_TLS === 'true' ? 'https' : 'http'}://${process.env.CLICKHOUSE_HOST}:${process.env.CLICKHOUSE_PORT}`,
	username: process.env.CLICKHOUSE_USERNAME,
});

/* * */

export function escapeClickHouseString(value: string) {
	return value.replace(/\\/g, '\\\\').replace(/'/g, `\\'`);
}

export function toClickHouseValue(value: boolean | null | number | string) {
	if (value === null) return 'NULL';
	if (typeof value === 'boolean') return value ? '1' : '0';
	if (typeof value === 'number') return String(value);
	return `'${escapeClickHouseString(value)}'`;
}

export async function queryRows<T>(query: string): Promise<T[]> {
	const result = await clickhouseClient.query({
		format: 'JSONEachRow',
		query,
	});

	return result.json<T>();
}

export async function updateById(
	table: string,
	id: string,
	updates: Record<string, boolean | null | number | string>,
) {
	if (Object.keys(updates).length === 0) return;

	const setClause = Object.entries(updates)
		.map(([column, value]) => `${column} = ${toClickHouseValue(value)}`)
		.join(', ');

	await clickhouseClient.command({
		query: `
			ALTER TABLE ${table}
			UPDATE ${setClause}
			WHERE _id = '${escapeClickHouseString(id)}'
			SETTINGS mutations_sync = 1
		`,
	});
}
