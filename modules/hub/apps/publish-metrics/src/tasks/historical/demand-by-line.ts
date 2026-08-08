/* * */

import { buildDemandMetricsByEntity, getDemandMetricTimeGrain, getHistoricalDemandMetricsPublishSlot, replaceDemandMetricsCache } from '@/helpers/historical/demand-metrics.js';
import { hubHistoricalDemandByLineMetricsCacheKey, hubHistoricalDemandByLineMetricsCachePattern } from '@tmlmobilidade/go-interfaces-cachedb';
import { queryDemandByLine } from '@tmlmobilidade/go-performance-pckg-scripts';
import { DemandByLineMetricsByTimeGrainSchema } from '@tmlmobilidade/go-types-performance';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const UNKNOWN_DIMENSION_ID = '__unknown__';

let LAST_COMPLETED_PUBLISH_SLOT: null | number = null;

/* * */

export async function publishDemandByLineMetrics(
	referenceTimestamp = Date.now(),
) {
	const publishSlot = getHistoricalDemandMetricsPublishSlot(referenceTimestamp);
	if (LAST_COMPLETED_PUBLISH_SLOT === publishSlot) return;

	Logger.title('Publishing Historical Demand by Line Metrics...');
	const timer = new Timer();
	const metrics = (await Promise.all([
		queryDemandByLine({ time_grain: 'day' }),
		queryDemandByLine({ time_grain: 'month' }),
		queryDemandByLine({ time_grain: 'year' }),
	])).flat().filter(metric => metric.properties.line_id !== UNKNOWN_DIMENSION_ID);

	const metricsByLine = buildDemandMetricsByEntity({
		getEntityId: metric => metric.properties.line_id,
		getTimeGrain: metric => getDemandMetricTimeGrain(metric.metric),
		metrics,
		parse: value => DemandByLineMetricsByTimeGrainSchema.parse(value),
	});
	const publication = await replaceDemandMetricsCache({
		cacheKeyPattern: hubHistoricalDemandByLineMetricsCachePattern,
		getCacheKey: hubHistoricalDemandByLineMetricsCacheKey,
		metricsByEntity: metricsByLine,
	});

	LAST_COMPLETED_PUBLISH_SLOT = publishSlot;
	Logger.success(`Finished publishing Historical Demand by Line Metrics: ${publication.entities_qty} lines, ${publication.serialized_bytes} bytes (${timer.get()})`);
}
