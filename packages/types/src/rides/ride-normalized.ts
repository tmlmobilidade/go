/* * */

import { DelayStatusSchema, OperationalStatusSchema, SeenStatusSchema } from '@/_common/status.js';

import { RideAcceptanceStatusSchema } from './ride-acceptance.js';
import { RideAnalysis } from './ride-analysis.js';
import { Ride } from './ride.js';

/* * */

export interface RideNormalized extends Ride {
	acceptance_status: typeof RideAcceptanceStatusSchema.options[number]
	analysis_ended_at_last_stop_grade: 'none' | RideAnalysis['grade']
	analysis_expected_apex_validation_interval: 'none' | RideAnalysis['grade']
	analysis_simple_three_vehicle_events_grade: 'none' | RideAnalysis['grade']
	analysis_transaction_sequentiality: 'none' | RideAnalysis['grade']

	/**
	 * @deprecated use `start_time_observed_display` instead
	 */
	delay_status: typeof DelayStatusSchema.options[number]

	/**
	 * @deprecated use `start_time_observed_display` instead
	 */
	delay_value_display: null | string

	end_delay_status: typeof DelayStatusSchema.options[number]
	end_delay_value_display: null | string
	end_time_observed_display: null | string
	end_time_scheduled_display: string
	operational_status: typeof OperationalStatusSchema.options[number]
	seen_status: typeof SeenStatusSchema.options[number]
	start_delay_status: typeof DelayStatusSchema.options[number]
	start_delay_value_display: null | string
	start_time_observed_display: null | string
	start_time_scheduled_display: string
}
