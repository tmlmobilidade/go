/* * */

import { type ClickHouseTableSchema } from '@tmlmobilidade/go-clients-clickhouse';
import { type MetricRefresh, type PassengerDemandByAgencyByMinute, type PassengerDemandByDimensionsBy5Minutes, type PassengerDemandByDimensionsByDay, type PassengerDemandRealtime, type RideServiceByRide } from '@tmlmobilidade/go-types-performance';

/* * */

export const metricRefreshTableSchema: ClickHouseTableSchema<MetricRefresh> = {
	completed_at: { type: 'Nullable(Int64)' },
	definition_version: { type: 'LowCardinality(String)' },
	error_message: { type: 'Nullable(String)' },
	metric_name: { type: 'LowCardinality(String)' },
	range_end: { type: 'UInt32' },
	range_start: { type: 'UInt32' },
	refresh_id: { type: 'UUID' },
	refresh_type: { type: `Enum8('incremental' = 1, 'reconciliation' = 2, 'backfill' = 3)` },
	result_rows_qty: { type: 'UInt64' },
	source_rows_qty: { type: 'UInt64' },
	source_watermark: { type: 'Nullable(Int64)' },
	started_at: { type: 'Int64' },
	status: { type: `Enum8('running' = 1, 'succeeded' = 2, 'failed' = 3)` },
	updated_at: { type: 'Int64' },
};

export const passengerDemandByAgencyByMinuteTableSchema: ClickHouseTableSchema<PassengerDemandByAgencyByMinute> = {
	accepted_validations_qty: { type: 'UInt64' },
	agency_id: { type: 'LowCardinality(String)' },
	calculated_at: { type: 'Int64' },
	definition_version: { type: 'LowCardinality(String)' },
	interval_start: { type: 'Int64' },
	operational_date: { type: 'UInt32' },
	source_watermark: { type: 'Nullable(Int64)' },
};

export const passengerDemandByDimensionsBy5MinutesTableSchema: ClickHouseTableSchema<PassengerDemandByDimensionsBy5Minutes> = {
	accepted_validations_qty: { type: 'UInt64' },
	agency_id: { type: 'LowCardinality(String)' },
	calculated_at: { type: 'Int64' },
	data_status: { type: `Enum8('provisional' = 1, 'reconciled' = 2)` },
	definition_version: { type: 'LowCardinality(String)' },
	interval_start: { type: 'Int64' },
	line_id: { type: 'LowCardinality(String)' },
	operational_date: { type: 'UInt32' },
	pattern_id: { type: 'LowCardinality(String)' },
	source_watermark: { type: 'Nullable(Int64)' },
	stop_id: { type: 'LowCardinality(String)' },
};

export const passengerDemandByDimensionsByDayTableSchema: ClickHouseTableSchema<PassengerDemandByDimensionsByDay> = {
	accepted_validations_qty: { type: 'UInt64' },
	agency_id: { type: 'LowCardinality(String)' },
	calculated_at: { type: 'Int64' },
	category: { type: 'LowCardinality(String)' },
	definition_version: { type: 'LowCardinality(String)' },
	line_id: { type: 'LowCardinality(String)' },
	operational_date: { type: 'UInt32' },
	pattern_id: { type: 'LowCardinality(String)' },
	product_id: { type: 'LowCardinality(String)' },
	source_watermark: { type: 'Nullable(Int64)' },
};

export const passengerDemandRealtimeTableSchema: ClickHouseTableSchema<PassengerDemandRealtime> = {
	agency_id: { type: 'LowCardinality(String)' },
	calculated_at: { type: 'Int64' },
	current_cutoff: { type: 'Int64' },
	current_operational_date: { type: 'UInt32' },
	definition_version: { type: 'LowCardinality(String)' },
	last_week_cutoff: { type: 'Int64' },
	last_week_operational_date: { type: 'UInt32' },
	passenger_validations_qty_last_week: { type: 'UInt64' },
	passenger_validations_qty_now: { type: 'UInt64' },
	source_watermark: { type: 'Nullable(Int64)' },
};

export const rideServiceByRideTableSchema: ClickHouseTableSchema<RideServiceByRide> = {
	advanced_rides_qty: { type: 'UInt8' },
	agency_id: { type: 'LowCardinality(String)' },
	calculated_at: { type: 'Int64' },
	combined_executed_distance_m: { type: 'UInt32' },
	combined_execution_failure_rides_qty: { type: 'UInt8' },
	data_status: { type: `Enum8('provisional' = 1, 'reconciled' = 2)` },
	definition_version: { type: 'LowCardinality(String)' },
	delay_10_to_20_minutes_rides_qty: { type: 'UInt8' },
	delay_5_to_10_minutes_rides_qty: { type: 'UInt8' },
	delay_eligible_rides_qty: { type: 'UInt8' },
	delay_more_than_20_minutes_rides_qty: { type: 'UInt8' },
	delayed_more_than_five_minutes_rides_qty: { type: 'UInt8' },
	expected_start_analysis_ready_qty: { type: 'UInt8' },
	interval_start: { type: 'Int64' },
	line_id: { type: 'LowCardinality(String)' },
	observed_start_rides_qty: { type: 'UInt8' },
	operational_date: { type: 'UInt32' },
	pattern_id: { type: 'LowCardinality(String)' },
	processing_complete_qty: { type: 'UInt8' },
	ride_id: { type: 'String' },
	rides_without_execution_evidence_qty: { type: 'UInt8' },
	scheduled_distance_m: { type: 'UInt32' },
	scheduled_rides_total_qty: { type: 'UInt8' },
	scheduled_rides_until_cutoff_qty: { type: 'UInt8' },
	simple_one_apex_validation_analysis_ready_qty: { type: 'UInt8' },
	simple_one_apex_validation_distance_m: { type: 'UInt32' },
	simple_one_apex_validation_fail_rides_qty: { type: 'UInt8' },
	simple_three_vehicle_events_analysis_ready_qty: { type: 'UInt8' },
	simple_three_vehicle_events_distance_m: { type: 'UInt32' },
	simple_three_vehicle_events_fail_rides_qty: { type: 'UInt8' },
	source_watermark: { type: 'Int64' },
	start_delay_minutes_sum: { type: 'Float64' },
	start_delay_sample_qty: { type: 'UInt8' },
};
