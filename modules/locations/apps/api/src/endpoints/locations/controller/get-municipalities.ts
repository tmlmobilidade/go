/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Municipality } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';
import { z } from 'zod';

/* * */

const queryParamsSchema = z.object({
	district_ids: z.array(z.string().uuid()).optional(),
});

type QueryParams = z.infer<typeof queryParamsSchema>;

/**
 * Retrieves all municipalities.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function getMunicipalities(request: FastifyRequest, reply: FastifyReply<Municipality[]>) {
	//

	//
	// Validate query params
	const query = validateQueryParams<QueryParams>(request.query, queryParamsSchema);

	//
	// Fetch all municipalities

	const municipalities = await goDb.locations.municipalities.aggregate([
		// Filter by district ids
		{ $match: {
			...(query.district_ids ? { 'properties.district_id': { $in: query.district_ids } } : {}),
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
		.send({ data: municipalities, error: null, statusCode: HTTP_STATUS.OK });

	//
}
