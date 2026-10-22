/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OperationAlertsV1Extraction } from '@tmlmobilidade/go-types-extractions';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { normalizeString } from '@tmlmobilidade/strings';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { buildAlertsExtractionQuery } from './apply-query.js';
import { parseAlertsExtraction } from './transform.js';
import { type OperationAlertsV1OutputRow, OperationAlertsV1OutputRowSchema } from './types.js';

/**
 * Exports the permitted alerts matching the filters to a CSV file.
 * @param context The extraction task context.
 * @param extraction The extraction to run.
 */
export async function extractOperationAlertsV1(context: ExtractionTaskContext, extraction: OperationAlertsV1Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// Prepare filters, permissions and search

	const { normalizedSearch, pipeline } = await buildAlertsExtractionQuery(extraction);

	//
	// Fetch alerts matching the filters and permissions

	const foundAlerts = await goDb.operation.alerts.aggregate(pipeline);

	//
	// Prepare the CSV file and batch writer

	const csvColumns = [
		'_id',
		'agency_id',
		'title',
		'description',
		'publish_status',
		'cause',
		'effect',
		'reference_type',
		'active_period_start_date',
		'active_period_end_date',
		'publish_start_date',
		'publish_end_date',
		'references',
		'municipality_ids',
		'coordinates',
		'info_url',
		'external_id',
		'file_id',
		'created_at',
		'created_by',
		'updated_at',
		'updated_by',
	] satisfies (keyof OperationAlertsV1OutputRow)[];

	const fileName = `operation-alerts-v1-${extraction._id}.csv`;
	const outputFilePath = path.join(context.output_path, fileName);
	const csvHeader = csvStringify([], { columns: csvColumns, header: true });

	fs.writeFileSync(outputFilePath, csvHeader, { encoding: 'utf-8', flush: true });

	const csvWriter = new BatchWriter<OperationAlertsV1OutputRow>({
		batch_size: 100_000,
		insertFn: async (outputRows) => {
			const csvData = csvStringify(outputRows, { columns: csvColumns, header: false });
			fs.appendFileSync(outputFilePath, csvData, { encoding: 'utf-8', flush: true });
		},
		max_retries: 0,
		title: 'operation_alerts_v1',
	});

	//
	// Parse the aggregation result into CSV

	for (const foundAlert of foundAlerts) {
		//

		//
		// Apply the same normalized search as the Alerts list

		if (normalizedSearch) {
			const normalizedAlertId = normalizeString(foundAlert._id);
			const normalizedAlertTitle = normalizeString(foundAlert.title);
			const matchesSearch = normalizedAlertId.includes(normalizedSearch) || normalizedAlertTitle.includes(normalizedSearch);

			if (!matchesSearch) continue;
		}

		//
		// Format the output row

		const outputRow = parseAlertsExtraction(foundAlert);

		const validatedOutputRow = OperationAlertsV1OutputRowSchema.parse(outputRow);

		await csvWriter.write(validatedOutputRow);
	}

	await csvWriter.flush();
}
