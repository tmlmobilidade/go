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
	const plans = await goDb.operation.plans.findMany({
		_id: { $in: properties.plan_ids },
		agency_id: { $in: properties.agency_ids },
	});

	//
	// B. Validate the selected plans

	if (!plans.length) throw new Error('No selected plans found for the selected agencies.');
	if (plans.length !== properties.plan_ids.length) throw new Error('Some selected plans were not found for the selected agencies.');

	//
	// C. Validate that only one plan per agency is selected

	if (new Set(plans.map(plan => plan.agency_id)).size !== plans.length) {
		throw new Error('Only one plan per agency can be selected for poster export.');
	}

	//
	// D. Set the attachment name

	context.attachment_name = `posters-v1-${extraction._id}.zip`;

	//
	// E. Export the plans posters

	await exportPlansPostersFile(context, plans, extraction._id, properties);

	Logger.success(`Exported ${plans.length} plans posters in extraction ${extraction._id}.`);
}
