/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { type RolesMunicipalityItem } from '@tmlmobilidade/go-core-pckg-types';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type MunicipalityFeature } from '@tmlmobilidade/go-types-locations';

/**
 * Returns all roles municipalities.
 * @param request The request object
 * @param reply The reply object
 */
export async function listMunicipalitiesHandler(request: FastifyRequest, reply: FastifyReply<RolesMunicipalityItem[]>) {
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
			error: 'No roles municipalities found',
			status_code: '404',
		});
	}

	//
	// Transform the result into a list of RolesMunicipalityItem

	const rolesMunicipalityItems: RolesMunicipalityItem[] = aggregationResult.map(feature => ({
		_id: feature._id,
		...feature.properties,
	}));

	return sendSuccessApiResponse(reply, rolesMunicipalityItems);
}
