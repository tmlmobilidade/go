/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type OperationPostersV1ExtractionProperties } from '@tmlmobilidade/go-types-extractions';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import { generatePlanDownload } from './generate-plan-download.js';

/* * */

export async function exportPostersFile(context: ExtractionTaskContext, plans: Plan[], extractionId: string, properties: OperationPostersV1ExtractionProperties): Promise<void> {
	//

	//
	// A. Validate the plans

	for (const plan of plans) {
		if (!plan.attachments.operation_gtfs_normalized) {
			throw new Error(`Plan ${plan._id} has no normalized operation GTFS attachment for poster export`);
		}
	}

	//
	// B. Generate the plan posters download

	const downloadUrl = await generatePlanDownload(plans, extractionId, {
		active_dates: properties.active_dates,
		canvas_profile: properties.canvas_profile ?? 'auto',
		content: properties.content,
		filter_mode: properties.filter_mode,
		stop_ids: properties.stop_ids ?? [],
	});

	//
	// C. Save the download URL to the extraction

	await goDb.core.extractions.updateById(extractionId, {
		properties: {
			...properties,
			download_url: downloadUrl,
		},
	});

	Logger.info({ message: `Saved posters download URL: ${downloadUrl}` });

	//
	// D. Download the plan posters

	const outputFile = path.join(context.output_path, `posters-${extractionId}.zip`);

	const response = await fetch(downloadUrl, { signal: AbortSignal.timeout(300_000) });

	if (!response.ok) throw new Error(`Poster ZIP download failed: HTTP ${response.status}.`);
	if (!response.body) throw new Error('Poster ZIP download returned no body.');

	//
	// E. Write the plan posters to the output file

	await pipeline(response.body, fs.createWriteStream(outputFile));

	//
	// F. Validate the output file

	if (!fs.statSync(outputFile).size) throw new Error('Poster ZIP download returned an empty file.');
}
