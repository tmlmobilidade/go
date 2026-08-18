/* * */

import { sendPassengerDemandResponse } from '@/endpoints/passenger-demand/controllers/send-passenger-demand-response.js';
import { buildPassengerDemandOverTimeQueryInput, type PassengerDemandOverTimeHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandOverTime } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandOverTimePoint } from '@tmlmobilidade/go-types-performance';

/* * */

export function getPassengerDemandOverTime(
	request: FastifyRequest<{ Querystring: PassengerDemandOverTimeHttpQuery }>,
	reply: FastifyReply<PassengerDemandOverTimePoint[]>,
) {
	return sendPassengerDemandResponse(reply, 'over-time', () => (
		queryFiveMinutePassengerDemandOverTime(buildPassengerDemandOverTimeQueryInput(request.query))
	));
}

/* * */
