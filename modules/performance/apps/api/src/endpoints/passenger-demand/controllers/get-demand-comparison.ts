/* * */

import { buildPassengerDemandComparisonQueryInput, type PassengerDemandComparisonHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandComparison } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandComparison } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function getPassengerDemandComparison(
	request: FastifyRequest<{ Querystring: PassengerDemandComparisonHttpQuery }>,
	reply: FastifyReply<PassengerDemandComparison>,
) {
	try {
		const data = await queryFiveMinutePassengerDemandComparison(buildPassengerDemandComparisonQueryInput(request.query));
		return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error({ error, message: 'Error executing passenger-demand comparison query' });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve passenger-demand comparison');
	}
}

/* * */
