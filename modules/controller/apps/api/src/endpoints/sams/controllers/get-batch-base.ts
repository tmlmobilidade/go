/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { buildSamsMatch, sams, samsBatchBaseAggregationPipeline } from '@tmlmobilidade/interfaces';
import { type GetSamsBatchQuery, GetSamsBatchQuerySchema, type SamListItem } from '@tmlmobilidade/types';

/* * */

type SamBaseListItem = Omit<SamListItem, 'timeline_summary'>;

/**
 * Returns the base list of SAMs.
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getBatchBase(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<SamBaseListItem[]>) {
	const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
	const matchAnd = buildSamsMatch(parsedQuery);

	const pipeline = samsBatchBaseAggregationPipeline({ matchAnd });
	const allSams = (await sams.aggregate(pipeline)) as SamBaseListItem[];

	if (allSams.length === 0) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'No sams found.');
	}

	return reply.send({
		data: allSams,
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
