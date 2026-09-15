/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { metrics } from '@tmlmobilidade/interfaces';

/**
 * Returns the unique pattern IDs present in the metrics collection.
 * @param request The request object
 * @param reply The reply object
 */
export async function listPatternsHandler(request: FastifyRequest, reply: FastifyReply<string[]>) {
	//

	//
	// Get the unique pattern IDs from the existing metrics

	const metricsCollection = await metrics.getCollection();

	const aggregationResult = await metricsCollection.aggregate<{ uniqueValues: string[] }>([
		{ $group: { _id: null, uniqueValues: { $addToSet: '$properties.pattern_id' } } },
		{ $project: { _id: 0, uniqueValues: 1 } },
	]).toArray();

	const uniquePatternIds = aggregationResult[0]?.uniqueValues;

	if (!uniquePatternIds?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No patterns found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, uniquePatternIds);
}
