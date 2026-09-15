/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type ExtractionTaskContext, type ExtractionTaskResult, type OperationPostersV1Extraction, OperationPostersV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { Logger } from '@tmlmobilidade/logger';

import { exportPlanPostersFile } from './export-plan-posters.js';

/* * */

export async function operationPostersV1Extraction(context: ExtractionTaskContext, extraction: OperationPostersV1Extraction): Promise<ExtractionTaskResult> {
	const properties = OperationPostersV1ExtractionPropertiesSchema.parse(extraction.properties);
	const plans = await goDb.operation.plans.findMany({
		_id: { $in: properties.plan_ids },
		agency_id: { $in: properties.agency_ids },
	});
	if (!plans.length) throw new Error('No selected plans found for the selected agencies.');

	context.attachment_name = `posters-v1-${extraction._id}.zip`;

	for (const plan of plans) {
		await exportPlanPostersFile(context, plan, extraction._id);

		Logger.success(`Downloaded poster ZIP for plan ${plan._id} in extraction ${extraction._id}.`);
	}
}
