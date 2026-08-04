/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { District } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';
import { z } from 'zod';

/* * */

const queryParamsSchema = z.object({
	geometry: z.preprocess((val: unknown) => val === 'true' || val === '1', z.boolean()),
});

type QueryParams = z.infer<typeof queryParamsSchema>;

/**
 * Retrieves a district filtered by id.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function getDistrictById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<District>) {
	//

	//
	// Validate query params

	const params = validateQueryParams<QueryParams>(request.query, queryParamsSchema);

	//
	// Fetch a district

	const district = await goDb.locations.districts.aggregate([
		{ $match: { _id: request.params.id } },
		// Remove the geometry field
		{ $project: { geometry: params.geometry ? 1 : 0 } },
		// Flatten the properties object into the root object
		{ $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', '$properties'] } } },
		{ $unset: 'properties' },
		// Sort by _id
		{ $sort: { _id: 1 } },
	]);

	return reply
		.header('Access-Control-Allow-Origin', '*')
		.send({ data: district, error: null, statusCode: HTTP_STATUS.OK });

	//
}
