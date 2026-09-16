/* * */

import { PlanPostersExportPropertiesSchema } from '@tmlmobilidade/go-types-downloads';
import { type ExtractionTaskContext, type OperationPostersV1ExtractionProperties } from '@tmlmobilidade/go-types-extractions';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import { generatePlanPostersDownloadUrl } from './pipeline.js';

/* * */

export async function exportPlanPostersFile(context: ExtractionTaskContext, plan: Plan, extractionId: string, properties: OperationPostersV1ExtractionProperties): Promise<void> {
	if (!plan.attachments.operation_gtfs_normalized) {
		throw new Error(`Plan ${plan._id} has no normalized operation GTFS attachment for poster export`);
	}

	const canvasProfile = properties.content_mode === 'all'
		? '0Master.C'
		: PlanPostersExportPropertiesSchema.shape.properties.shape.canvas_profile.parse(properties.canvas_profile);
	const downloadUrl = await generatePlanPostersDownloadUrl(plan, `${extractionId}-${plan._id}`, {
		canvas_profile: canvasProfile,
		content_mode: properties.content_mode,
		line_codes: properties.line_ids ?? [],
		lines_mode: properties.lines_mode,
		stop_ids: properties.stop_ids ?? [],
		stops_mode: properties.stops_mode,
	});
	const outputFile = path.join(context.output_path, `posters-${plan._id}.zip`);

	const response = await fetch(downloadUrl, { signal: AbortSignal.timeout(300_000) });
	if (!response.ok) throw new Error(`Poster ZIP download failed: HTTP ${response.status}.`);
	if (!response.body) throw new Error('Poster ZIP download returned no body.');

	await pipeline(response.body, fs.createWriteStream(outputFile));
	if (!fs.statSync(outputFile).size) throw new Error('Poster ZIP download returned an empty file.');
}
