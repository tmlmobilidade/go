/* * */

import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type UnixTimestamp, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';

import { type RidePerformanceBucket, type RidePerformanceDay, type RidePerformanceQueryInput, type RidePerformanceSourceRow } from './types.js';

/* * */

const BASE_INTERVAL_MS = 60 * 60 * 1_000;
const ELIGIBILITY_GRACE_MS = 5 * 60 * 1_000;
const RIDE_END_GRACE_MS = 2 * 60 * 1_000;

export const CURRENT_OPERATIONAL_DAY_QUERY = `
	SELECT
		rides._id AS ride_id,
		rides.agency_id AS agency_id,
		rides.processing_status AS processing_status,
		rides.extension_scheduled AS extension_scheduled,
		rides.seen_first_at AS seen_first_at,
		rides.seen_last_at AS seen_last_at,
		rides.start_time_observed AS start_time_observed,
		rides.start_time_scheduled AS start_time_scheduled,
		expected.analysis_present AS expected_analysis_present,
		expected.reason AS expected_reason,
		expected.observed_start_time_delta AS start_time_delta_minutes,
		one_apex.analysis_present AS one_apex_analysis_present,
		one_apex.grade_status AS one_apex_grade_status,
		three_events.analysis_present AS three_events_analysis_present,
		three_events.grade_status AS three_events_grade_status,
		greatest(
			rides.updated_at,
			ifNull(expected.updated_at, 0),
			ifNull(one_apex.updated_at, 0),
			ifNull(three_events.updated_at, 0)
		) AS updated_at
	FROM operation.rides AS rides FINAL
	LEFT JOIN (
		SELECT
			ride_id,
			reason,
			observed_start_time_delta,
			updated_at,
			1 AS analysis_present
		FROM operation.ride_analysis_expected_start_time FINAL
		WHERE operational_date = $1
	) AS expected ON expected.ride_id = rides._id
	LEFT JOIN (
		SELECT
			ride_id,
			grade_status,
			updated_at,
			1 AS analysis_present
		FROM operation.ride_analysis_simple_one_apex_validation FINAL
		WHERE operational_date = $1
	) AS one_apex ON one_apex.ride_id = rides._id
	LEFT JOIN (
		SELECT
			ride_id,
			grade_status,
			updated_at,
			1 AS analysis_present
		FROM operation.ride_analysis_simple_three_vehicle_events FINAL
		WHERE operational_date = $1
	) AS three_events ON three_events.ride_id = rides._id
	WHERE rides.operational_date = $1
	ORDER BY
		rides.agency_id,
		rides.start_time_scheduled,
		rides._id
`;

/* * */

function asBoolean(value: boolean | number) {
	return value === true || Number(value) === 1;
}

function asNullableNumber(value: null | number | string) {
	return value === null ? null : Number(value);
}

