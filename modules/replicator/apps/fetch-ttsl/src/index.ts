/* * */

import { processTtslVehicleEvent } from '@/process-ttsl-vehicle-event.js';
import { Dates } from '@tmlmobilidade/dates';
import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { SimplifiedVehicleEvent } from '@tmlmobilidade/types';
import crypto from 'node:crypto';

/* * */

(async function init() {
	//

	async function fetchTTSLData() {
		//

		const response = await fetch('https://api.ttsl.pt/files/gtfs_rt_vehicles.pb');
		const arrayBuffer = await response.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const decodedMessage = await decodeGtfsRtFeed(buffer);

		//
		// Transform the decoded message into a SimplifiedVehicleEvent

		for (const entity of decodedMessage.entity) {
			const simplifiedEvent: Omit<SimplifiedVehicleEvent, '_id' | 'received_at' | 'updated_at'> = {
				agency_id: '4',
				created_at: Dates.fromSeconds(entity.vehicle.timestamp.low).unix_timestamp,
				current_status: entity.vehicle.current_status,
				driver_id: null,
				event_id: null,
				extra_trip_id: null,
				latitude: entity.vehicle.position.latitude,
				longitude: entity.vehicle.position.longitude,
				odometer: null,
				pattern_id: null,
				position: {
					geohash: null,
					h3: null,
					latitude: entity.vehicle.position.latitude,
					longitude: entity.vehicle.position.longitude,
				},
				stop_id: entity.vehicle.stop_id,
				trigger_activity: null,
				trigger_door: null,
				trip_id: entity.vehicle.trip.trip_id,
				vehicle_id: entity.vehicle.vehicle.id,
			};
			// Hash the contents of the simplified event to create a unique event ID
			const hashableSimplifiedEvent = JSON.stringify(simplifiedEvent);
			const uniqueIdValueForSimplifiedEvent = crypto
				.createHash('sha256')
				.update(hashableSimplifiedEvent)
				.digest('hex');
			await processTtslVehicleEvent({
				_id: uniqueIdValueForSimplifiedEvent,
				...simplifiedEvent,
				received_at: Dates.now('Europe/Lisbon').unix_timestamp,
				updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
			});
		}

		console.log(Date.now(), 'Fetched TTSL data:');
		// console.log(JSON.stringify(decodedMessage['entity'], null, 2));
	}

	await fetchTTSLData();

	setInterval(fetchTTSLData, 1_000); // Fetch data every 10 seconds

	//
})();
