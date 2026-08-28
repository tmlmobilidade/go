/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type Municipality } from '@tmlmobilidade/go-types-locations';
import { validateQueryParams } from '@tmlmobilidade/utils';
import { z } from 'zod';

/* * */

const queryParamsArrayStringSchema = z.preprocess(val => typeof val === 'string' ? val.split(',').map(s => s.trim()).filter(Boolean) : val, z.array(z.string()).nullish());

const queryParamsSchema = z.object({
	district_ids: queryParamsArrayStringSchema,
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

	const municipalities = await locationsProvider.findMunicipalities({ districtIds: query.district_ids });

	return reply.send({ data: municipalities, error: null, statusCode: HTTP_STATUS.OK });

	//
}
