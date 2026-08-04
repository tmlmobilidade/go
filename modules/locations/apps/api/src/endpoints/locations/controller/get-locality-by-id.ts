/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Locality } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';
import { z } from 'zod';

/* * */

const queryParamsSchema = z.object({
	withGeometry: z.boolean().optional().default(false),
});

type QueryParams = z.infer<typeof queryParamsSchema>;

/**
 * Retrieves a locality filtered by id.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function getLocalityById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Locality>) {
	//

	//
	// Validate query params

	const params = validateQueryParams<QueryParams>(request.query, queryParamsSchema);

	//
	// Fetch all locality

	const locality = await goDb.locations.localities.aggregate([
		{ $match: { _id: request.params.id } },
		// Remove the geometry field
		{ $project: { geometry: params.withGeometry ? 1 : 0 } },
		// Flatten the properties object into the root object
		{ $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', '$properties'] } } },
		{ $unset: 'properties' },
		// Sort by _id
		{ $sort: { _id: 1 } },
	]);

	return reply
		.header('Access-Control-Allow-Origin', '*')
		.send({ data: locality, error: null, statusCode: HTTP_STATUS.OK });

	//
}
