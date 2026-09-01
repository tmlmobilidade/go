/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { type UsersMunicipalityItem } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type MunicipalityFeature } from '@tmlmobilidade/go-types-locations';

/**
 * Returns all users municipalities.
 * @param request The request object
 * @param reply The reply object
 */
export async function listMunicipalitiesHandler(request: FastifyRequest, reply: FastifyReply<UsersMunicipalityItem[]>) {
	//

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<MunicipalityFeature> = [
		{ $match: {} },
		{ $project: { _id: 1, properties: 1 } },
		{ $sort: { _id: -1 } },
	];

	const aggregationResult = await goDb.locations.municipalities.aggregate(pipeline);

	if (!aggregationResult?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No users municipalities found',
			status_code: '404',
		});
	}

	//
	// Transform the result into a list of StopsMunicipalityItem

	const usersMunicipalityItems: UsersMunicipalityItem[] = aggregationResult.map(feature => ({
		_id: feature._id,
		...feature.properties,
	}));

	//
	// Parse and return the result

	if (!usersMunicipalityItems?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No stops municipalities found for this user.',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, usersMunicipalityItems);
}
