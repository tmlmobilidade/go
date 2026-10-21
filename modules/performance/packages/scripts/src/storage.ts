import { splitClickHouseStatements } from '@tmlmobilidade/go-clients-clickhouse';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { readFile } from 'node:fs/promises';

export const sqlFile = (file: string) => new URL(`../../../sql/${file}`, import.meta.url);

export async function executeSql(file: string, params: Record<string, number | string | string[]> = {}) {
	// ALTER ... REPLACE PARTITION FROM does not accept ClickHouse Identifier parameters.
	const source = (await readFile(sqlFile(file), 'utf8')).replace(/\{(\w+):Identifier\}/g, (_, name: string) => {
		const value = params[name];
		if (typeof value !== 'string' || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(value)) throw new Error(`Invalid SQL identifier: ${name}`);
		return `\`${value}\``;
	});
	for (const query of splitClickHouseStatements(source)) {
		await labDb.command({ query, query_params: params });
	}
}

let INITIALIZED: Promise<void> | undefined;
export function initializeStorage() {
	INITIALIZED ??= executeSql('schema.sql').catch((error: unknown) => {
		INITIALIZED = undefined;
		throw error;
	});
	return INITIALIZED;
}

export async function querySql<T>(file: string, params: Record<string, number | string | string[]> = {}): Promise<T[]> {
	return labDb.queryFromFile<T>(sqlFile(file).pathname, params);
}

/** Pin immutable input generations before starting a calculation or API read. */
export async function snapshot(metrics: string[]) {
	if (!metrics.length) return [];
	const rows = await querySql<{ run_id: string }>('storage/snapshot.sql', { metrics });
	return rows.map(row => row.run_id);
}

export interface MetricRow {
	booleans: Record<string, boolean>
	generated_at: number
	metric: string
	numbers: Record<string, number>
	output_date: string
	path: string[]
	properties: Record<string, string>
	scalar: null | number
	strings: Record<string, null | string>
}
