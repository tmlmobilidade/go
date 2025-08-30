'use client';

/* * */

import { type RideNormalized } from '@/types/normalized';
import { getRideNormalized } from '@/utils/get-ride-normalized';
import { type Ride } from '@tmlmobilidade/types';

/* * */

export interface ParseRidesWorkerRequestMessage {
	filters: {
		analysis_ended_at_last_stop: string[]
		analysis_expected_apex_validation_interval: string[]
		analysis_simple_three_vehicle_events: string[]
		delay_status: string[]
		operational_status: string[]
	}
	rides: Map<string, Ride>
}

export interface ParseRidesWorkerResponseMessage {
	result: RideNormalized[]
}

/* * */

self.addEventListener('message', async (event: MessageEvent<ParseRidesWorkerRequestMessage>) => {
	//

	//
	// Parse the rides data and apply filters

	const result: RideNormalized[] = Array
		.from(event.data.rides.values())
		.map(item => getRideNormalized(item))
		.filter(item => event.data.filters.operational_status.includes(item.operational_status))
		.filter(item => event.data.filters.delay_status.includes(item.delay_status))
		.filter(item => event.data.filters.analysis_expected_apex_validation_interval.includes(item.analysis_expected_apex_validation_interval))
		.filter(item => event.data.filters.analysis_simple_three_vehicle_events.includes(item.analysis_simple_three_vehicle_events_grade))
		.filter(item => event.data.filters.analysis_ended_at_last_stop.includes(item.analysis_ended_at_last_stop_grade))
		.sort((a, b) => a.agency_id.localeCompare(b.agency_id))
		.sort((a, b) => a.start_time_scheduled - b.start_time_scheduled);

	//
	// Send the result back to the main thread

	self.postMessage({ result: result });

	//
});
