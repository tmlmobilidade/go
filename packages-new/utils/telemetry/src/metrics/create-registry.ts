import { totalmem } from 'node:os';

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
	let trimmed = name.trim();
	while (trimmed.endsWith('_')) {
		trimmed = trimmed.slice(0, -1);
	}
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
		registerUsageGauges(prefix, registry);
	}

	return {
		contentType: registry.contentType,
		prefix,
		registry,
	};
}

/**
 * CPU and RAM usage sampled at scrape time.
 * CPU is a fraction of one core since the previous scrape (can exceed 1).
 * RAM is resident memory over the cgroup limit, or total system memory when unconstrained.
 */
function registerUsageGauges(prefix: string, registry: Registry): void {
	let lastCpu = process.cpuUsage();
	let lastAt = process.hrtime.bigint();

	const cpuUsage = new Gauge({
		collect() {
			const now = process.hrtime.bigint();
			const elapsedUs = Number(now - lastAt) / 1e3;
			const diff = process.cpuUsage(lastCpu);
			lastCpu = process.cpuUsage();
			lastAt = now;
			cpuUsage.set(elapsedUs > 0 ? (diff.user + diff.system) / elapsedUs : 0);
		},
		help: 'Process CPU usage since the previous scrape, as a fraction of one core',
		name: `${prefix}process_cpu_usage_ratio`,
		registers: [registry],
	});

	const memoryUsage = new Gauge({
		collect() {
			const limit = process.constrainedMemory() || totalmem();
			memoryUsage.set(limit > 0 ? process.memoryUsage().rss / limit : 0);
		},
		help: 'Resident memory as a fraction of the cgroup limit, or of total system memory',
		name: `${prefix}process_memory_usage_ratio`,
		registers: [registry],
	});
}

export {
	Counter,
	Gauge,
	Histogram,
	Registry,
	Summary,
};
