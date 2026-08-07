/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { Locality } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';
import { z } from 'zod';

/* * */

const queryParamsSchema = z.object({
	geometry: z.preprocess((val: unknown) => val === 'true' || val === '1', z.boolean()),
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

	const locality = await locationsProvider.findLocalityById(request.params.id, { geometry: params.geometry });

	return reply
		.send({ data: locality, error: null, statusCode: HTTP_STATUS.OK });

	//
}
