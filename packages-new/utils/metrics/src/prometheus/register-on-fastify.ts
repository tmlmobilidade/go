import type { FastifyInstance } from 'fastify';

import { createMetricsRegistry } from './create-registry.js';
import { createHttpMetrics } from './http-metrics.js';
import type { RegisterPrometheusMetricsOptions } from './types.js';

/**
 * Attach Prometheus scrape endpoint (+ optional HTTP metrics) to a Fastify server.
 * Uses `@prometheus-io/client` only — no fastify-metrics.
 */
export async function registerPrometheusMetrics(
	server: FastifyInstance,
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
		server.addHook('onRequest', async (request) => {
			(request as { __metricsStart?: bigint }).__metricsStart = process.hrtime.bigint();
		});

		server.addHook('onResponse', async (request, reply) => {
			const started = (request as { __metricsStart?: bigint }).__metricsStart;
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

	server.get(endpoint, async (_request, reply) => {
		reply.header('Content-Type', metrics.contentType);
		return metrics.registry.metrics();
	});
}
