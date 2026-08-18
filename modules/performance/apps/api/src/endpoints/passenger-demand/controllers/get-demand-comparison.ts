/* * */

import { sendPassengerDemandResponse } from '@/endpoints/passenger-demand/controllers/send-passenger-demand-response.js';
import { buildPassengerDemandComparisonQueryInput, type PassengerDemandComparisonHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandComparison } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandComparison } from '@tmlmobilidade/go-types-performance';

/* * */

export function getPassengerDemandComparison(
	request: FastifyRequest<{ Querystring: PassengerDemandComparisonHttpQuery }>,
	reply: FastifyReply<PassengerDemandComparison>,
) {
	return sendPassengerDemandResponse(reply, 'comparison', () => (
		queryFiveMinutePassengerDemandComparison(buildPassengerDemandComparisonQueryInput(request.query))
	));
}

/* * */
