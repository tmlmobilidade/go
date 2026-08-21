/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type AgenciesPlatformRequest, AgenciesPlatformRequestSchema, type AgenciesPlatformResponse, AgenciesPlatformResponseSchema } from '@tmlmobilidade/go-types-core';
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
	// Get the agency IDs from the permissions

	const resourceAgencyIds = validatedFilters.actions?.flatMap(action => request.permissions
		.filter(permission => permission.scope === validatedFilters.scope && permission.action === action)
		.flatMap(permission => 'resources' in permission ? permission.resources.agency_ids ?? [] : []),
	) ?? [];

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<AgenciesPlatformResponse> = [
		{ $match: resourceAgencyIds.includes(PermissionCatalog.ALLOW_ALL_FLAG) ? {} : { agency_id: { $in: resourceAgencyIds } } },
		{ $project: Object.fromEntries(Object.keys(AgenciesPlatformResponseSchema.shape).map(key => [key, 1])) },
		{ $sort: { _id: -1 } },
	];

	const aggregationResult = await goDb.core.agencies.aggregate(pipeline);

	//
	// Parse and return the result

	if (!aggregationResult?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No agencies found matching the filters',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, aggregationResult);
}

