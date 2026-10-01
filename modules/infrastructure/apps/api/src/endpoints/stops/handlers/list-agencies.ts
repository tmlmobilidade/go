/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { type StopsAgencyItem, StopsAgencyItemSchema, type StopsAgencyRequest, StopsAgencyRequestSchema } from '@tmlmobilidade/go-infrastructure-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AllowAllFlagValue } from '@tmlmobilidade/go-types-permissions';

/**
 * Returns the Agencies the user has access to for the given permissions.
 * @param request The request object containing the permissions registry in the body
 * @param reply The reply object
 */
export async function listAgenciesHandler(request: FastifyRequest<{ Body: StopsAgencyRequest }>, reply: FastifyReply<StopsAgencyItem[]>) {
	//

	//
	// Validate the filters

	const validatedFilters = StopsAgencyRequestSchema.safeParse(request.body);

	if (!validatedFilters.success) {
		return sendErrorApiResponse(reply, {
			error: validatedFilters.error.message,
			status_code: '400',
		});
	}

	//
	// Get the agency IDs from the permissions

	const resourceAgencyIds = validatedFilters.data.permissions.actions?.flatMap(action => request.permissions
		.filter(permission => permission.scope === validatedFilters.data.permissions.scope && permission.action === action)
		.flatMap(permission => 'resources' in permission ? permission.resources.agency_ids ?? [] : []),
	) ?? [];

	//
	// Build aggregation pipeline

	const matchedAgencyIds = !resourceAgencyIds.includes(AllowAllFlagValue)
		? { _id: { $in: resourceAgencyIds } }
		: {};

	const pipeline: AggregationPipeline<StopsAgencyItem> = [
		{ $match: matchedAgencyIds },
		{ $project: Object.fromEntries(Object.keys(StopsAgencyItemSchema.shape).map(key => [key, 1])) },
		{ $sort: { _id: -1 } },
	];

	const aggregationResult = await goDb.core.agencies.aggregate(pipeline);

	//
	// Parse and return the result

	if (!aggregationResult?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No stops agencies found for this user.',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, aggregationResult);
}
