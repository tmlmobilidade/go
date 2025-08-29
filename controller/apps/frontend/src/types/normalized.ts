/* * */

import { type Ride } from '@tmlmobilidade/types';

/* * */

const operationalStatusOptions = ['ended', 'missed', 'running', 'scheduled'] as const;
export const operationalStatusValues = [...operationalStatusOptions];

/* * */

const delayStatusOptions = ['delayed', 'early', 'ontime', 'none'] as const;
export const delayStatusValues = [...delayStatusOptions];

/* * */

const seenStatusOptions = ['gone', 'seen', 'unseen'] as const;
export const seenStatusValues = [...seenStatusOptions];

/* * */

export const gradeOptions = ['pass', 'fail', 'error', 'none'] as const;
export const gradeValues = [...gradeOptions];

/* * */

export interface RideNormalized extends Ride {
	delay_status: typeof delayStatusValues[number]
	delay_value_display: null | string
	operational_status: typeof operationalStatusValues[number]
	seen_status: typeof seenStatusValues[number]
	simple_three_vehicle_events_grade: typeof gradeValues[number]
	start_time_observed_display: null | string
	start_time_scheduled_display: string
}
