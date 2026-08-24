/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AllowAllFlagValue } from '@tmlmobilidade/go-types-permissions';
import { type AgenciesPlatformRequest, AgenciesPlatformRequestSchema, type AgenciesPlatformResponse, AgenciesPlatformResponseSchema } from '@tmlmobilidade/go-types-platform';

/**
 * Get agencies platform data.
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

	const resourceAgencyIds = validatedFilters.permissions.actions?.flatMap(action => request.permissions
		.filter(permission => permission.scope === validatedFilters.permissions.scope && permission.action === action)
		.flatMap(permission => 'resources' in permission ? permission.resources.agency_ids ?? [] : []),
	) ?? [];

	//
	// Build aggregation pipeline

	const matchedAgencyIds = !resourceAgencyIds.includes(AllowAllFlagValue)
		? { agency_id: { $in: resourceAgencyIds } }
		: {};

	const pipeline: AggregationPipeline<AgenciesPlatformResponse> = [
		{ $match: matchedAgencyIds },
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

