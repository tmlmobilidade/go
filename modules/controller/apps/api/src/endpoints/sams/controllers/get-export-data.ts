/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { buildSamsMatch, sams, samsAnalysisExportAggregationPipeline } from '@tmlmobilidade/interfaces';
import { type GetSamsBatchQuery, GetSamsBatchQuerySchema, type Sam } from '@tmlmobilidade/types';

/**
 * Returns one row per SAM analysis record for export (same aggregation as the file-export worker).
 * Query mirrors {@link GetSamsBatchQuery}; optional `ids` (comma-separated SAM `_id`) ANDs with those filters.
 */
export async function getExportData(request: FastifyRequest<{ Querystring: GetSamsBatchQuery }>, reply: FastifyReply<Sam[]>) {
	const parsedQuery = GetSamsBatchQuerySchema.parse(request.query ?? {});
	const matchAnd = buildSamsMatch(parsedQuery);

	const numericIds = (request.query['ids']?.split(',') ?? [])
		.map(part => part.trim())
		.filter(Boolean)
		.map(Number)
		.filter(id => Number.isInteger(id));

	if (numericIds.length === 0 && matchAnd.length === 0) {
		throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Missing ids or matchAnd parameter.');
	}

	const pipeline = samsAnalysisExportAggregationPipeline({
		matchAnd: matchAnd.length > 0 ? matchAnd : undefined,
		samIds: numericIds.length > 0 ? numericIds : undefined,
	});

	const rows = (await sams.aggregate(pipeline)) as Sam[];

	if (rows.length === 0) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'No sams found.');
	}

	return reply.send({ data: rows, error: null, statusCode: HTTP_STATUS.OK });
}
