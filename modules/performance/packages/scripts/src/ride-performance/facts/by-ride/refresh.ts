/* * */

import { createLockedClickHouseExecutor, type MetricRefreshLock, type MetricRefreshStats, runMetricRefresh } from '@/metric-refresh-execution/index.js';
import { type RidePerformanceDataStatus } from '@tmlmobilidade/go-types-performance';
import { type OperationalDateInt, type UnixTimestamp, validateUnixTimestamp } from '@tmlmobilidade/go-types-shared';

import { RIDE_PERFORMANCE_DEFINITION_VERSION, RIDE_PERFORMANCE_ELIGIBILITY_GRACE_MS, RIDE_PERFORMANCE_END_GRACE_MS, RIDE_PERFORMANCE_INTERVAL_MS, RIDE_PERFORMANCE_UNKNOWN_DIMENSION_ID } from '../../definition.js';
import { buildCurrentRidePerformanceRefreshRange, buildRecentRidePerformanceRefreshRange, buildRidePerformanceBackfillRange, listRidePerformanceOperationalDates, type RidePerformanceRefreshRange } from './refresh-policy.js';

/* * */

const BACKFILL_LOCK_WAIT_MS = 10 * 60 * 1_000;
const RIDE_PERFORMANCE_LOCK_KEY = 'performance:ride-service-by-ride:refresh-lock';
const RIDE_PERFORMANCE_METRIC_NAME = 'ride_service_by_ride';

const FACT_COLUMNS = `
	advanced_rides_qty,
	agency_id,
	calculated_at,
	combined_executed_distance_m,
	combined_execution_failure_rides_qty,
	data_status,
	definition_version,
	delay_10_to_20_minutes_rides_qty,
	delay_5_to_10_minutes_rides_qty,
	delay_eligible_rides_qty,
	delay_more_than_20_minutes_rides_qty,
	delayed_more_than_five_minutes_rides_qty,
	expected_start_analysis_ready_qty,
	interval_start,
	line_id,
	observed_start_rides_qty,
	operational_date,
	pattern_id,
	processing_complete_qty,
	ride_id,
	rides_without_execution_evidence_qty,
	scheduled_distance_m,
	scheduled_rides_total_qty,
	scheduled_rides_until_cutoff_qty,
	simple_one_apex_validation_analysis_ready_qty,
	simple_one_apex_validation_distance_m,
	simple_one_apex_validation_fail_rides_qty,
	simple_three_vehicle_events_analysis_ready_qty,
	simple_three_vehicle_events_distance_m,
	simple_three_vehicle_events_fail_rides_qty,
	source_watermark,
	start_delay_minutes_sum,
	start_delay_sample_qty
`;

const DROP_REFRESH_TABLE_QUERY = 'DROP TABLE IF EXISTS performance.ride_service_by_ride_refresh';

// Clone the canonical table structure so the partition expression matches LabDB exactly.
// Explicit PARTITION BY clauses are normalized differently by ClickHouse CREATE ... AS.
const CREATE_REFRESH_TABLE_QUERY = `
	CREATE TABLE performance.ride_service_by_ride_refresh
	AS performance.ride_service_by_ride
	ENGINE = MergeTree()
`;

const TRUNCATE_REFRESH_TABLE_QUERY = 'TRUNCATE TABLE performance.ride_service_by_ride_refresh';

/**
 * The predicates intentionally mirror ride-metrics/current-operational-day.ts.
 * Keep changes to grace periods, readiness, or pass/fail semantics in parity.
 */
