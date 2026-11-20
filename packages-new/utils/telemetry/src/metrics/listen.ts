import type { ListenPrometheusMetricsOptions } from './types.js';
import type { Server } from 'node:http';

import { createServer } from 'node:http';

import { createMetricsRegistry, type MetricsRegistry } from './create-registry.js';

/* * */

export type PrometheusMetricsServer = {
	close: () => Promise<void>
	metrics: MetricsRegistry
	port: number
};

/**
 * Start a tiny HTTP server that serves a Prometheus scrape endpoint.
 * For workers / CLI that have no Fastify server.
 */
export async function listenPrometheusMetrics(
	options: ListenPrometheusMetricsOptions = {},
): Promise<PrometheusMetricsServer> {
	const {
		endpoint = '/metrics',
		host = '::',
		port = Number(process.env.METRICS_PORT) || 9090,
		...registryOptions
	} = options;

	const metrics = createMetricsRegistry(registryOptions);
	const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

	const server: Server = createServer(async (req, res) => {
		if (req.method === 'GET' && req.url?.split('?')[0] === path) {
			res.writeHead(200, { 'Content-Type': metrics.contentType });
			res.end(await metrics.registry.metrics());
			return;
		}

		res.writeHead(404).end();
	});

	await new Promise<void>((resolve, reject) => {
		server.once('error', reject);
		server.listen(port, host, () => {
			server.off('error', reject);
			resolve();
		});
	});

	const address = server.address();
	const boundPort = typeof address === 'object' && address ? address.port : port;

	return {
		close: () => new Promise<void>((resolve, reject) => {
			server.close(err => err ? reject(err) : resolve());
		}),
		metrics,
		port: boundPort,
	};
}
