/* * */

import { buildDemandMetricsByEntity, getDemandMetricTimeGrain, getHistoricalDemandMetricsPublishSlot, replaceDemandMetricsCache } from '@/helpers/historical/demand-metrics.js';
import { hubHistoricalDemandByPatternMetricsCacheKey, hubHistoricalDemandByPatternMetricsCachePattern } from '@tmlmobilidade/go-interfaces-cachedb';
import { queryDemandByPattern } from '@tmlmobilidade/go-performance-pckg-scripts';
import { DemandByPatternMetricsByTimeGrainSchema } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const UNKNOWN_DIMENSION_ID = '__unknown__';

let LAST_COMPLETED_PUBLISH_SLOT: null | number = null;

/* * */

export async function publishDemandByPatternMetrics(
	referenceTimestamp = Date.now(),
) {
	const publishSlot = getHistoricalDemandMetricsPublishSlot(referenceTimestamp);
	if (LAST_COMPLETED_PUBLISH_SLOT === publishSlot) return;

	Logger.title('Publishing Historical Demand by Pattern Metrics...');
	const timer = new Timer();
	const metrics = (await Promise.all([
		queryDemandByPattern({ time_grain: 'day' }),
		queryDemandByPattern({ time_grain: 'month' }),
		queryDemandByPattern({ time_grain: 'year' }),
	])).flat().filter(metric => metric.properties.pattern_id !== UNKNOWN_DIMENSION_ID);

	const metricsByPattern = buildDemandMetricsByEntity({
		getEntityId: metric => metric.properties.pattern_id,
		getTimeGrain: metric => getDemandMetricTimeGrain(metric.metric),
		metrics,
		parse: value => DemandByPatternMetricsByTimeGrainSchema.parse(value),
	});
	const publication = await replaceDemandMetricsCache({
		cacheKeyPattern: hubHistoricalDemandByPatternMetricsCachePattern,
		getCacheKey: hubHistoricalDemandByPatternMetricsCacheKey,
		metricsByEntity: metricsByPattern,
	});

	LAST_COMPLETED_PUBLISH_SLOT = publishSlot;
	Logger.success(`Finished publishing Historical Demand by Pattern Metrics: ${publication.entities_qty} patterns, ${publication.serialized_bytes} bytes (${timer.get()})`);
}
