/* * */

import { buildPassengerDemandBaselineComparisonQueryInput, type PassengerDemandBaselineComparisonHttpQuery } from '@/endpoints/passenger-demand/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryFiveMinutePassengerDemandBaselineComparison } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PassengerDemandBaselineComparison } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export async function getPassengerDemandBaselineComparison(
	request: FastifyRequest<{ Querystring: PassengerDemandBaselineComparisonHttpQuery }>,
	reply: FastifyReply<PassengerDemandBaselineComparison>,
) {
	try {
		const data = await queryFiveMinutePassengerDemandBaselineComparison(buildPassengerDemandBaselineComparisonQueryInput(request.query));
		return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error({ error, message: 'Error executing passenger-demand baseline-comparison query' });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve passenger-demand baseline-comparison');
	}
}

/* * */
