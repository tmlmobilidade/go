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

	request.body.municipality_ids = PermissionCatalog.filterPermissionResourceValues<string>({
		action: PermissionCatalog.all.stops.actions.read,
		permissions: request.permissions,
		resourceKey: 'municipality_ids',
		scope: PermissionCatalog.all.stops.scope,
		values: request.body.municipality_ids,
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
				'district_id': { $in: validatedFilters.data.district_ids ?? [] },
				'flags.agency_ids': { $in: validatedFilters.data.agency_ids ?? [] },
				'locality_id': { $in: validatedFilters.data.locality_ids ?? [] },
				'municipality_id': { $in: validatedFilters.data.municipality_ids ?? [] },
				'parish_id': { $in: validatedFilters.data.parish_ids ?? [] },
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
