/* * */

import { buildPassengerDemandRecordsQueryInput, type PassengerDemandHttpFilters } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryPassengerDemandRecords } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandRecords } from '@tmlmobilidade/go-types-performance';

/* * */

/** Returns record demand days grouped by operational day type. */
export async function getPassengerDemandRecords(
	request: FastifyRequest<{ Querystring: PassengerDemandHttpFilters }>,
	reply: FastifyReply<PassengerDemandRecords>,
) {
	const data = await queryPassengerDemandRecords(buildPassengerDemandRecordsQueryInput(request.query));
	return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
}

/* * */
