/* * */

import { parsePerformanceNetworkLineIdentity, parsePerformanceNetworkPeriod, type PerformanceNetworkHttpQuery } from '@/endpoints/network/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { queryPerformanceNetworkLine } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type PerformanceNetworkLineDetail, PerformanceNetworkLineDetailSchema } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';

/* * */

/** Retrieve the metadata required by a Performance line detail screen. */
export async function getNetworkLine(
	request: FastifyRequest<{ Params: { lineId: string }, Querystring: PerformanceNetworkHttpQuery }>,
	reply: FastifyReply<PerformanceNetworkLineDetail>,
) {
	try {
		const identity = parsePerformanceNetworkLineIdentity(request.params.lineId);
		const period = parsePerformanceNetworkPeriod(request.query);
		const result = await queryPerformanceNetworkLine({ ...identity, ...period });
		if (!result) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Line not found');
		const agency = await goDb.core.agencies.findOne(
			{ $or: [{ _id: result.line.agency_id }, { code: result.line.agency_id }] },
			{ projection: { public_name: 1, short_name: 1 } },
		);
		const data = PerformanceNetworkLineDetailSchema.parse({
			...result.line,
			agency_name: agency?.public_name ?? result.line.agency_id,
			agency_short_name: agency?.short_name ?? result.line.agency_id,
			pattern_count: result.patterns.length,
			patterns: result.patterns,
		});
		return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	} catch (error) {
		Logger.error({ error, message: 'Error retrieving line' });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve line');
	}
}

/* * */
