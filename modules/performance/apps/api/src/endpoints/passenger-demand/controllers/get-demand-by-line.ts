/* * */

import { sendPassengerDemandResponse } from '@/endpoints/passenger-demand/controllers/send-passenger-demand-response.js';
import { buildPassengerDemandBreakdownQueryInput, type PassengerDemandBreakdownHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandByLine } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandByLineItem } from '@tmlmobilidade/go-types-performance';

/* * */

export function getPassengerDemandByLine(
	request: FastifyRequest<{ Querystring: PassengerDemandBreakdownHttpQuery }>,
	reply: FastifyReply<PassengerDemandByLineItem[]>,
) {
	return sendPassengerDemandResponse(reply, 'by-line', () => (
		queryFiveMinutePassengerDemandByLine(buildPassengerDemandBreakdownQueryInput(request.query))
	));
}

/* * */
