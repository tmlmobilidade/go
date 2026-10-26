import { createMetricsRegistry } from './create-registry.js';
import { createHttpMetrics } from './http-metrics.js';
import type { RegisterPrometheusMetricsOptions } from './types.js';

type MetricsRequest = {
	method: string
	url: string
	routeOptions?: { url?: string }
	__metricsStart?: bigint
};

type MetricsReply = {
	header: (name: string, value: string) => unknown
	statusCode: number
};

// Do not import FastifyInstance. This package installs its own fastify, and that
// copy is a different type from the server the caller built.
type MetricsHttpServer = {
	addHook(name: string, hook: (...args: any[]) => any): any
	get(path: string, handler: (...args: any[]) => any): any
};

/**
 * Attach Prometheus scrape endpoint (+ optional HTTP metrics) to a Fastify server.
 * Uses `@prometheus-io/client` only — no fastify-metrics.
 */
export async function registerPrometheusMetrics(
	server: MetricsHttpServer,
	options: RegisterPrometheusMetricsOptions = {},
): Promise<void> {
	const {
		endpoint = '/metrics',
		httpMetrics = true,
		...registryOptions
	} = options;

	const metrics = createMetricsRegistry(registryOptions);
	const http = httpMetrics ? createHttpMetrics(metrics) : null;

	if (http) {
		server.addHook('onRequest', async (request: MetricsRequest) => {
			request.__metricsStart = process.hrtime.bigint();
		});

		server.addHook('onResponse', async (request: MetricsRequest, reply: MetricsReply) => {
			const started = request.__metricsStart;
			if (started === undefined) return;

			const elapsedSec = Number(process.hrtime.bigint() - started) / 1e9;
			const method = request.method;
			const route = request.routeOptions?.url ?? request.url.split('?')[0] ?? 'unknown';
			const status_code = String(reply.statusCode);
			const labels = { method, route, status_code };

			http.duration.observe(labels, elapsedSec);
			http.total.inc(labels);
		});
	}

	server.get(endpoint, async (_request: unknown, reply: MetricsReply) => {
		reply.header('Content-Type', metrics.contentType);
		return metrics.registry.metrics();
	});
}
