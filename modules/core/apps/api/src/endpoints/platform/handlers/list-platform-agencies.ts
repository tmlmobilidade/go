/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AgenciesPlatformRequest, AgenciesPlatformRequestSchema, AgenciesPlatformResponse } from '@tmlmobilidade/go-types-core';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Get rides by query.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listPlatformAgenciesHandler(request: FastifyRequest<{ Body: AgenciesPlatformRequest }>, reply: FastifyReply<AgenciesPlatformResponse[]>) {
	//

	//
	// Validate the filters

	const validatedFilters = AgenciesPlatformRequestSchema.parse(request.body);

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<AlertsListItem> = [
		{
			$match: {
				...{ agency_id: { $in: validatedFilters.agency_ids ?? [] } },
				...{ publish_status: { $in: validatedFilters.publish_status ?? [] } },
				...{ reference_type: { $in: validatedFilters.reference_type ?? [] } },
				...{ cause: { $in: validatedFilters.causes ?? [] } },
				...{ effect: { $in: validatedFilters.effects ?? [] } },
				...{ publish_start_date: { $gte: validatedFilters.publish_date_start } },
				...{ publish_end_date: { $lte: validatedFilters.publish_date_end } },
				...(validatedFilters.active_period_start ? { active_period_start_date: { $gte: validatedFilters.active_period_start } } : {}),
				...(validatedFilters.active_period_end ? { active_period_end_date: { $lte: validatedFilters.active_period_end } } : {}),
			},

		},
		{ $project: Object.fromEntries(Object.keys(AlertsListItemSchema.shape).map(key => [key, 1])) },
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

