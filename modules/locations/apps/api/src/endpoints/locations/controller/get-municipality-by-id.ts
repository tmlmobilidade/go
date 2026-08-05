/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Municipality } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';
import { z } from 'zod';

/* * */

const queryParamsSchema = z.object({
	geometry: z.preprocess((val: unknown) => val === 'true' || val === '1', z.boolean()),
});

type QueryParams = z.infer<typeof queryParamsSchema>;

/**
 * Retrieves a municipality filtered by id.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function getMunicipalityById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Municipality>) {
	//

	//
	// Validate query params

	const params = validateQueryParams<QueryParams>(request.query, queryParamsSchema);

	//
	// Fetch all municipality

	const municipality = await goDb.locations.municipalities.aggregate([
		{ $match: { _id: request.params.id } },
		// Remove the geometry field
		{ $project: { geometry: params.geometry ? 1 : 0 } },
		// Flatten the properties object into the root object
		{ $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', '$properties'] } } },
		{ $unset: 'properties' },
		// Sort by _id
		{ $sort: { _id: 1 } },
	]) as unknown as Municipality;

	return reply
		.send({ data: municipality, error: null, statusCode: HTTP_STATUS.OK });

	//
}
