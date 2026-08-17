/* * */

import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Alert } from '@tmlmobilidade/go-types-operation';

import { type AlertsListFilters, AlertsListFiltersSchema } from './alerts-list-filters.js';
import { type AlertsListItem } from './alerts-list-item.js';

/* * */

export async function getAlertsList(filters: AlertsListFilters): Promise<AlertsListItem	[]> {
	//

	//
	// Validate the filters

	const validatedFilters = AlertsListFiltersSchema.parse(filters);

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<Alert> = [
		{
			$match: {
				...(validatedFilters.agency_ids.length > 0 ? { agency_id: { $in: validatedFilters.agency_ids } } : {}),
				...(validatedFilters.publish_end_date_start ? { publish_end_date: { $gte: validatedFilters.publish_end_date_start } } : {}),
				...(validatedFilters.publish_end_date_end ? { publish_end_date: { $lte: validatedFilters.publish_end_date_end } } : {}),
				...(validatedFilters.publish_start_date_start ? { publish_start_date: { $gte: validatedFilters.publish_start_date_start } } : {}),
				...(validatedFilters.publish_start_date_end ? { publish_start_date: { $lte: validatedFilters.publish_start_date_end } } : {}),
				...(validatedFilters.publish_status !== 'all' ? { publish_status: validatedFilters.publish_status } : {}),
				...(validatedFilters.reference_type !== 'all' ? { reference_type: validatedFilters.reference_type } : {}),
			},
		},
		{ $sort: { created_at: -1 } },
	];

	return await goDb.operation.alerts.aggregate(pipeline);
}

