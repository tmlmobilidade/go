/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { type StopsListFilters, StopsListFiltersSchema, type StopsListResponse, StopsListResponseSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns the Stops matching the given filters, narrowed by the user permissions.
 * @param request The request object containing the filters in the body
 * @param reply The reply object
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

	// TODO: Change for any filter
	request.body.location_secondary_ids = PermissionCatalog.filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.stops.actions.read,
		permissions: request.permissions,
		resourceKey: 'municipality_ids',
		scope: PermissionCatalog.all.stops.scope,
		values: request.body.location_secondary_ids,
	});

	//
	// Validate the filters

	const validatedFilters = StopsListFiltersSchema.safeParse(request.body);

	if (!validatedFilters.success) {
		return sendErrorApiResponse(reply, {
			error: validatedFilters.error.message,
			status_code: '400',
		});
	}

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<StopsListResponse> = [
		{
			$match: {
				'flags.agency_ids': { $in: validatedFilters.data.agency_ids ?? [] },
				'location.neighbourhood.osm_id': { $in: validatedFilters.data.location_neighbourhood_ids.map(Number) },
				'location.primary.osm_id': { $in: validatedFilters.data.location_primary_ids.map(Number) },
				'location.secondary.osm_id': { $in: validatedFilters.data.location_secondary_ids.map(Number) },
				'location.tertiary.osm_id': { $in: validatedFilters.data.location_tertiary_ids.map(Number) },
			},
		},
		{ $project: Object.fromEntries(Object.keys(StopsListResponseSchema.shape).map(key => [key, 1])) },
		{ $sort: { created_at: 1 } },
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
