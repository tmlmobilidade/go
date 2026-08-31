/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { type StopsListFilters, StopsListFiltersSchema, type StopsListResponse, StopsListResponseSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Lists all stops, sorted by creation date descending
 * @param request Fastify request
 * @param reply Fastify reply
 */
export async function listStopsHandler(request: FastifyRequest<{ Body: StopsListFilters }>, reply: FastifyReply<StopsListResponse[]>) {
	//

	//
	// Apply permission filters to the request body

	request.body.agency_ids = PermissionCatalog.filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.stops.actions.read,
		permissions: request.permissions,
		resourceKey: 'agency_ids',
		scope: PermissionCatalog.all.stops.scope,
		values: request.body.agency_ids,
	});

	request.body.municipality_ids = PermissionCatalog.filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.stops.actions.read,
		permissions: request.permissions,
		resourceKey: 'municipality_ids',
		scope: PermissionCatalog.all.stops.scope,
		values: request.body.municipality_ids,
	});

	//
	// Validate the filters

	const validatedFilters = StopsListFiltersSchema.parse(request.body);

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<StopsListResponse> = [
		{
			$match: {
				...{ 'flags.agency_ids': { $in: validatedFilters.agency_ids ?? [] } },
				...{ district_id: { $in: validatedFilters.district_ids ?? [] } },
				...{ municipality_id: { $in: validatedFilters.municipality_ids ?? [] } },
				...{ parish_id: { $in: validatedFilters.parish_ids ?? [] } },
				...{ locality_id: { $in: validatedFilters.locality_ids ?? [] } },
				// ...{ publish_status: { $in: validatedFilters.publish_status ?? [] } },
				// ...{ reference_type: { $in: validatedFilters.reference_type ?? [] } },
				// ...{ cause: { $in: validatedFilters.causes ?? [] } },
				// ...{ effect: { $in: validatedFilters.effects ?? [] } },
				// ...{ publish_start_date: { $gte: validatedFilters.publish_date_start } },
				// ...{ publish_end_date: { $lte: validatedFilters.publish_date_end } },
				// ...(validatedFilters.active_period_start ? { active_period_start_date: { $gte: validatedFilters.active_period_start } } : {}),
				// ...(validatedFilters.active_period_end ? { active_period_end_date: { $lte: validatedFilters.active_period_end } } : {}),
			},

		},
		{ $project: Object.fromEntries(Object.keys(StopsListResponseSchema.shape).map(key => [key, 1])) },
		{ $sort: { created_at: -1 } },
	];

	const aggregationResult = await goDb.infrastructure.stops.aggregate(pipeline);

	//
	// Parse and return the result

	if (!aggregationResult?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No stops found matching the filters',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, aggregationResult);
}
