import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { AnnotationSchema } from '@tmlmobilidade/go-types-dates';
import { type DatesAnnotationsV1Extraction, DatesAnnotationsV1ExtractionPropertiesSchema, type ExtractionTaskContext, type ExtractionTaskResult } from '@tmlmobilidade/go-types-extractions';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { stringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { buildAnnotationsExtractionQuery } from './query.js';
import { formatAnnotationCsvRow } from './transform.js';
import { DatesAnnotationsV1CsvColumns, type DatesAnnotationsV1OutputRow } from './types.js';

/* * */

/** Exports annotations matching the chosen filters and current read permissions. */
export async function extractDatesAnnotationsV1(context: ExtractionTaskContext, extraction: DatesAnnotationsV1Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// Validate the filters and resolve the requester’s current read permissions.

	const properties = DatesAnnotationsV1ExtractionPropertiesSchema.parse(extraction.properties);
	const permissions = await authProvider.getPermissionsFromUserId(extraction.created_by);
	const query = await buildAnnotationsExtractionQuery(properties, permissions);
	const annotations = await goDb.dates.annotations.findMany(query);
	const agencyIds = [...new Set(annotations.flatMap(annotation => annotation.agency_ids ?? []))];
	const agencies = agencyIds.length ? await goDb.core.agencies.findMany({ _id: { $in: agencyIds } }) : [];
	const agencyNames = new Map(agencies.map(agency => [agency._id, agency.short_name || agency.name]));

	//
	// Always create a valid CSV, including when records were deleted or access was revoked.

	const outputPath = path.join(context.output_path, `dates-annotations-v1-${extraction._id}.csv`);
	fs.writeFileSync(outputPath, stringify([], { bom: true, columns: DatesAnnotationsV1CsvColumns, header: true, record_delimiter: 'windows' }), { encoding: 'utf-8', flush: true });

	const writer = new BatchWriter<DatesAnnotationsV1OutputRow>({
		batch_size: 1000,
		insertFn: async (rows) => {
			const csv = stringify(rows, { columns: DatesAnnotationsV1CsvColumns, escape_formulas: true, header: false, record_delimiter: 'windows' });
			fs.appendFileSync(outputPath, csv, { encoding: 'utf-8', flush: true });
		},
		max_retries: 0,
		title: 'dates_annotations_v1',
	});
	for (const annotation of annotations.sort((a, b) => Math.max(0, ...b.dates) - Math.max(0, ...a.dates) || b.created_at - a.created_at || a._id.localeCompare(b._id))) {
		await writer.write(formatAnnotationCsvRow(AnnotationSchema.parse(annotation), agencyNames));
	}
	await writer.flush();
}
