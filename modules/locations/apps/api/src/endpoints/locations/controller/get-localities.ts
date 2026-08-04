/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Locality } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';
import { z } from 'zod';

/* * */

const queryParamsSchema = z.object({
	district_ids: z.array(z.string().uuid()).optional(),
	municipality_ids: z.array(z.string().uuid()).optional(),
	parish_ids: z.array(z.string().uuid()).optional(),
});

type QueryParams = z.infer<typeof queryParamsSchema>;

/**
 * Retrieves all localities.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function getLocalities(request: FastifyRequest, reply: FastifyReply<Locality[]>) {
	//

	//
	// Validate query params
	const query = validateQueryParams<QueryParams>(request.query, queryParamsSchema);

	//
	// Fetch all parishes

	const parishes = await goDb.locations.parishes.aggregate([
		// Filter by district ids
		{ $match: {
			...(query.district_ids ? { 'properties.district_id': { $in: query.district_ids } } : {}),
			...(query.municipality_ids ? { 'properties.municipality_id': { $in: query.municipality_ids } } : {}),
			...(query.parish_ids ? { 'properties.parish_id': { $in: query.parish_ids } } : {}),
		} },
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
		.send({ data: parishes, error: null, statusCode: HTTP_STATUS.OK });

	//
}
