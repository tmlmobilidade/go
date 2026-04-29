/* eslint-disable @stylistic/max-statements-per-line */
/* * */

import { type ClickHouseClient } from '@clickhouse/client';
import { GOClickHouseClient } from '@tmlmobilidade/databases';
import { Logger } from '@tmlmobilidade/logger';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

/* * */

export type PipelineName = 'aggregation' | 'snap-waypoints' | 'transformation';

/* * */

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

/**
 * Resolves to `modules/eta/sql/`, regardless of whether this file runs from
 * `src/` (dev via tsx) or `dist/` (compiled). Both paths share the same depth
 * relative to the eta module root.
 */
const SQL_ROOT = path.resolve(__dirname, '..', '..', '..', 'sql');
const DDL_DIR = path.join(SQL_ROOT, 'ddl');
const PIPELINE_DIR = path.join(SQL_ROOT, 'pipeline');

/* * */

/**
 * Returns the absolute path to a pipeline `.sql` file shipped with the eta
 * module. Pass it directly to `queryFromFile()` from `@tmlmobilidade/databases`.
 *
 * @example
 * await queryFromFile(client, pipelinePath('transformation'));
 */
export function pipelinePath(name: PipelineName): string {
	return path.join(PIPELINE_DIR, `${name}-pipeline.sql`);
}

/**
 * Applies every DDL file in `modules/eta/sql/ddl/` (in numeric order) against
 * the GO ClickHouse cluster, skipping `00-teardown.sql`.
 *
 * Statements are split on top-level `;` so multi-statement files (e.g.
 * `01-historical-base-tables.sql`) work with the single-statement client API.
 * All DDL is `IF NOT EXISTS`, so this is safe to call on every app startup.
 */
export async function applyEtaDdl(): Promise<void> {
	const client = await GOClickHouseClient.getClient();
	const files = (await readdir(DDL_DIR))
		.filter(f => f.endsWith('.sql') && !f.startsWith('00-'))
		.sort();

	Logger.info(`[eta-bootstrap] Applying ${files.length} DDL file(s) from ${DDL_DIR}`);

	for (const file of files) {
		const fullPath = path.join(DDL_DIR, file);
		const sql = await readFile(fullPath, { encoding: 'utf-8' });
		const statements = splitStatements(sql);
		Logger.info(`[eta-bootstrap] ${file}: ${statements.length} statement(s)`);
		for (const statement of statements) {
			await runStatement(client, statement, file);
		}
	}

	Logger.success(`[eta-bootstrap] DDL applied`);
}

/* * */

async function runStatement(client: ClickHouseClient, query: string, sourceFile: string): Promise<void> {
	try {
		await client.command({ query });
	} catch (error) {
		Logger.error(`[eta-bootstrap] Failed to execute statement from "${sourceFile}": ${(error as Error).message}`);
		throw error;
	}
}

/**
 * Splits a SQL string into individual statements at top-level `;` boundaries,
 * ignoring `;` characters that appear inside line comments (`-- ...`), block
 * comments (`/* ... *\/`), or single/double-quoted string literals.
 *
 * Statement-internal comments are preserved (no rewrite of the statement
 * body) so error messages from ClickHouse stay aligned with the source file.
 */
function splitStatements(sql: string): string[] {
	const out: string[] = [];
	let start = 0;
	let i = 0;
	let inSingle = false;
	let inDouble = false;
	let inLineComment = false;
	let inBlockComment = false;

	while (i < sql.length) {
		const c = sql[i];
		const next = sql[i + 1];

		if (inLineComment) {
			if (c === '\n') inLineComment = false;
			i++;
			continue;
		}
		if (inBlockComment) {
			if (c === '*' && next === '/') {
				inBlockComment = false;
				i += 2;
				continue;
			}
			i++;
			continue;
		}
		if (inSingle) {
			if (c === '\\' && next !== undefined) { i += 2; continue; }
			if (c === '\'') inSingle = false;
			i++;
			continue;
		}
		if (inDouble) {
			if (c === '\\' && next !== undefined) { i += 2; continue; }
			if (c === '"') inDouble = false;
			i++;
			continue;
		}

		if (c === '-' && next === '-') { inLineComment = true; i += 2; continue; }
		if (c === '/' && next === '*') { inBlockComment = true; i += 2; continue; }
		if (c === '\'') { inSingle = true; i++; continue; }
		if (c === '"') { inDouble = true; i++; continue; }

		if (c === ';') {
			const stmt = sql.slice(start, i).trim();
			if (stmt) out.push(stmt);
			start = i + 1;
			i++;
			continue;
		}

		i++;
	}

	const tail = sql.slice(start).trim();
	if (tail) out.push(tail);
	return out;
}
