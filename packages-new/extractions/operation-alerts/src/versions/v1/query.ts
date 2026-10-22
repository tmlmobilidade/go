/* * */

import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { type OperationAlertsV1ExtractionProperties } from '@tmlmobilidade/go-types-extractions';
import { type Alert } from '@tmlmobilidade/go-types-operation';

/**
 * Builds the aggregation pipeline from the permitted alerts extraction properties.
 * @param properties The validated properties restricted to the user's permissions.
 * @returns The pipeline matching the selected filters, ordered by creation date.
 */
export function buildAlertsExtractionPipeline(properties: OperationAlertsV1ExtractionProperties): AggregationPipeline<Alert> {
	//

	//
	// Prepare the optional active period bounds

	const activePeriodFilter = {
		...(properties.active_period_filter_start !== undefined ? { $gte: properties.active_period_filter_start } : {}),
		...(properties.active_period_filter_end !== undefined ? { $lte: properties.active_period_filter_end } : {}),
	};

	//
	// Match the selected filters and preserve the list ordering

	return [
		{
			$match: {
				agency_id: { $in: properties.agency_ids },
				cause: { $in: properties.causes },
				effect: { $in: properties.effects },
				publish_start_date: {
					$gte: properties.publish_date_filter_start,
					$lte: properties.publish_date_filter_end,
				},
				publish_status: { $in: properties.publish_status },
				reference_type: { $in: properties.reference_type },
				...(Object.keys(activePeriodFilter).length ? { active_period_start_date: activePeriodFilter } : {}),
			},
		},
		{ $sort: { created_at: -1 } },
	];
}
