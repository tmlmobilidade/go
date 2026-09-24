import {
	collectDefaultMetrics,
	Counter,
	Gauge,
	Histogram,
	Registry,
	Summary,
} from '@prometheus-io/client';

import type { CreateMetricsRegistryOptions } from './types.js';

export type MetricsRegistry = {
	registry: Registry
	contentType: string
	prefix: string
};

function normalizePrefix(name: string): string {
	const trimmed = name.trim().replace(/_+$/u, '');
	return trimmed ? `${trimmed}_` : '';
}

/**
 * Create an isolated Prometheus registry with optional Node default metrics.
 * Safe for workers / CLI (no Fastify).
 */
export function createMetricsRegistry(
	options: CreateMetricsRegistryOptions = {},
): MetricsRegistry {
	const {
		name = 'api',
		collectDefaults = true,
	} = options;

	const prefix = normalizePrefix(name);
	const registry = new Registry();

	if (collectDefaults) {
		collectDefaultMetrics({ prefix, register: registry });
	}

	return {
		contentType: registry.contentType,
		prefix,
		registry,
	};
}

export {
	Counter,
	Gauge,
	Histogram,
	Registry,
	Summary,
};
