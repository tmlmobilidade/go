/* * */

import { buildPassengerDemandBreakdownQueryInput, type PassengerDemandBreakdownHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandByLine } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandByLineItem } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function getPassengerDemandByLine(
	request: FastifyRequest<{ Querystring: PassengerDemandBreakdownHttpQuery }>,
	reply: FastifyReply<PassengerDemandByLineItem[]>,
) {
	try {
		const data = await queryFiveMinutePassengerDemandByLine(buildPassengerDemandBreakdownQueryInput(request.query));
		return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error({ error, message: 'Error executing passenger-demand by-line query' });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve passenger-demand by-line');
	}
}

/* * */
