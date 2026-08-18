/* * */

import { parseDateRange, parseIds } from '@/endpoints/metrics/utils/query-params.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { queryDailyPassengerDemandOverTimeByAgency } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type DemandByAgencyMetric, DemandByAgencyQueryInputSchema, type GetDemandByAgencyQuery, GetDemandByAgencyQuerySchema } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';
import { buildMetricDataNotFoundMessage } from '@tmlmobilidade/utils';

/* * */

const MAX_AGENCY_IDS = 100;

/* * */

export function buildDemandByAgencyQueryInput(
	query: GetDemandByAgencyQuery,
) {
	const dateRange = parseDateRange(query);

	return DemandByAgencyQueryInputSchema.parse({
		agency_ids: parseIds(
			[query.agency_id, query.agency_ids],
			{ max_ids: MAX_AGENCY_IDS, parameter_name: 'agency_ids' },
		),
		...dateRange,
		time_grain: query.time_grain,
	});
}

/**
 * Query passenger demand grouped by agency directly from Performance.
 *
 * Query parameters:
 * - `time_grain`: Required; `day`, `month`, or `year`.
 * - `agency_ids`: Optional comma-separated or repeated agency IDs.
 * - `agency_id`: Optional alias for one or more agency IDs.
 * - `start_date`: Optional `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` lower bound.
 * - `end_date`: Optional `YYYY`, `YYYY-MM`, or `YYYY-MM-DD` upper bound.
 */
export async function getDemandByAgency(
	request: FastifyRequest<{ Querystring: GetDemandByAgencyQuery }>,
	reply: FastifyReply<DemandByAgencyMetric[]>,
) {
	try {
		const parsedQuery = GetDemandByAgencyQuerySchema.safeParse(request.query);
		if (!parsedQuery.success) {
			throw new HttpException(
				HTTP_STATUS.BAD_REQUEST,
				'time_grain must be one of: day, month, year',
			);
		}

		const queryInput = buildDemandByAgencyQueryInput(parsedQuery.data);
		const metricDocs = await queryDailyPassengerDemandOverTimeByAgency(queryInput);

		if (metricDocs.length === 0) {
			throw new HttpException(
				HTTP_STATUS.NOT_FOUND,
				buildMetricDataNotFoundMessage({
					entityIds: queryInput.agency_ids ?? [],
					entityNames: { plural: 'agencies', singular: 'agency' },
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
		Logger.error({ error, message: 'Error retrieving demand-by-agency metric' });
		if (error instanceof HttpException) throw error;
		throw new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to retrieve demand-by-agency metric');
	}
}
