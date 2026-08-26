/* * */

import { buildPassengerDemandTotalQueryInput, type PassengerDemandHttpFilters } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandTotal } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandTotal } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function getPassengerDemandTotal(
	request: FastifyRequest<{ Querystring: PassengerDemandHttpFilters }>,
	reply: FastifyReply<PassengerDemandTotal>,
) {
	try {
		const data = await queryFiveMinutePassengerDemandTotal(buildPassengerDemandTotalQueryInput(request.query));
		return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error({ error, message: 'Error executing passenger-demand total query' });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve passenger-demand total');
	}
}

/* * */
