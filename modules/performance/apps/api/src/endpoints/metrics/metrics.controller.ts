/* * */

import { FastifyReply, FastifyRequest } from '@tmlmobilidade/connectors-fastify';
import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { metrics } from '@tmlmobilidade/interfaces';
import { type Metric } from '@tmlmobilidade/types';

/* * */

// Refactor this
export class MetricsController {
	/**
	 * Get a metric by name - Retrieves a metric from the database by its name
	 * @param {FastifyRequest} request - The request object containing the metric name in the params
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async getMetric(
		request: FastifyRequest<{
			Params: { metricName: Metric['metric'] }
			Querystring: Record<string, unknown>
		}>,
		reply: FastifyReply<Metric[]>,
	) {
		const { metricName } = request.params;
		const filters = request.query || {};

		try {
			// base query
			const query: Record<string, unknown> = { metric: metricName };

			// allow filters for specific metrics
			if (metricName.startsWith('demand_by_line') && filters.line_ids) {
				const lineIds = typeof filters.line_ids === 'string'
					? filters.line_ids.split(',').map(id => id.trim())
					: Array.isArray(filters.line_ids)
						? filters.line_ids
						: [filters.line_ids];

				query['properties.line_id'] = { $in: lineIds };
			}

			if (metricName.startsWith('demand_by_pattern') && filters.pattern_ids) {
				const patternIds = typeof filters.pattern_ids === 'string'
					? filters.pattern_ids.split(',').map(id => id.trim())
					: Array.isArray(filters.pattern_ids)
						? filters.pattern_ids
						: [filters.pattern_ids];

				query['properties.pattern_id'] = { $in: patternIds };
			}

			if (metricName.startsWith('demand_by_pattern') && filters.pattern_id) {
				query['properties.pattern_id'] = filters.pattern_id;
			}

			const metricDocs = (await metrics.findMany(query)) as Metric[];

			if (!metricDocs || metricDocs.length === 0) {
				throw new HttpException(HttpStatus.NOT_FOUND, 'Metric not found');
			}

			reply.send({
				data: metricDocs,
				error: null,
				statusCode: HttpStatus.OK,
			});
		}
		catch (error) {
			console.error(error);
			throw new HttpException(HttpStatus.INTERNAL_SERVER_ERROR, 'Failed to retrieve metric');
		}
	}
}
