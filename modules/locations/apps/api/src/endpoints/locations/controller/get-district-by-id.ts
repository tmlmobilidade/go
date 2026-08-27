/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { type District } from '@tmlmobilidade/go-types-locations';
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

	const district = await locationsProvider.findDistrictById(request.params.id, { geometry: params.geometry });

	return reply
		.header('Access-Control-Allow-Origin', '*')
		.send({ data: district, error: null, statusCode: HTTP_STATUS.OK });

	//
}
