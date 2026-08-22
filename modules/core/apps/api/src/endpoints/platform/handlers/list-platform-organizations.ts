/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type OrganizationsPlatformResponse, OrganizationsPlatformResponseSchema } from '@tmlmobilidade/go-types-core';

/**
 * Get organizations platform data.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listPlatformOrganizationsHandler(request: FastifyRequest, reply: FastifyReply<OrganizationsPlatformResponse[]>) {
	//

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<OrganizationsPlatformResponse> = [
		{ $match: {} },
		{ $project: Object.fromEntries(Object.keys(OrganizationsPlatformResponseSchema.shape).map(key => [key, 1])) },
		{ $sort: { _id: -1 } },
	];

	const aggregationResult = await goDb.core.organizations.aggregate(pipeline);

	//
	// Parse and return the result

	if (!aggregationResult?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No organizations found matching the filters',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, aggregationResult);
}

