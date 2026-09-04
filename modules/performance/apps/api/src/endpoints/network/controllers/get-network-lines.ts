/* * */

import { parsePerformanceNetworkLinesQuery, type PerformanceNetworkHttpQuery } from '@/endpoints/network/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryPerformanceNetworkLines } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PerformanceNetworkLine } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/* * */

/** Retrieve the line metadata required by Performance screens. */
export async function getNetworkLines(
	request: FastifyRequest<{ Querystring: PerformanceNetworkHttpQuery }>,
	reply: FastifyReply<PerformanceNetworkLine[]>,
) {
	try {
		const data = await queryPerformanceNetworkLines(parsePerformanceNetworkLinesQuery(request.query));
		return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error({ error, message: 'Error retrieving lines' });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve lines');
	}
}

/* * */
