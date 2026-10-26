/* * */

import { streamCsvFile } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';
import path from 'node:path';

import { type PlanExportConfig, type Row } from '../types.js';
import { required } from '../utils/rows.js';

/* * */

/**
 * Reads a CSV file.
 * @param config - The configuration of the plan export.
 * @param name - The name of the CSV file to read.
 * @param callback - The callback to call for each row.
 * @param optional - Whether the CSV file is optional.
 */
export async function readCsv(config: PlanExportConfig, name: string, callback: (row: Row) => Promise<void>, optional = false) {
	const filePath = path.join(config.sourceDirectory, `${name}.txt`);
	const prefix = `[STePP plan ${config.planId}]`;
	if (optional && !fs.existsSync(filePath)) {
		Logger.info(`${prefix} Optional ${name}.txt is absent; using the available GTFS fields and defaults.`);
		return;
	}
	const timer = new Timer();
	let recordsRead = 0;
	Logger.info(`${prefix} Reading ${name}.txt...`);
	try {
		await streamCsvFile<Row>(filePath, async (row) => {
			recordsRead++;
			await callback(row);
		});
		Logger.info({
			attributes: { duration_ms: timer.getMs(), file: `${name}.txt`, plan_id: config.planId, records_read: recordsRead },
			message: `${prefix} Read ${recordsRead} records from ${name}.txt in ${timer.get()}.`,
		});
	} catch (error) {
		throw new Error(`${prefix} Could not export ${name}.txt (${recordsRead} CSV records read): ${error instanceof Error ? error.message : error}`, { cause: error });
	}
}

/**
 * Reads a CSV file by the given field.
 * @param config - The configuration of the plan export.
 * @param name - The name of the CSV file to read.
 * @param field - The field to read the rows by.
 * @returns A map of the IDs to the rows.
 */
export async function readById(config: PlanExportConfig, name: string, field: string): Promise<Map<string, Row>> {
	const rows = new Map<string, Row>();
	await readCsv(config, name, async (row) => {
		const id = required(row, field);
		if (rows.has(id)) throw new Error(`Duplicate ${field} "${id}"`);
		rows.set(id, row);
	});
	return rows;
}
