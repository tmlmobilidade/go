/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/fastify';
import { type AlertsListFilters, AlertsListFiltersSchema, type AlertsListItem, AlertsListItemSchema } from '@tmlmobilidade/go-alerts-pckg-types';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Get rides by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listAlerts(request: FastifyRequest<{ Body: AlertsListFilters }>, reply: FastifyReply<AlertsListItem[]>) {
	//

	//
	// Apply permission filters to the request body

	request.body.agency_ids = PermissionCatalog.filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.alerts.actions.read,
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.alerts.scope,
		values: request.body.agency_ids,
	});

	//
	// Validate the filters

	const validatedFilters = AlertsListFiltersSchema.parse(request.body);

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<AlertsListItem> = [
		{
			$match: {
				...(validatedFilters.agency_ids.length > 0 ? { agency_id: { $in: validatedFilters.agency_ids } } : {}),
				...(validatedFilters.publish_end_date_start ? { publish_end_date: { $gte: validatedFilters.publish_end_date_start } } : {}),
				...(validatedFilters.publish_end_date_end ? { publish_end_date: { $lte: validatedFilters.publish_end_date_end } } : {}),
				...(validatedFilters.publish_start_date_start ? { publish_start_date: { $gte: validatedFilters.publish_start_date_start } } : {}),
				...(validatedFilters.publish_start_date_end ? { publish_start_date: { $lte: validatedFilters.publish_start_date_end } } : {}),
				...(validatedFilters.publish_status.length > 0 ? { publish_status: { $in: validatedFilters.publish_status } } : {}),
				...(validatedFilters.reference_type.length > 0 ? { reference_type: { $in: validatedFilters.reference_type } } : {}),
			},
			$project: Object.fromEntries(Object.keys(AlertsListItemSchema.shape).map(key => [key, 1])),
		},
		{ $sort: { created_at: -1 } },
	];

	const aggregationResult = await goDb.operation.alerts.aggregate(pipeline);

	//
	// Parse and return the result

	if (!aggregationResult?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No alerts found matching the filters',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, aggregationResult);
}