export const POPULATE_RIDE_SERVICE_BY_RIDE_REFRESH_QUERY = `
	INSERT INTO performance.ride_service_by_ride_refresh (${FACT_COLUMNS})
	WITH source AS (
		SELECT
			rides._id AS ride_id,
			rides.agency_id,
			rides.route_short_name AS line_id,
			splitByChar('|', rides.trip_id)[1] AS pattern_id,
			rides.processing_status,
			rides.extension_scheduled,
			rides.seen_first_at,
			rides.seen_last_at,
			rides.start_time_observed,
			rides.start_time_scheduled,
			expected.reason AS expected_reason,
			expected.observed_start_time_delta AS start_time_delta_minutes,
			isNotNull(expected.ride_id) AS expected_analysis_present,
			isNotNull(one_apex.ride_id) AS one_apex_analysis_present,
			one_apex.grade_status AS one_apex_grade_status,
			isNotNull(three_events.ride_id) AS three_events_analysis_present,
			three_events.grade_status AS three_events_grade_status,
			greatest(
				rides.updated_at,
				ifNull(expected.updated_at, 0),
				ifNull(one_apex.updated_at, 0),
				ifNull(three_events.updated_at, 0)
			) AS source_watermark
		FROM operation.rides AS rides FINAL
		LEFT JOIN (
			SELECT ride_id, reason, observed_start_time_delta, updated_at
			FROM operation.ride_analysis_expected_start_time FINAL
			WHERE operational_date = {operational_date:UInt32}
		) AS expected ON expected.ride_id = rides._id
		LEFT JOIN (
			SELECT ride_id, grade_status, updated_at
			FROM operation.ride_analysis_simple_one_apex_validation FINAL
			WHERE operational_date = {operational_date:UInt32}
		) AS one_apex ON one_apex.ride_id = rides._id
		LEFT JOIN (
			SELECT ride_id, grade_status, updated_at
			FROM operation.ride_analysis_simple_three_vehicle_events FINAL
			WHERE operational_date = {operational_date:UInt32}
		) AS three_events ON three_events.ride_id = rides._id
		WHERE rides.operational_date = {operational_date:UInt32}
	),
	classified AS (
		SELECT
			*,
			processing_status = 'complete' AS is_complete,
			start_time_scheduled <= {source_cutoff:UInt64} - ${RIDE_PERFORMANCE_ELIGIBILITY_GRACE_MS} AS is_delay_eligible,
			is_complete
				AND one_apex_analysis_present
				AND three_events_analysis_present
				AND is_delay_eligible AS is_service_eligible,
			is_complete AND isNotNull(start_time_observed) AND expected_analysis_present AS has_delay_observation,
			has_delay_observation AND isNotNull(start_time_delta_minutes) AND start_time_delta_minutes >= 0 AS has_delay_sample,
			is_service_eligible AND isNull(seen_first_at) AS has_no_execution_evidence,
			is_service_eligible
				AND isNotNull(seen_first_at)
				AND isNotNull(seen_last_at)
				AND seen_last_at <= {source_cutoff:UInt64} - ${RIDE_PERFORMANCE_END_GRACE_MS} AS has_ended_evidence,
			coalesce(one_apex_grade_status = 'pass', false) AS one_apex_passed,
			coalesce(three_events_grade_status = 'pass', false) AS three_events_passed
		FROM source
	)
	SELECT
		toUInt8(has_delay_observation AND coalesce(expected_reason = 'EARLY_START', false)) AS advanced_rides_qty,
		agency_id,
		toUnixTimestamp64Milli(now64(3)) AS calculated_at,
		toUInt32(if(has_ended_evidence AND (one_apex_passed OR three_events_passed), extension_scheduled, 0)) AS combined_executed_distance_m,
		toUInt8(has_no_execution_evidence OR (has_ended_evidence AND NOT one_apex_passed AND NOT three_events_passed)) AS combined_execution_failure_rides_qty,
		{data_status:String} AS data_status,
		'${RIDE_PERFORMANCE_DEFINITION_VERSION}' AS definition_version,
		toUInt8(has_delay_sample AND start_time_delta_minutes > 10 AND start_time_delta_minutes <= 20) AS delay_10_to_20_minutes_rides_qty,
		toUInt8(has_delay_sample AND start_time_delta_minutes > 5 AND start_time_delta_minutes <= 10) AS delay_5_to_10_minutes_rides_qty,
		toUInt8(is_delay_eligible) AS delay_eligible_rides_qty,
		toUInt8(has_delay_sample AND start_time_delta_minutes > 20) AS delay_more_than_20_minutes_rides_qty,
		toUInt8(has_delay_observation AND coalesce(expected_reason = 'LATE_START', false)) AS delayed_more_than_five_minutes_rides_qty,
		toUInt8(expected_analysis_present) AS expected_start_analysis_ready_qty,
		intDiv(start_time_scheduled, ${RIDE_PERFORMANCE_INTERVAL_MS}) * ${RIDE_PERFORMANCE_INTERVAL_MS} AS interval_start,
		if(empty(line_id), '${RIDE_PERFORMANCE_UNKNOWN_DIMENSION_ID}', line_id) AS line_id,
		toUInt8(has_delay_observation) AS observed_start_rides_qty,
		{operational_date:UInt32} AS operational_date,
		if(empty(pattern_id), '${RIDE_PERFORMANCE_UNKNOWN_DIMENSION_ID}', pattern_id) AS pattern_id,
		toUInt8(is_complete) AS processing_complete_qty,
		ride_id,
		toUInt8(has_no_execution_evidence) AS rides_without_execution_evidence_qty,
		toUInt32(if(is_service_eligible, extension_scheduled, 0)) AS scheduled_distance_m,
		toUInt8(1) AS scheduled_rides_total_qty,
		toUInt8(is_service_eligible) AS scheduled_rides_until_cutoff_qty,
		toUInt8(one_apex_analysis_present) AS simple_one_apex_validation_analysis_ready_qty,
		toUInt32(if(has_ended_evidence AND one_apex_passed, extension_scheduled, 0)) AS simple_one_apex_validation_distance_m,
		toUInt8(has_no_execution_evidence OR (has_ended_evidence AND NOT one_apex_passed)) AS simple_one_apex_validation_fail_rides_qty,
		toUInt8(three_events_analysis_present) AS simple_three_vehicle_events_analysis_ready_qty,
		toUInt32(if(has_ended_evidence AND three_events_passed, extension_scheduled, 0)) AS simple_three_vehicle_events_distance_m,
		toUInt8(has_no_execution_evidence OR (has_ended_evidence AND NOT three_events_passed)) AS simple_three_vehicle_events_fail_rides_qty,
		source_watermark,
		if(has_delay_sample, toFloat64(start_time_delta_minutes), 0) AS start_delay_minutes_sum,
		toUInt8(has_delay_sample) AS start_delay_sample_qty
	FROM classified
`;

