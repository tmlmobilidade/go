/* * */

import { buildPassengerDemandOverTimeQueryInput, type PassengerDemandOverTimeHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandOverTime } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandOverTimePoint } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function getPassengerDemandOverTime(
	request: FastifyRequest<{ Querystring: PassengerDemandOverTimeHttpQuery }>,
	reply: FastifyReply<PassengerDemandOverTimePoint[]>,
) {
	try {
		const data = await queryFiveMinutePassengerDemandOverTime(buildPassengerDemandOverTimeQueryInput(request.query));
		return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error({ error, message: 'Error executing passenger-demand over-time query' });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve passenger-demand over-time');
	}
}

/* * */
