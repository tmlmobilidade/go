/* * */

import { OperationalDateIntSchema, UnixTimestampSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const RidePerformanceDataStatusSchema = z.enum(['provisional', 'reconciled']);

/**
 * Canonical ride-performance fact. Every quantity is additive so percentages
 * can be derived safely at any supported dimensional grain.
 */
export const RideServiceByRideSchema = z.object({
	advanced_rides_qty: z.number().int().nonnegative(),
	agency_id: z.string(),
	calculated_at: UnixTimestampSchema,
	combined_executed_distance_m: z.number().nonnegative(),
	combined_execution_failure_rides_qty: z.number().int().nonnegative(),
	data_status: RidePerformanceDataStatusSchema,
	definition_version: z.literal('ride-performance-v1'),
	delay_10_to_20_minutes_rides_qty: z.number().int().nonnegative(),
	delay_5_to_10_minutes_rides_qty: z.number().int().nonnegative(),
	delay_eligible_rides_qty: z.number().int().nonnegative(),
	delay_more_than_20_minutes_rides_qty: z.number().int().nonnegative(),
	delayed_more_than_five_minutes_rides_qty: z.number().int().nonnegative(),
	expected_start_analysis_ready_qty: z.number().int().nonnegative(),
	interval_start: UnixTimestampSchema,
	line_id: z.string(),
	observed_start_rides_qty: z.number().int().nonnegative(),
	operational_date: OperationalDateIntSchema,
	pattern_id: z.string(),
	processing_complete_qty: z.number().int().nonnegative(),
	ride_id: z.string(),
	rides_without_execution_evidence_qty: z.number().int().nonnegative(),
	scheduled_distance_m: z.number().nonnegative(),
	scheduled_rides_total_qty: z.number().int().nonnegative(),
	scheduled_rides_until_cutoff_qty: z.number().int().nonnegative(),
	simple_one_apex_validation_analysis_ready_qty: z.number().int().nonnegative(),
	simple_one_apex_validation_distance_m: z.number().nonnegative(),
	simple_one_apex_validation_fail_rides_qty: z.number().int().nonnegative(),
	simple_three_vehicle_events_analysis_ready_qty: z.number().int().nonnegative(),
	simple_three_vehicle_events_distance_m: z.number().nonnegative(),
	simple_three_vehicle_events_fail_rides_qty: z.number().int().nonnegative(),
	source_watermark: UnixTimestampSchema,
	start_delay_minutes_sum: z.number().nonnegative(),
	start_delay_sample_qty: z.number().int().nonnegative(),
});

export type RidePerformanceDataStatus = z.infer<typeof RidePerformanceDataStatusSchema>;
export type RideServiceByRide = z.infer<typeof RideServiceByRideSchema>;

/* * */
