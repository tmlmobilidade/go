/* * */

import { type ExtractionTaskContext } from '@tmlmobilidade/go-types-extractions';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';

import { generatePlanPostersDownloadUrl } from './pipeline.js';

/* * */

export async function exportPlanPostersFile(context: ExtractionTaskContext, plan: Plan, extractionId: string): Promise<void> {
	if (!plan.attachments.operation_gtfs) {
		throw new Error(`Plan ${plan._id} has no operation GTFS attachment for poster export`);
	}

	const downloadUrl = await generatePlanPostersDownloadUrl(plan, `${extractionId}-${plan._id}`);
	const outputFile = path.join(context.output_path, `posters-${plan._id}.zip`);

	const response = await fetch(downloadUrl, { signal: AbortSignal.timeout(300_000) });
	if (!response.ok) throw new Error(`Poster ZIP download failed: HTTP ${response.status}.`);
	if (!response.body) throw new Error('Poster ZIP download returned no body.');

	await pipeline(response.body, fs.createWriteStream(outputFile));
	if (!fs.statSync(outputFile).size) throw new Error('Poster ZIP download returned an empty file.');
}
