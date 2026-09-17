/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OperationPostersV1Extraction, OperationPostersV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { Logger } from '@tmlmobilidade/logger';

import { exportPlansPostersFile } from './export-plan-posters.js';

/* * */

export async function operationPostersV1Extraction(context: ExtractionTaskContext, extraction: OperationPostersV1Extraction): Promise<ExtractionTaskResult> {
	const properties = OperationPostersV1ExtractionPropertiesSchema.parse(extraction.properties);
	const plans = await goDb.operation.plans.findMany({
		_id: { $in: properties.plan_ids },
		agency_id: { $in: properties.agency_ids },
	});
	if (!plans.length) throw new Error('No selected plans found for the selected agencies.');
	if (plans.length !== properties.plan_ids.length) throw new Error('Some selected plans were not found for the selected agencies.');
	if (new Set(plans.map(plan => plan.agency_id)).size !== plans.length) {
		throw new Error('Only one plan per agency can be selected for poster export.');
	}

	context.attachment_name = `posters-v1-${extraction._id}.zip`;

	await exportPlansPostersFile(context, plans, extraction._id, properties);

	Logger.success(`Downloaded combined poster ZIP for ${plans.length} plans in extraction ${extraction._id}.`);
}
