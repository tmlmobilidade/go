/* * */

import { prepareNamedQueryParams, splitClickHouseStatements } from '@tmlmobilidade/go-clients-clickhouse';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import { readFile } from 'node:fs/promises';

/* * */

type QueryParams = Record<string, number | string | string[]>;

interface PreviewRow {
	rows_to_delete: number | string
}

/* * */

/**
 * Runs a "counted" cleanup file: statement 1 is a `SELECT count() AS rows_to_delete`
 * preview, the remaining statements are `ALTER TABLE ... DELETE` mutations.
 *
 * The mutations are issued only when the preview count is above zero. A
 * ClickHouse DELETE mutation with no matching rows still scans and, for parts
 * it cannot prove clean, rewrites data, so skipping it on the common
 * "nothing to do" path keeps the background merge queue quiet.
 *
 * @param filePath - Absolute path to the cleanup SQL file.
 * @param params - Named query params used by the statements.
 * @returns The preview count (rows scheduled for deletion).
 */
export async function runCountedCleanup(filePath: string, params: QueryParams = {}): Promise<number> {
	const sql = await readFile(filePath, { encoding: 'utf-8' });
	const [preview, ...mutations] = splitClickHouseStatements(sql);

	if (!preview) {
		throw new Error(`Cleanup file has no statements: ${filePath}`);
	}

	const previewQuery = prepareNamedQueryParams(preview, params, filePath);
	const previewResult = await labDb.query({ format: 'JSONEachRow', query: previewQuery.query, query_params: previewQuery.queryParams });
	const [previewRow] = (await previewResult.json<PreviewRow>()) as PreviewRow[];
	const rowsToDelete = Number(previewRow?.rows_to_delete ?? 0);

	if (rowsToDelete === 0) {
		Logger.progress({ message: 'Nothing to delete' });
		return 0;
	}

	for (const mutation of mutations) {
		const mutationQuery = prepareNamedQueryParams(mutation, params, filePath);
		await labDb.command({ query: mutationQuery.query, query_params: mutationQuery.queryParams });
	}

	Logger.progress({ message: `Deleted ${rowsToDelete} rows` });
	return rowsToDelete;
}
