/* * */

import { type RidePerformanceBucket, type RidePerformanceDay } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type DepartureDelayMetrics, DepartureDelayMetricsSchema, type ServiceComplianceMetrics, ServiceComplianceMetricsSchema, type VkmExecutionMetrics, VkmExecutionMetricsSchema } from '@tmlmobilidade/go-types-public-info';
import { validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';

/* * */

const DEPARTURE_DELAY_INTERVAL_MINUTES = 60;
const DEPARTURE_DELAY_TARGET_PCT = 10;
const SERVICE_COMPLIANCE_INTERVAL_MINUTES = 120;
const SERVICE_COMPLIANCE_TARGET_PCT = 95;
const VKM_EXECUTION_INTERVAL_MINUTES = 120;
const VKM_EXECUTION_TARGET_PCT = 95;

interface PublishedRideMetrics {
	departureDelays: DepartureDelayMetrics
	serviceCompliance: ServiceComplianceMetrics
	vkmExecution: VkmExecutionMetrics
}

/* * */

function createEmptyBucket(agencyId: string, intervalStart: number): RidePerformanceBucket {
	return {
		agency_id: agencyId,
		combined_executed_distance_m: 0,
		combined_execution_failure_rides_qty: 0,
		delay_10_to_20_minutes_rides_qty: 0,
		delay_5_to_10_minutes_rides_qty: 0,
		delay_eligible_rides_qty: 0,
		delay_more_than_20_minutes_rides_qty: 0,
		delayed_more_than_five_minutes_rides_qty: 0,
		interval_start: validateUnixTimestamp(intervalStart),
		rides_without_execution_evidence_qty: 0,
		scheduled_distance_m: 0,
		scheduled_rides_total_qty: 0,
		scheduled_rides_until_cutoff_qty: 0,
		simple_one_apex_validation_distance_m: 0,
		simple_one_apex_validation_fail_rides_qty: 0,
		simple_three_vehicle_events_distance_m: 0,
		simple_three_vehicle_events_fail_rides_qty: 0,
		source_watermark: null,
		start_delay_minutes_sum: 0,
		start_delay_sample_qty: 0,
	};
}

function addBucket(total: RidePerformanceBucket, current: RidePerformanceBucket) {
	total.combined_execution_failure_rides_qty += current.combined_execution_failure_rides_qty;
	total.combined_executed_distance_m += current.combined_executed_distance_m;
	total.delay_10_to_20_minutes_rides_qty += current.delay_10_to_20_minutes_rides_qty;
	total.delay_5_to_10_minutes_rides_qty += current.delay_5_to_10_minutes_rides_qty;
	total.delay_eligible_rides_qty += current.delay_eligible_rides_qty;
	total.delay_more_than_20_minutes_rides_qty += current.delay_more_than_20_minutes_rides_qty;
	total.delayed_more_than_five_minutes_rides_qty += current.delayed_more_than_five_minutes_rides_qty;
	total.rides_without_execution_evidence_qty += current.rides_without_execution_evidence_qty;
	total.scheduled_distance_m += current.scheduled_distance_m;
	total.scheduled_rides_total_qty += current.scheduled_rides_total_qty;
	total.scheduled_rides_until_cutoff_qty += current.scheduled_rides_until_cutoff_qty;
	total.simple_one_apex_validation_distance_m += current.simple_one_apex_validation_distance_m;
	total.simple_one_apex_validation_fail_rides_qty += current.simple_one_apex_validation_fail_rides_qty;
	total.simple_three_vehicle_events_distance_m += current.simple_three_vehicle_events_distance_m;
	total.simple_three_vehicle_events_fail_rides_qty += current.simple_three_vehicle_events_fail_rides_qty;
	total.start_delay_minutes_sum += current.start_delay_minutes_sum;
	total.start_delay_sample_qty += current.start_delay_sample_qty;

	if (current.source_watermark !== null) {
		total.source_watermark = validateUnixTimestamp(
			Math.max(total.source_watermark ?? 0, current.source_watermark),
		);
	}
}

function getBuckets(
	day: RidePerformanceDay,
	agencyIds: string[],
	intervalMinutes: number,
) {
	const intervalMs = intervalMinutes * 60 * 1_000;
	const latestIntervalIndex = Math.max(
		0,
		Math.floor((day.current_cutoff - day.operational_date_start) / intervalMs),
	);
	const bucketsByKey = new Map<string, RidePerformanceBucket>();

	for (const agencyId of agencyIds) {
		for (let index = 0; index <= latestIntervalIndex; index++) {
			const intervalStart = day.operational_date_start + index * intervalMs;
			bucketsByKey.set(
				`${agencyId}:${index}`,
				createEmptyBucket(agencyId, intervalStart),
			);
		}
	}

	for (const source of day.buckets) {
		if (!agencyIds.includes(source.agency_id)) continue;
		const intervalIndex = Math.floor(
			(source.interval_start - day.operational_date_start) / intervalMs,
		);
		if (intervalIndex < 0 || intervalIndex > latestIntervalIndex) continue;

		const key = `${source.agency_id}:${intervalIndex}`;
		let bucket = bucketsByKey.get(key);
		if (!bucket) {
			bucket = createEmptyBucket(
				source.agency_id,
				day.operational_date_start + intervalIndex * intervalMs,
			);
		}
		addBucket(bucket, source);
		bucketsByKey.set(key, bucket);
	}

	return [...bucketsByKey.values()].sort((left, right) =>
		left.agency_id.localeCompare(right.agency_id)
		|| left.interval_start - right.interval_start,
	);
}

function percentage(numerator: number, denominator: number) {
	if (denominator === 0) return null;
	return Math.min(100, Math.max(0, numerator / denominator * 100));
}

function sumBuckets(buckets: RidePerformanceBucket[]) {
	const total = createEmptyBucket('total', buckets[0]?.interval_start ?? 0);
	for (const bucket of buckets) addBucket(total, bucket);
	return total;
}

/* * */

function buildServiceCompliance(day: RidePerformanceDay, agencyIds: string[]) {
	const buckets = getBuckets(day, agencyIds, SERVICE_COMPLIANCE_INTERVAL_MINUTES);
	const total = sumBuckets(buckets);
	const scheduledRidesQty = total.scheduled_rides_until_cutoff_qty;
	const unexecutedRidesQty = total.combined_execution_failure_rides_qty;
	const executedRidesQty = Math.max(0, scheduledRidesQty - unexecutedRidesQty);
	const compliancePct = percentage(executedRidesQty, scheduledRidesQty);

	return {
		trend: buckets.map((bucket) => {
			const scheduled = bucket.scheduled_rides_until_cutoff_qty;
			const executed = Math.max(0, scheduled - bucket.combined_execution_failure_rides_qty);

			return {
				compliance_pct: percentage(executed, scheduled),
				executed_rides_qty: executed,
				interval_start: bucket.interval_start,
				scheduled_rides_qty: scheduled,
			};
		}),
		value: {
			compliance_pct: compliancePct,
			compliance_status: compliancePct === null
				? 'unavailable' as const
				: compliancePct >= SERVICE_COMPLIANCE_TARGET_PCT
					? 'meets_target' as const
					: 'below_target' as const,
			executed_rides_qty: executedRidesQty,
			rides_without_execution_evidence_qty: total.rides_without_execution_evidence_qty,
			scheduled_rides_qty: scheduledRidesQty,
			unexecuted_rides_qty: unexecutedRidesQty,
		},
	};
}

function buildDepartureDelays(day: RidePerformanceDay, agencyIds: string[]) {
	const buckets = getBuckets(day, agencyIds, DEPARTURE_DELAY_INTERVAL_MINUTES);
	const total = sumBuckets(buckets);
	const delayedRidesQty = total.delayed_more_than_five_minutes_rides_qty;
	const delayedPct = percentage(delayedRidesQty, total.start_delay_sample_qty);

	return {
		trend: buckets.map((bucket) => {
			const bucketDelayedQty = [
				bucket.delay_5_to_10_minutes_rides_qty,
				bucket.delay_10_to_20_minutes_rides_qty,
				bucket.delay_more_than_20_minutes_rides_qty,
			].reduce((total, value) => total + value, 0);

			return {
				delay_10_to_20_minutes_rides_qty: bucket.delay_10_to_20_minutes_rides_qty,
				delay_5_to_10_minutes_rides_qty: bucket.delay_5_to_10_minutes_rides_qty,
				delay_more_than_20_minutes_rides_qty: bucket.delay_more_than_20_minutes_rides_qty,
				delayed_more_than_five_minutes_pct: percentage(
					bucketDelayedQty,
					bucket.start_delay_sample_qty,
				),
				interval_start: bucket.interval_start,
				observed_rides_qty: bucket.start_delay_sample_qty,
			};
		}),
		value: {
			average_start_delay_minutes: total.start_delay_sample_qty === 0
				? null
				: total.start_delay_minutes_sum / total.start_delay_sample_qty,
			coverage_pct: percentage(total.start_delay_sample_qty, total.delay_eligible_rides_qty),
			delay_status: delayedPct === null
				? 'unavailable' as const
				: delayedPct > DEPARTURE_DELAY_TARGET_PCT
					? 'above_target' as const
					: 'within_target' as const,
			delayed_more_than_five_minutes_pct: delayedPct,
			delayed_more_than_five_minutes_rides_qty: delayedRidesQty,
			eligible_rides_qty: total.delay_eligible_rides_qty,
			observed_rides_qty: total.start_delay_sample_qty,
		},
	};
}

function buildVkmExecution(day: RidePerformanceDay, agencyIds: string[]) {
	const buckets = getBuckets(day, agencyIds, VKM_EXECUTION_INTERVAL_MINUTES);
	const total = sumBuckets(buckets);
	const scheduledDistanceKm = total.scheduled_distance_m / 1_000;
	const executedDistanceKm = total.combined_executed_distance_m / 1_000;
	const executionPct = percentage(executedDistanceKm, scheduledDistanceKm);

	return {
		trend: buckets.map((bucket) => {
			const scheduled = bucket.scheduled_distance_m / 1_000;
			const executed = bucket.combined_executed_distance_m / 1_000;

			return {
				executed_distance_km: executed,
				execution_pct: percentage(executed, scheduled),
				interval_start: bucket.interval_start,
				scheduled_distance_km: scheduled,
			};
		}),
		value: {
			distance_to_plan_km: Math.max(0, scheduledDistanceKm - executedDistanceKm),
			executed_distance_km: executedDistanceKm,
			execution_pct: executionPct,
			execution_status: executionPct === null
				? 'unavailable' as const
				: executionPct >= VKM_EXECUTION_TARGET_PCT
					? 'within_target' as const
					: 'below_target' as const,
			scheduled_distance_km: scheduledDistanceKm,
		},
	};
}

/* * */

export function buildPublishedRideMetrics(day: RidePerformanceDay): PublishedRideMetrics {
	const agencyIds = [...new Set(day.buckets.map(bucket => bucket.agency_id))].sort();
	if (agencyIds.length === 0) throw new Error('Ride performance query returned no agencies');
	const departureDelaysByAgency = Object.fromEntries(agencyIds.map(agencyId => [
		agencyId,
		buildDepartureDelays(day, [agencyId]),
	]));
	const serviceComplianceByAgency = Object.fromEntries(agencyIds.map(agencyId => [
		agencyId,
		buildServiceCompliance(day, [agencyId]),
	]));
	const vkmExecutionByAgency = Object.fromEntries(agencyIds.map(agencyId => [
		agencyId,
		buildVkmExecution(day, [agencyId]),
	]));
	const departureDelaysTotal = buildDepartureDelays(day, agencyIds);
	const serviceComplianceTotal = buildServiceCompliance(day, agencyIds);
	const vkmExecutionTotal = buildVkmExecution(day, agencyIds);

	return {
		departureDelays: DepartureDelayMetricsSchema.parse({
			agencies: agencyIds.map(agencyId => ({
				agency_id: agencyId,
				availability: true,
				...departureDelaysByAgency[agencyId],
			})),
			definition_version: 'departure-delays-v1',
			meta: {
				current_cutoff: day.current_cutoff,
				current_operational_date: day.operational_date,
				generated_at: day.generated_at,
				interval_minutes: DEPARTURE_DELAY_INTERVAL_MINUTES,
				requested_agency_ids: agencyIds,
				status: 'complete',
				target_pct: DEPARTURE_DELAY_TARGET_PCT,
				unavailable_agency_ids: [],
			},
			total: departureDelaysTotal,
		}),
		serviceCompliance: ServiceComplianceMetricsSchema.parse({
			agencies: agencyIds.map(agencyId => ({
				agency_id: agencyId,
				availability: true,
				...serviceComplianceByAgency[agencyId],
			})),
			definition_version: 'service-compliance-v1',
			meta: {
				current_cutoff: day.current_cutoff,
				current_operational_date: day.operational_date,
				generated_at: day.generated_at,
				interval_minutes: SERVICE_COMPLIANCE_INTERVAL_MINUTES,
				requested_agency_ids: agencyIds,
				status: 'complete',
				target_pct: SERVICE_COMPLIANCE_TARGET_PCT,
				unavailable_agency_ids: [],
			},
			total: serviceComplianceTotal,
		}),
		vkmExecution: VkmExecutionMetricsSchema.parse({
			agencies: agencyIds.map(agencyId => ({
				agency_id: agencyId,
				availability: true,
				...vkmExecutionByAgency[agencyId],
			})),
			definition_version: 'vkm-execution-v1',
			meta: {
				current_cutoff: day.current_cutoff,
				current_operational_date: day.operational_date,
				generated_at: day.generated_at,
				interval_minutes: VKM_EXECUTION_INTERVAL_MINUTES,
				requested_agency_ids: agencyIds,
				status: 'complete',
				target_pct: VKM_EXECUTION_TARGET_PCT,
				unavailable_agency_ids: [],
			},
			total: vkmExecutionTotal,
		}),
	};
}
