import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { type PerformanceMetric, readMetrics } from '@tmlmobilidade/go-performance-pckg-scripts';

/** Read completed labDb metrics in the existing dashboard response format. */
export async function getMetricHandler(request: FastifyRequest<{ Params: { id: string }, Querystring: Record<string, unknown> }>, reply: FastifyReply<PerformanceMetric[]>) {
	const data = await readMetrics(request.params.id, request.query || {});
	if (!data.length) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Metric not found');
	return reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
}