const ASSERT_REFRESH_QUERY = `
	SELECT throwIf(
		(SELECT count() FROM operation.rides FINAL WHERE operational_date = {operational_date:UInt32})
			!=
		(SELECT count() FROM performance.ride_service_by_ride_refresh
		 WHERE definition_version = '${RIDE_PERFORMANCE_DEFINITION_VERSION}' AND operational_date = {operational_date:UInt32})
		OR
		(SELECT count() FROM performance.ride_service_by_ride_refresh
		 WHERE definition_version = '${RIDE_PERFORMANCE_DEFINITION_VERSION}' AND operational_date = {operational_date:UInt32})
			!=
		(SELECT uniqExact(tuple(definition_version, operational_date, ride_id))
		 FROM performance.ride_service_by_ride_refresh
		 WHERE definition_version = '${RIDE_PERFORMANCE_DEFINITION_VERSION}' AND operational_date = {operational_date:UInt32}),
		'Ride-performance refresh refused: source rows, staged rows, or logical keys differ.'
	)
`;

const GET_REFRESH_STATS_QUERY = `
	SELECT
		count() AS result_rows_qty,
		count() AS source_rows_qty,
		max(source_watermark) AS source_watermark
	FROM performance.ride_service_by_ride_refresh
	WHERE definition_version = '${RIDE_PERFORMANCE_DEFINITION_VERSION}'
		AND operational_date = {operational_date:UInt32}
`;

const REPLACE_PARTITION_QUERY = `
	ALTER TABLE performance.ride_service_by_ride
	REPLACE PARTITION {operational_date:UInt32}
	FROM performance.ride_service_by_ride_refresh
`;

interface DateRefreshOptions {
	data_status: RidePerformanceDataStatus
	operational_date: OperationalDateInt
	source_cutoff: UnixTimestamp
}

interface RefreshStatsRow {
	result_rows_qty: number | string
	source_rows_qty: number | string
	source_watermark: null | number | string
}

export interface RidePerformanceRefreshResult extends MetricRefreshStats {
	refreshed: boolean
	refreshed_dates: OperationalDateInt[]
}

