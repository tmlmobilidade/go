/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { Locality } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';
import { z } from 'zod';

/* * */

const queryParamsArrayStringSchema = z.preprocess(val => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val, z.array(z.string()).nullish());

const queryParamsSchema = z.object({
	district_ids: queryParamsArrayStringSchema,
	municipality_ids: queryParamsArrayStringSchema,
	parish_ids: queryParamsArrayStringSchema,
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
	// Fetch all localities

	const localities = await goDb.locations.localities.aggregate([
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
	]) as unknown as Locality[];

	return reply
		.send({ data: localities, error: null, statusCode: HTTP_STATUS.OK });

	//
}
