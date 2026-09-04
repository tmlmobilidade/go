/* * */

import { buildPassengerDemandTotalQueryInput, type PassengerDemandHttpFilters } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandTotal } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandTotal } from '@tmlmobilidade/go-types-performance';

/* * */

/** Returns passenger-demand totals for a filtered period. */
export async function getPassengerDemandSummary(
	request: FastifyRequest<{ Querystring: PassengerDemandHttpFilters }>,
	reply: FastifyReply<PassengerDemandTotal>,
) {
	const data = await queryFiveMinutePassengerDemandTotal(buildPassengerDemandTotalQueryInput(request.query));
	return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
}

/* * */
