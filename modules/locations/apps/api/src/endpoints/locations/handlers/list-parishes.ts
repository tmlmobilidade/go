/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type Parish } from '@tmlmobilidade/go-types-locations';
import { validateQueryParams } from '@tmlmobilidade/utils';
import { z } from 'zod';

/* * */

const queryParamsArrayStringSchema = z.preprocess(val => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val, z.array(z.string()).nullish());

const queryParamsSchema = z.object({
	district_ids: queryParamsArrayStringSchema,
	municipality_ids: queryParamsArrayStringSchema,
});

type QueryParams = z.infer<typeof queryParamsSchema>;

/**
 * Retrieves all parishes.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function listParishesHandler(request: FastifyRequest, reply: FastifyReply<Parish[]>) {
	//

	//
	// Validate query params
	const query = validateQueryParams<QueryParams>(request.query, queryParamsSchema);

	//
	// Fetch all parishes

	const parishes = await locationsProvider.findParishes({
		districtIds: query.district_ids,
		municipalityIds: query.municipality_ids,
	});

	return reply.send({ data: parishes, error: null, statusCode: HTTP_STATUS.OK });

	//
}