function createBucket(agencyId: string, intervalStart: UnixTimestamp): RidePerformanceBucket {
	return {
		agency_id: agencyId,
		combined_executed_distance_m: 0,
		combined_execution_failure_rides_qty: 0,
		delay_10_to_20_minutes_rides_qty: 0,
		delay_5_to_10_minutes_rides_qty: 0,
		delay_eligible_rides_qty: 0,
		delay_more_than_20_minutes_rides_qty: 0,
		delayed_more_than_five_minutes_rides_qty: 0,
		interval_start: intervalStart,
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

function getIntervalStart(startTime: number, operationalDateStart: UnixTimestamp) {
	return validateUnixTimestamp(
		operationalDateStart
		+ Math.floor((startTime - operationalDateStart) / BASE_INTERVAL_MS) * BASE_INTERVAL_MS,
	);
}

/* * */

export function buildRidePerformanceDay(
	rows: RidePerformanceSourceRow[],
	input: RidePerformanceQueryInput,
): RidePerformanceDay {
	const bucketsByKey = new Map<string, RidePerformanceBucket>();
	const eligibleScheduledCutoff = input.current_cutoff - ELIGIBILITY_GRACE_MS;
	const endedCutoff = input.current_cutoff - RIDE_END_GRACE_MS;
	let sourceWatermark: null | number = null;

	for (const row of rows) {
		const startTimeScheduled = Number(row.start_time_scheduled);
		const intervalStart = getIntervalStart(startTimeScheduled, input.operational_date_start);
		const bucketKey = `${row.agency_id}:${intervalStart}`;
		const bucket = bucketsByKey.get(bucketKey) ?? createBucket(row.agency_id, intervalStart);
		const extensionScheduled = Math.max(0, Number(row.extension_scheduled));
		const seenFirstAt = asNullableNumber(row.seen_first_at);
		const seenLastAt = asNullableNumber(row.seen_last_at);
		const startTimeObserved = asNullableNumber(row.start_time_observed);
		const startTimeDeltaMinutes = asNullableNumber(row.start_time_delta_minutes);
		const isComplete = row.processing_status === 'complete';
		const hasExpectedAnalysis = asBoolean(row.expected_analysis_present);
		const hasServiceAnalyses = [
			asBoolean(row.one_apex_analysis_present),
			asBoolean(row.three_events_analysis_present),
		].every(Boolean);
		const isScheduledEligible = [
			isComplete,
			hasServiceAnalyses,
			startTimeScheduled <= eligibleScheduledCutoff,
		].every(Boolean);
		const hasNoExecutionEvidence = isScheduledEligible && seenFirstAt === null;
		const hasEndedEvidence = [
			isScheduledEligible,
			seenFirstAt !== null,
			seenLastAt !== null,
			seenLastAt !== null && seenLastAt <= endedCutoff,
		].every(Boolean);
		const oneApexPassed = row.one_apex_grade_status === 'pass';
		const threeEventsPassed = row.three_events_grade_status === 'pass';
		const hasDelayObservation = isComplete && startTimeObserved !== null && hasExpectedAnalysis;
		const hasDelaySample = [
			hasDelayObservation,
			startTimeDeltaMinutes !== null,
			startTimeDeltaMinutes !== null && startTimeDeltaMinutes >= 0,
		].every(Boolean);
		const oneApexFailed = hasNoExecutionEvidence || (hasEndedEvidence && !oneApexPassed);
		const threeEventsFailed = hasNoExecutionEvidence || (hasEndedEvidence && !threeEventsPassed);
		const combinedExecutionFailed = hasNoExecutionEvidence || (hasEndedEvidence && !oneApexPassed && !threeEventsPassed);
		const isLateStart = hasDelayObservation && row.expected_reason === 'LATE_START';
		const updatedAt = Number(row.updated_at);

		bucket.scheduled_rides_total_qty += 1;
		bucket.delay_eligible_rides_qty += startTimeScheduled <= eligibleScheduledCutoff ? 1 : 0;
		bucket.scheduled_rides_until_cutoff_qty += isScheduledEligible ? 1 : 0;
		bucket.rides_without_execution_evidence_qty += hasNoExecutionEvidence ? 1 : 0;
		bucket.simple_one_apex_validation_fail_rides_qty += oneApexFailed ? 1 : 0;
		bucket.simple_three_vehicle_events_fail_rides_qty += threeEventsFailed ? 1 : 0;
		bucket.combined_execution_failure_rides_qty += combinedExecutionFailed ? 1 : 0;
		bucket.scheduled_distance_m += isScheduledEligible ? extensionScheduled : 0;
		bucket.simple_one_apex_validation_distance_m += hasEndedEvidence && oneApexPassed
			? extensionScheduled
			: 0;
		bucket.simple_three_vehicle_events_distance_m += hasEndedEvidence && threeEventsPassed
			? extensionScheduled
			: 0;
		bucket.combined_executed_distance_m += hasEndedEvidence && (oneApexPassed || threeEventsPassed)
			? extensionScheduled
			: 0;
		bucket.delayed_more_than_five_minutes_rides_qty += isLateStart ? 1 : 0;

		if (hasDelaySample && startTimeDeltaMinutes !== null) {
			bucket.start_delay_minutes_sum += startTimeDeltaMinutes;
			bucket.start_delay_sample_qty += 1;
			bucket.delay_5_to_10_minutes_rides_qty += startTimeDeltaMinutes > 5 && startTimeDeltaMinutes <= 10 ? 1 : 0;
			bucket.delay_10_to_20_minutes_rides_qty += startTimeDeltaMinutes > 10 && startTimeDeltaMinutes <= 20 ? 1 : 0;
			bucket.delay_more_than_20_minutes_rides_qty += startTimeDeltaMinutes > 20 ? 1 : 0;
		}

		bucket.source_watermark = validateUnixTimestamp(Math.max(bucket.source_watermark ?? 0, updatedAt));
		sourceWatermark = Math.max(sourceWatermark ?? 0, updatedAt);
		bucketsByKey.set(bucketKey, bucket);
	}

	return {
		buckets: [...bucketsByKey.values()].sort((left, right) =>
			left.agency_id.localeCompare(right.agency_id)
			|| left.interval_start - right.interval_start,
		),
		current_cutoff: input.current_cutoff,
		definition_version: 'ride-performance-direct-v1',
		generated_at: input.current_cutoff,
		operational_date: input.operational_date,
		operational_date_start: input.operational_date_start,
		source_watermark: sourceWatermark === null ? null : validateUnixTimestamp(sourceWatermark),
	};
}

/* * */

export async function queryRidePerformanceDay(input: RidePerformanceQueryInput) {
	const rows = await labDb.operation.rides.queryFromString<RidePerformanceSourceRow>(
		CURRENT_OPERATIONAL_DAY_QUERY,
		{ 1: input.operational_date },
	);

	return buildRidePerformanceDay(rows, input);
}
