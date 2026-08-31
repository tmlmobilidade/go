/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Agency, AgencySchema } from '@tmlmobilidade/go-types-core';

/**
 * Get agencies platform data.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function listAgenciesHandler(request: FastifyRequest, reply: FastifyReply<Agency[]>) {
	//

	const pipeline: AggregationPipeline<Agency> = [
		{ $match: {} },
		{ $project: Object.fromEntries(Object.keys(AgencySchema.shape).map(key => [key, 1])) },
		{ $sort: { _id: -1 } },
	];

	const aggregationResult = await goDb.core.agencies.aggregate(pipeline);

	//
	// Parse and return the result

	if (!aggregationResult?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No agencies found.',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, aggregationResult);
}

