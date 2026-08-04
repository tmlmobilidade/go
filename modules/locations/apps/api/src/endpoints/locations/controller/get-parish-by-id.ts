/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Parish } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';
import { z } from 'zod';

/* * */

const queryParamsSchema = z.object({
	withGeometry: z.boolean().optional().default(false),
});

type QueryParams = z.infer<typeof queryParamsSchema>;

/**
 * Retrieves a parish filtered by id.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function getParishById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Parish>) {
	//

	//
	// Validate query params

	const params = validateQueryParams<QueryParams>(request.query, queryParamsSchema);

	//
	// Fetch all parish

	const parish = await goDb.locations.parishes.aggregate([
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
		.send({ data: parish, error: null, statusCode: HTTP_STATUS.OK });

	//
}
