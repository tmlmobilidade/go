/* * */

import { FastifyReply, FastifyRequest } from '@tmlmobilidade/connectors-fastify';
import { metrics } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type Metric } from '@tmlmobilidade/types';

/* * */

export class MetricsController {
	/**
	 * Get a metric by name - Retrieves a metric from the database by its name
	 * @param {FastifyRequest} request - The request object containing the metric name in the params
	 * @param {FastifyReply} reply - The reply object used to send the response
	 */
	static async getMetric(
		request: FastifyRequest<{ Params: { metricName: Metric['metric'] } }>,
		reply: FastifyReply<Metric>,
	) {
		const { metricName } = request.params;

		const metricDocs = await metrics.findMany({ metric: metricName }) as Metric[];

		if (!metricDocs || metricDocs.length === 0) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Metric not found');
		}

		reply.send({ data: metricDocs, error: null, statusCode: HttpStatus.OK });
	}
}
