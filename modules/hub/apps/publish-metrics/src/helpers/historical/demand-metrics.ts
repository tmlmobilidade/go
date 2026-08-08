/* * */

import { cacheDb, type CacheDbKey } from '@tmlmobilidade/go-interfaces-cachedb';

/* * */

export const HISTORICAL_DEMAND_METRICS_PUBLISH_INTERVAL_MS = 10 * 60 * 1_000;

type DemandMetricTimeGrain = 'day' | 'month' | 'year';

/* * */

export function getHistoricalDemandMetricsPublishSlot(
	referenceTimestamp = Date.now(),
) {
	return Math.floor(referenceTimestamp / HISTORICAL_DEMAND_METRICS_PUBLISH_INTERVAL_MS);
}

export function getDemandMetricTimeGrain(metricId: string): DemandMetricTimeGrain {
	if (metricId.endsWith('_by_day')) return 'day';
	if (metricId.endsWith('_by_month')) return 'month';
	if (metricId.endsWith('_by_year')) return 'year';

	throw new Error(`Unsupported historical demand metric: ${metricId}`);
}

export function buildDemandMetricsByEntity<TMetric, TResult>({
	getEntityId,
	getTimeGrain,
	metrics,
	parse,
}: {
	getEntityId: (metric: TMetric) => string
	getTimeGrain: (metric: TMetric) => DemandMetricTimeGrain
	metrics: TMetric[]
	parse: (value: unknown) => TResult
}) {
	const metricsByEntity = new Map<string, Partial<Record<DemandMetricTimeGrain, TMetric>>>();

	for (const metric of metrics) {
		const entityId = getEntityId(metric);
		const entityMetrics = metricsByEntity.get(entityId) ?? {};
		entityMetrics[getTimeGrain(metric)] = metric;
		metricsByEntity.set(entityId, entityMetrics);
	}

	return new Map([...metricsByEntity].map(([entityId, entityMetrics]) => [
		entityId,
		parse(entityMetrics),
	]));
}

export async function replaceDemandMetricsCache<TResult>({
	cacheKeyPattern,
	getCacheKey,
	metricsByEntity,
}: {
	cacheKeyPattern: string
	getCacheKey: (entityId: string) => CacheDbKey
	metricsByEntity: Map<string, TResult>
}) {
	if (metricsByEntity.size === 0) {
		throw new Error(`Refusing to replace ${cacheKeyPattern} with an empty publication`);
	}

	let serializedBytes = 0;
	const entries = [...metricsByEntity].map(([entityId, metrics]) => {
		const value = JSON.stringify(metrics);
		serializedBytes += Buffer.byteLength(value);

		return {
			key: getCacheKey(entityId),
			value,
		};
	});

	await cacheDb.setMany(entries);

	const publishedKeys = new Set(entries.map(entry => entry.key));
	const existingKeys = await cacheDb.scan(cacheKeyPattern);
	const staleKeys = existingKeys.filter(key => !publishedKeys.has(key as CacheDbKey));
	await cacheDb.deleteMany(staleKeys);

	return {
		entities_qty: metricsByEntity.size,
		serialized_bytes: serializedBytes,
		stale_keys_deleted_qty: staleKeys.length,
	};
}
