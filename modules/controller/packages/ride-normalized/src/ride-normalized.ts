/* * */

import { type Ride, RideAcceptanceStatusSchema, type RideAnalysis } from '@tmlmobilidade/go-types';

/* * */

export const operationalStatusOptions = ['ended', 'missed', 'running', 'scheduled'] as const;
export const operationalStatusValues = [...operationalStatusOptions];

/* * */

export const delayStatusOptions = ['delayed', 'early', 'ontime', 'none'] as const;
export const delayStatusValues = [...delayStatusOptions];

/* * */

export const seenStatusOptions = ['gone', 'seen', 'unseen'] as const;
export const seenStatusValues = [...seenStatusOptions];

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
	delay_status: typeof delayStatusValues[number]

	/**
	 * @deprecated use `start_time_observed_display` instead
	 */
	delay_value_display: null | string

	end_delay_status: typeof delayStatusValues[number]
	end_delay_value_display: null | string
	end_time_observed_display: null | string
	end_time_scheduled_display: string
	operational_status: typeof operationalStatusValues[number]
	seen_status: typeof seenStatusValues[number]
	start_delay_status: typeof delayStatusValues[number]
	start_delay_value_display: null | string
	start_time_observed_display: null | string
	start_time_scheduled_display: string
}
