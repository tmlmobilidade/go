/* * */

import { calculateVideowallDemand, type VideowallDemandResult } from '@/helpers/videowall-demand.js';
import { calculateVideowallService, type VideowallServiceResult } from '@/helpers/videowall-service.js';
import { Dates } from '@tmlmobilidade/dates';
import { cacheDb, hubV2VideowallMetricsCacheKey } from '@tmlmobilidade/go-interfaces-cachedb';
import { type VideowallMetricsSnapshot, VideowallMetricsSnapshotSchema } from '@tmlmobilidade/go-types-public-info';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export function buildVideowallMetricsSnapshot(
	demand: VideowallDemandResult,
	service: VideowallServiceResult,
): VideowallMetricsSnapshot {
	const agencyIds = [...new Set([
		...Object.keys(demand.agencies),
		...Object.keys(service.agencies),
	])].sort();

	return VideowallMetricsSnapshotSchema.parse({
		agencies: Object.fromEntries(agencyIds.map(agencyId => [
			agencyId,
			{
				demand: demand.agencies[agencyId] ?? null,
				service: service.agencies[agencyId] ?? null,
			},
		])),
		definition_version: 'videowall-v2',
		meta: {
			demand: {
				current_cutoff: demand.current_cutoff,
				current_operational_date: demand.current_operational_date,
				definition_version: demand.definition_version,
				generated_at: demand.generated_at,
				last_week_cutoff: demand.last_week_cutoff,
				last_week_operational_date: demand.last_week_operational_date,
			},
			service: {
				definition_version: service.definition_version,
				eligible_scheduled_cutoff: service.eligible_scheduled_cutoff,
				generated_at: service.generated_at,
				operational_date: service.operational_date,
				reference_cutoff: service.reference_cutoff,
			},
			sources_aligned: demand.current_operational_date === service.operational_date,
		},
	});
}

export async function publishVideowallMetrics() {
	//

	Logger.title('Publishing Videowall Metrics V2...');
	const timer = new Timer();
	const referenceNow = Dates.now('Europe/Lisbon');
	const [demand, service] = await Promise.all([
		calculateVideowallDemand(referenceNow),
		calculateVideowallService(referenceNow),
	]);
	const result = buildVideowallMetricsSnapshot(demand, service);

	await cacheDb.set(hubV2VideowallMetricsCacheKey, JSON.stringify(result));

	Logger.success(`Finished publishing Videowall Metrics V2 (${timer.get()})`);

	//
}
