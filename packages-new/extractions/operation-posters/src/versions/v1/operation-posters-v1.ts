/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OperationPostersV1Extraction, OperationPostersV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { Logger } from '@tmlmobilidade/go-utils-telemetry';

import { exportPlansPostersFile } from './export-plan-posters.js';

/* * */

export async function operationPostersV1Extraction(context: ExtractionTaskContext, extraction: OperationPostersV1Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// A. Parse the extraction properties

	const properties = OperationPostersV1ExtractionPropertiesSchema.parse(extraction.properties);

	//
	// B. Find the selected plans and validate them

	const plans = await goDb.operation.plans.findMany({
		_id: { $in: properties.plan_ids },
		agency_id: { $in: properties.agency_ids },
	});

	if (!plans.length) throw new Error('No selected plans found for the selected agencies.');
	if (plans.length !== properties.plan_ids.length) throw new Error('Some selected plans were not found for the selected agencies.');

	//
	// C. Set the attachment name

	context.attachment_name = `posters-v1-${extraction._id}.zip`;

	//
	// D. Export the plans posters

	await exportPlansPostersFile(context, plans, extraction._id, properties);

	Logger.success(`Exported ${plans.length} plans posters in extraction ${extraction._id}.`);
}
