/* * */

import { type FastifyReply, type FastifyRequest, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type AlertsListFilters, AlertsListFiltersSchema, type AlertsListItem, AlertsListItemSchema } from '@tmlmobilidade/go-operation-pckg-types';
import { type AlertReferenceType } from '@tmlmobilidade/go-types-operation';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';

/**
 * Get alerts by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listAlertsHandler(request: FastifyRequest<{ Body: AlertsListFilters }>, reply: FastifyReply<AlertsListItem[]>) {
	//

	//
	// Apply permission filters to the request body

	request.body.agency_ids = filterPermissionResourceValues<string>({
		action: 'read',
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: 'alerts',
		values: request.body.agency_ids,
	});

	request.body.reference_type = filterPermissionResourceValues<AlertReferenceType>({
		action: 'read',
		permissions: request.permissions,
		resourceKey: 'reference_types',
		scope: 'alerts',
		values: request.body.reference_type,
	});

	//
	// Validate the filters

	const validatedFilters = AlertsListFiltersSchema.parse(request.body);

	//
	// Build aggregation pipeline

	const activePeriodFilter = {
		...(validatedFilters.active_period_filter_start !== undefined ? { $gte: validatedFilters.active_period_filter_start } : {}),
		...(validatedFilters.active_period_filter_end !== undefined ? { $lte: validatedFilters.active_period_filter_end } : {}),
	};

	const pipeline: AggregationPipeline<Omit<AlertsListItem, 'title_normalized'>> = [
		{
			$match: {
				...{ agency_id: { $in: validatedFilters.agency_ids ?? [] } },
				...{ publish_status: { $in: validatedFilters.publish_status ?? [] } },
				...{ reference_type: { $in: validatedFilters.reference_type ?? [] } },
				...{ cause: { $in: validatedFilters.causes ?? [] } },
				...{ effect: { $in: validatedFilters.effects ?? [] } },
				publish_start_date: {
					$gte: validatedFilters.publish_date_filter_start,
					$lte: validatedFilters.publish_date_filter_end,
				},
				...(Object.keys(activePeriodFilter).length ? { active_period_start_date: activePeriodFilter } : {}),
			},

		},
		{ $project: Object.fromEntries(Object.keys(AlertsListItemSchema.shape).map(key => [key, 1])) },
		{ $sort: { created_at: -1 } },
	];

	const aggregationResult = await goDb.operation.alerts.aggregate(pipeline);

	//
	// Return the results

	return sendSuccessApiResponse(reply, aggregationResult);
}