function normalizeStats(row: RefreshStatsRow): MetricRefreshStats {
	return {
		result_rows_qty: Number(row.result_rows_qty),
		source_rows_qty: Number(row.source_rows_qty),
		source_watermark: row.source_watermark === null ? null : validateUnixTimestamp(row.source_watermark),
	};
}

async function refreshDate(lock: MetricRefreshLock, options: DateRefreshOptions) {
	const clickhouse = createLockedClickHouseExecutor(lock);
	const queryParams = {
		data_status: options.data_status,
		operational_date: options.operational_date,
		source_cutoff: options.source_cutoff,
	};

	await clickhouse.command(TRUNCATE_REFRESH_TABLE_QUERY);
	await clickhouse.command(POPULATE_RIDE_SERVICE_BY_RIDE_REFRESH_QUERY, queryParams);
	await clickhouse.assert(ASSERT_REFRESH_QUERY, queryParams);
	const [statsRow] = await clickhouse.query<RefreshStatsRow>(GET_REFRESH_STATS_QUERY, queryParams);
	if (!statsRow) throw new Error(`Could not read ride-performance refresh statistics for ${options.operational_date}.`);
	const stats = normalizeStats(statsRow);
	if (stats.source_rows_qty > 0) await clickhouse.command(REPLACE_PARTITION_QUERY, queryParams);
	return stats;
}

async function refreshRange(lock: MetricRefreshLock, range: RidePerformanceRefreshRange) {
	const clickhouse = createLockedClickHouseExecutor(lock);
	const dates = listRidePerformanceOperationalDates(range.start_date, range.end_date);
	const stats: MetricRefreshStats = { result_rows_qty: 0, source_rows_qty: 0, source_watermark: null };

	await clickhouse.command(DROP_REFRESH_TABLE_QUERY);
	await clickhouse.command(CREATE_REFRESH_TABLE_QUERY);
	for (const operationalDate of dates) {
		const dateStats = await refreshDate(lock, {
			data_status: range.data_status,
			operational_date: operationalDate,
			source_cutoff: range.source_cutoff,
		});
		stats.result_rows_qty += dateStats.result_rows_qty;
		stats.source_rows_qty += dateStats.source_rows_qty;
		if (dateStats.source_watermark !== null) {
			stats.source_watermark = validateUnixTimestamp(Math.max(stats.source_watermark ?? 0, dateStats.source_watermark));
		}
	}
	return stats;
}

export async function refreshRidePerformanceRange(
	range: RidePerformanceRefreshRange,
	options: { wait_timeout_ms?: number } = {},
): Promise<RidePerformanceRefreshResult> {
	const result = await runMetricRefresh(
		{
			definition_version: RIDE_PERFORMANCE_DEFINITION_VERSION,
			get_tracking: () => ({
				range_end: range.end_date,
				range_start: range.start_date,
				refresh_type: range.refresh_type,
			}),
			lock_key: RIDE_PERFORMANCE_LOCK_KEY,
			lock_lost_message: 'Ride-performance refresh lock was lost.',
			metric_name: RIDE_PERFORMANCE_METRIC_NAME,
			...options,
		},
		lock => refreshRange(lock, range),
	);

	if (!result.acquired) {
		return {
			refreshed: false,
			refreshed_dates: [],
			result_rows_qty: 0,
			source_rows_qty: 0,
			source_watermark: null,
		};
	}
	return {
		refreshed: true,
		refreshed_dates: listRidePerformanceOperationalDates(range.start_date, range.end_date),
		...result.value,
	};
}

export function refreshCurrentRidePerformance() {
	return refreshRidePerformanceRange(buildCurrentRidePerformanceRefreshRange());
}

export function reconcileRecentRidePerformance() {
	return refreshRidePerformanceRange(buildRecentRidePerformanceRefreshRange());
}

export function backfillRidePerformance(startDate: OperationalDateInt, endDate: OperationalDateInt) {
	return refreshRidePerformanceRange(
		buildRidePerformanceBackfillRange(startDate, endDate),
		{ wait_timeout_ms: BACKFILL_LOCK_WAIT_MS },
	);
}

/* * */
