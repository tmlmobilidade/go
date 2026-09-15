/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { metrics } from '@tmlmobilidade/interfaces';

/**
 * Returns the unique line IDs present in the metrics collection.
 * @param request The request object
 * @param reply The reply object
 */
export async function listLinesHandler(request: FastifyRequest, reply: FastifyReply<string[]>) {
	//

	//
	// Get the unique line IDs from the existing metrics

	const metricsCollection = await metrics.getCollection();

	const aggregationResult = await metricsCollection.aggregate<{ uniqueValues: string[] }>([
		{ $group: { _id: null, uniqueValues: { $addToSet: '$properties.line_id' } } },
		{ $project: { _id: 0, uniqueValues: 1 } },
	]).toArray();

	const uniqueLineIds = aggregationResult[0]?.uniqueValues;

	if (!uniqueLineIds?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No lines found',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, uniqueLineIds);
}
