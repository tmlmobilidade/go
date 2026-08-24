/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { Municipality } from '@tmlmobilidade/go-types-locations';
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

	const municipality = await locationsProvider.findMunicipalityById(request.params.id, { geometry: params.geometry });

	return reply
		.send({ data: municipality, error: null, statusCode: HTTP_STATUS.OK });

	//
}
