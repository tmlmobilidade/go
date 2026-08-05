/* * */

import { type OperationalDateInt, type UnixTimestamp } from '@tmlmobilidade/go-types-shared';

/* * */

export interface RidePerformanceSourceRow {
	agency_id: string
	expected_analysis_present: boolean | number
	expected_reason: null | string
	extension_scheduled: number | string
	one_apex_analysis_present: boolean | number
	one_apex_grade_status: null | string
	processing_status: string
	ride_id: string
	seen_first_at: null | number | string
	seen_last_at: null | number | string
	start_time_delta_minutes: null | number | string
	start_time_observed: null | number | string
	start_time_scheduled: number | string
	three_events_analysis_present: boolean | number
	three_events_grade_status: null | string
	updated_at: number | string
}

export interface RidePerformanceBucket {
	agency_id: string
	combined_executed_distance_m: number
	combined_execution_failure_rides_qty: number
	delay_5_to_10_minutes_rides_qty: number
	delay_10_to_20_minutes_rides_qty: number
	delay_eligible_rides_qty: number
	delay_more_than_20_minutes_rides_qty: number
	delayed_more_than_five_minutes_rides_qty: number
	interval_start: UnixTimestamp
	rides_without_execution_evidence_qty: number
	scheduled_distance_m: number
	scheduled_rides_total_qty: number
	scheduled_rides_until_cutoff_qty: number
	simple_one_apex_validation_distance_m: number
	simple_one_apex_validation_fail_rides_qty: number
	simple_three_vehicle_events_distance_m: number
	simple_three_vehicle_events_fail_rides_qty: number
	source_watermark: null | UnixTimestamp
	start_delay_minutes_sum: number
	start_delay_sample_qty: number
}

export interface RidePerformanceDay {
	buckets: RidePerformanceBucket[]
	current_cutoff: UnixTimestamp
	definition_version: 'ride-performance-direct-v1'
	generated_at: UnixTimestamp
	operational_date: OperationalDateInt
	operational_date_start: UnixTimestamp
	source_watermark: null | UnixTimestamp
}

export interface RidePerformanceQueryInput {
	current_cutoff: UnixTimestamp
	operational_date: OperationalDateInt
	operational_date_start: UnixTimestamp
}
