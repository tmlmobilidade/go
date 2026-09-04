/* * */

import { buildPassengerDemandProductivityQueryInput, type PassengerDemandHttpFilters } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryPassengerDemandProductivity } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandProductivity } from '@tmlmobilidade/go-types-performance';

/* * */

/** Returns demand productivity for a line and filtered period. */
export async function getPassengerDemandProductivity(
	request: FastifyRequest<{ Querystring: PassengerDemandHttpFilters }>,
	reply: FastifyReply<PassengerDemandProductivity>,
) {
	const data = await queryPassengerDemandProductivity(buildPassengerDemandProductivityQueryInput(request.query));
	return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
}

/* * */
