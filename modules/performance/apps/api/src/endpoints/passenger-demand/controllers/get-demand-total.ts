/* * */

import { sendPassengerDemandResponse } from '@/endpoints/passenger-demand/controllers/send-passenger-demand-response.js';
import { buildPassengerDemandTotalQueryInput, type PassengerDemandHttpFilters } from '@/endpoints/passenger-demand/query-params.js';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandTotal } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandTotal } from '@tmlmobilidade/go-types-performance';

/* * */

export function getPassengerDemandTotal(
	request: FastifyRequest<{ Querystring: PassengerDemandHttpFilters }>,
	reply: FastifyReply<PassengerDemandTotal>,
) {
	return sendPassengerDemandResponse(reply, 'total', () => (
		queryFiveMinutePassengerDemandTotal(buildPassengerDemandTotalQueryInput(request.query))
	));
}

/* * */
