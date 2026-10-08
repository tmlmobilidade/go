import { Counter, Histogram } from '@prometheus-io/client';

import type { MetricsRegistry } from './create-registry.js';

export type HttpMetrics = {
	duration: Histogram<'method' | 'route' | 'status_code'>
	total: Counter<'method' | 'route' | 'status_code'>
};

/**
 * HTTP request metrics shared by Fastify (and future adapters).
 */
export function createHttpMetrics(metrics: MetricsRegistry): HttpMetrics {
	const { prefix, registry } = metrics;

	return {
		duration: new Histogram({
			help: 'Duration of HTTP requests in seconds',
			labelNames: ['method', 'route', 'status_code'],
			name: `${prefix}http_request_duration_seconds`,
			registers: [registry],
		}),
		total: new Counter({
			help: 'Total number of HTTP requests',
			labelNames: ['method', 'route', 'status_code'],
			name: `${prefix}http_requests_total`,
			registers: [registry],
		}),
	};
}
