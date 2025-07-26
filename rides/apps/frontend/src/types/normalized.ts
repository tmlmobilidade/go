/* * */

import { type Ride, type RideAnalysis } from '@tmlmobilidade/types';

/* * */

export interface RideNormalized extends Ride {
	delay_status: 'delayed' | 'early' | 'ontime' | null
	operational_status: 'ended' | 'missed' | 'running' | 'scheduled'
	seen_status: 'gone' | 'seen' | 'unseen'
	simple_three_vehicle_events_grade: RideAnalysis['grade']
	start_time_observed_display: null | string
	start_time_scheduled_display: string
}
