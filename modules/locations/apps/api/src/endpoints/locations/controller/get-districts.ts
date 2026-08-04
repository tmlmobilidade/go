/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { District } from '@tmlmobilidade/types';

/**
 * Retrieves all districts.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function getDistricts(request: FastifyRequest, reply: FastifyReply<District[]>) {
	//

	//
	// Fetch all districts

	const districts = await goDb.locations.districts.aggregate([
		// Remove the geometry field
		{ $project: { geometry: 0 } },
		// Flatten the properties object into the root object
		{ $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', '$properties'] } } },
		{ $unset: 'properties' },
		// Sort by _id
		{ $sort: { _id: 1 } },
	]);

	return reply
		.header('Access-Control-Allow-Origin', '*')
		.send({ data: districts, error: null, statusCode: HTTP_STATUS.OK });

	//
}
