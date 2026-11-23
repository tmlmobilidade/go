import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { type PerformanceMetric, readMetrics } from '@tmlmobilidade/go-performance-pckg-scripts';

/** Read completed labDb metrics in the existing dashboard response format. */
export async function getMetricHandler(request: FastifyRequest<{ Params: { id: string }, Querystring: Record<string, unknown> }>, reply: FastifyReply<PerformanceMetric[]>) {
	const data = await readMetrics(request.params.id, request.query || {});
	if (!data.length) return sendErrorApiResponse(reply, { error: 'Metric not found', status_code: '404' });
	return sendSuccessApiResponse(reply, data);
}
