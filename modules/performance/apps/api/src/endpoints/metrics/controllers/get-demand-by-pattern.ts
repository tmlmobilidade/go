/* * */

import { parseDateRange, parseIds } from '@/endpoints/metrics/utils/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryDemandByPattern } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type DemandByPatternMetric, DemandByPatternQueryInputSchema, type GetDemandByPatternQuery, GetDemandByPatternQuerySchema } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';
import { buildMetricDataNotFoundMessage } from '@tmlmobilidade/utils';

/* * */

const MAX_PATTERN_IDS = 100;

/* * */

export function buildDemandByPatternQueryInput(query: GetDemandByPatternQuery) {
	const dateRange = parseDateRange(query);

	return DemandByPatternQueryInputSchema.parse({
		...dateRange,
		pattern_ids: parseIds(
			[query.pattern_id, query.pattern_ids],
			{ max_ids: MAX_PATTERN_IDS, parameter_name: 'pattern_ids' },
		),
		time_grain: query.time_grain,
	});
}

/**
 * Query passenger demand grouped by one or more explicitly selected patterns.
 */
export async function getDemandByPattern(
	request: FastifyRequest<{ Querystring: GetDemandByPatternQuery }>,
	reply: FastifyReply<DemandByPatternMetric[]>,
) {
	try {
		const parsedQuery = GetDemandByPatternQuerySchema.safeParse(request.query);
		if (!parsedQuery.success) {
			throw new HttpException(
				HTTP_STATUS.BAD_REQUEST,
				'time_grain must be one of: day, month, year; pattern_id or pattern_ids is required',
			);
		}

		const queryInput = buildDemandByPatternQueryInput(parsedQuery.data);
		const metricDocs = await queryDemandByPattern(queryInput);

		if (metricDocs.length === 0) {
			throw new HttpException(
				HTTP_STATUS.NOT_FOUND,
				buildMetricDataNotFoundMessage({
					entityIds: queryInput.pattern_ids ?? [],
					entityNames: { plural: 'patterns', singular: 'pattern' },
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
		Logger.error({ error, message: 'Error retrieving demand-by-pattern metric' });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve demand-by-pattern metric');
	}
}
