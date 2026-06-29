/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { buildSamsMatch, sams, samsApexVersionsAggregationPipeline } from '@tmlmobilidade/interfaces';
import { type GetSamsBatchQuery, GetSamsBatchQuerySchema } from '@tmlmobilidade/types';

/**
 * Returns distinct `latest_apex_version` values from SAM documents (list filter).
 * @param request The Fastify request object.
 * @param reply The Fastify reply object.
 */
export async function getApexVersions(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<string[]>) {
	const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
	const matchAnd = buildSamsMatch(parsedQuery, { includeApexVersionFilter: false });

	const pipeline = samsApexVersionsAggregationPipeline({ matchAnd });

	const rows = (await sams.aggregate(pipeline)) as Array<{ _id: unknown }>;

	if (rows.length === 0) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'No apex versions found.');
	}

	return reply.send({
		data: rows.map(item => String(item._id)),
		error: null,
		statusCode: HTTP_STATUS.OK,
	});
}
