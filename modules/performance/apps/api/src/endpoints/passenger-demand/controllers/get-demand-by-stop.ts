/* * */

import { sendPassengerDemandResponse } from '@/endpoints/passenger-demand/controllers/send-passenger-demand-response.js';
import { buildPassengerDemandBreakdownQueryInput, type PassengerDemandBreakdownHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandByStop } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandByStopItem } from '@tmlmobilidade/go-types-performance';

/* * */

export function getPassengerDemandByStop(
	request: FastifyRequest<{ Querystring: PassengerDemandBreakdownHttpQuery }>,
	reply: FastifyReply<PassengerDemandByStopItem[]>,
) {
	return sendPassengerDemandResponse(reply, 'by-stop', () => (
		queryFiveMinutePassengerDemandByStop(buildPassengerDemandBreakdownQueryInput(request.query))
	));
}

/* * */
