/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { type RidesAgencyItem, RidesAgencyItemSchema } from '@tmlmobilidade/go-controller-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { AllowAllFlagValue } from '@tmlmobilidade/go-types-permissions';

/**
 * Get agencies platform data.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<RidesAgencyItem[]>) {
	//

	//
	// Get the agency IDs this user has access to

	const resourceAgencyIds = request.permissions
		.filter(permission => permission.scope === 'rides' && permission.action === 'analysis_read')
		.flatMap(permission => 'resources' in permission ? permission.resources.agency_ids ?? [] : []) ?? [];

	//
	// Build aggregation pipeline

	const matchedAgencyIds = !resourceAgencyIds.includes(AllowAllFlagValue)
		? { _id: { $in: resourceAgencyIds } }
		: {};

	const pipeline: AggregationPipeline<RidesAgencyItem> = [
		{ $match: matchedAgencyIds },
		{ $project: Object.fromEntries(Object.keys(RidesAgencyItemSchema.shape).map(key => [key, 1])) },
		{ $sort: { _id: -1 } },
	];

	const aggregationResult = await goDb.core.agencies.aggregate(pipeline);

	//
	// Parse and return the result

	if (!aggregationResult?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No rides agencies found for this user.',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, aggregationResult);
}

