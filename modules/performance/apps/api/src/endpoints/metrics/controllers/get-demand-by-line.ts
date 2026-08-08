/* * */

import { parseDateRange, parseIds } from '@/endpoints/metrics/utils/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryDemandByLine } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type DemandByLineMetric, DemandByLineQueryInputSchema, type GetDemandByLineQuery, GetDemandByLineQuerySchema } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';
import { buildMetricDataNotFoundMessage } from '@tmlmobilidade/utils';

/* * */

const MAX_LINE_IDS = 100;

/* * */

export function buildDemandByLineQueryInput(query: GetDemandByLineQuery) {
	const dateRange = parseDateRange(query);

	return DemandByLineQueryInputSchema.parse({
		...dateRange,
		line_ids: parseIds(
			[query.line_id, query.line_ids],
			{ max_ids: MAX_LINE_IDS, parameter_name: 'line_ids' },
		),
		time_grain: query.time_grain,
	});
}

/**
 * Query passenger demand grouped by one or more explicitly selected lines.
 */
export async function getDemandByLine(
	request: FastifyRequest<{ Querystring: GetDemandByLineQuery }>,
	reply: FastifyReply<DemandByLineMetric[]>,
) {
	try {
		const parsedQuery = GetDemandByLineQuerySchema.safeParse(request.query);
		if (!parsedQuery.success) {
			throw new HttpException(
				HTTP_STATUS.BAD_REQUEST,
				'time_grain must be one of: day, month, year; line_id or line_ids is required',
			);
		}

		const queryInput = buildDemandByLineQueryInput(parsedQuery.data);
		const metricDocs = await queryDemandByLine(queryInput);

		if (metricDocs.length === 0) {
			throw new HttpException(
				HTTP_STATUS.NOT_FOUND,
				buildMetricDataNotFoundMessage({
					entityIds: queryInput.line_ids ?? [],
					entityNames: { plural: 'lines', singular: 'line' },
					metricName: 'passenger-demand',
				}),
			);
		}

		return reply.send({
			data: metricDocs,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	} catch (error) {
		Logger.error({ error, message: 'Error retrieving demand-by-line metric' });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve demand-by-line metric');
	}
}
