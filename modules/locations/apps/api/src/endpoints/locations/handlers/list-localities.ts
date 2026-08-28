/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type Locality } from '@tmlmobilidade/go-types-locations';
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
 * Lists all localities.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function listLocalitiesHandler(request: FastifyRequest, reply: FastifyReply<Locality[]>) {
	//

	//
	// Validate query params
	const query = validateQueryParams<QueryParams>(request.query, queryParamsSchema);

	//
	// Fetch all localities

	const localities = await locationsProvider.findLocalities({
		districtIds: query.district_ids,
		municipalityIds: query.municipality_ids,
		parishIds: query.parish_ids,
	});

	return reply
		.send({ data: localities, error: null, statusCode: HTTP_STATUS.OK });

	//
}
