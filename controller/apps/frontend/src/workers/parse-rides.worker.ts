'use client';

/* * */

import { type RideNormalized } from '@/types/normalized';
import { getRideNormalized } from '@/utils/get-ride-normalized';

/* * */

export interface ParseRidesWorkerIncomingMessage {
	filters: {
		delay_status: string[]
		operational_status: string[]
		simple_three_vehicle_events: string[]
	}
	rides: Map<string, RideNormalized>
}

export interface ParseRidesWorkerOutgoingMessage {
	result: RideNormalized[]
}

/* * */

self.addEventListener('message', async (event: MessageEvent<ParseRidesWorkerIncomingMessage>) => {
	//

	//
	// Parse the rides data and apply filters

	const result: RideNormalized[] = Array
		.from(event.data.rides.values())
		.map(item => getRideNormalized(item))
		.filter(item => event.data.filters.operational_status.includes(item.operational_status))
		.filter(item => event.data.filters.delay_status.includes(item.delay_status))
		.filter(item => event.data.filters.simple_three_vehicle_events.includes(item.simple_three_vehicle_events_grade))
		.sort((a, b) => a.agency_id.localeCompare(b.agency_id))
		.sort((a, b) => a.start_time_scheduled - b.start_time_scheduled);

	//
	// Send the result back to the main thread

	self.postMessage({ result: result });

	//
});
