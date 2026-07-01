/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { buildSamsMatch, sams, samsBatchAggregationPipeline } from '@tmlmobilidade/interfaces';
import { type GetSamsBatchQuery, GetSamsBatchQuerySchema, type SamListItem } from '@tmlmobilidade/types';

/**
 * Returns the full list of SAMs.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getBatch(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamListItem[]>) {
	const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
	const matchAnd = buildSamsMatch(parsedQuery);

	const pipeline = samsBatchAggregationPipeline({ matchAnd });
	const allSams = (await sams.aggregate(pipeline)) as SamListItem[];

	if (allSams.length === 0) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'No sams found.');
	}

	return reply.send({
		data: allSams,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
