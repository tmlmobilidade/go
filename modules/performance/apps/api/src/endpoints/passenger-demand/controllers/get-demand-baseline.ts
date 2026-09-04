/* * */

import { buildPassengerDemandBaselineComparisonQueryInput, type PassengerDemandBaselineComparisonHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandBaselineComparison } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandBaselineComparison } from '@tmlmobilidade/go-types-performance';

/* * */

/** Returns the comparable-weekday passenger-demand baseline for an operational date. */
export async function getPassengerDemandBaseline(
	request: FastifyRequest<{ Querystring: PassengerDemandBaselineComparisonHttpQuery }>,
	reply: FastifyReply<PassengerDemandBaselineComparison>,
) {
	const data = await queryFiveMinutePassengerDemandBaselineComparison(buildPassengerDemandBaselineComparisonQueryInput(request.query));
	return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
}

/* * */
