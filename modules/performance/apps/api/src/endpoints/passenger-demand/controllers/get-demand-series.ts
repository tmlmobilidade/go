/* * */

import { buildPassengerDemandOverTimeQueryInput, type PassengerDemandOverTimeHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryPassengerDemandSeries } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandSeries } from '@tmlmobilidade/go-types-performance';

/* * */

/** Returns passenger demand over time and the total represented by the points. */
export async function getPassengerDemandSeries(
	request: FastifyRequest<{ Querystring: PassengerDemandOverTimeHttpQuery }>,
	reply: FastifyReply<PassengerDemandSeries>,
) {
	const data = await queryPassengerDemandSeries(buildPassengerDemandOverTimeQueryInput(request.query));
	return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
}

/* * */
