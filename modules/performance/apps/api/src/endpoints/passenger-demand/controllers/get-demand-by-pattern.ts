/* * */

import { sendPassengerDemandResponse } from '@/endpoints/passenger-demand/controllers/send-passenger-demand-response.js';
import { buildPassengerDemandBreakdownQueryInput, type PassengerDemandBreakdownHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandByPattern } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandByPatternItem } from '@tmlmobilidade/go-types-performance';

/* * */

export function getPassengerDemandByPattern(
	request: FastifyRequest<{ Querystring: PassengerDemandBreakdownHttpQuery }>,
	reply: FastifyReply<PassengerDemandByPatternItem[]>,
) {
	return sendPassengerDemandResponse(reply, 'by-pattern', () => (
		queryFiveMinutePassengerDemandByPattern(buildPassengerDemandBreakdownQueryInput(request.query))
	));
}

/* * */
