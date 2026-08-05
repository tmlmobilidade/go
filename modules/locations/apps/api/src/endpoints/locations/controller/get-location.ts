/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { FastifyReply, FastifyRequest } from '@tmlmobilidade/fastify';
import { locationsProvider } from '@tmlmobilidade/go-providers-locations';
import { LatitudeSchema, Location, LongitudeSchema } from '@tmlmobilidade/types';
import { validateQueryParams } from '@tmlmobilidade/utils';
import z from 'zod';

/* * */

const queryParamsSchema = z.object({
	lat: LatitudeSchema,
	lon: LongitudeSchema,
});

type QueryParams = z.infer<typeof queryParamsSchema>;

/**
 * Retrieves all districts.
 * @param request Fastify request
 * @param reply Fastify reply
*/
export async function getLocation(request: FastifyRequest, reply: FastifyReply<Location>) {
	//

	//
	// Validate query params
	const query = validateQueryParams<QueryParams>(request.query, queryParamsSchema);

	//
	// Fetch all districts

	const location = await locationsProvider.findLocationByGeo(query.lat, query.lon);

	return reply
		.send({ data: location, error: null, statusCode: HTTP_STATUS.OK });
	//
}
