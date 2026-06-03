/* * */

import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';

import { cpAuthClient } from './cp-auth.js';

/* * */

export async function fetchCpTripUpdates() {
	//
	// Get the API token

	const apiToken = await cpAuthClient.getToken();

	//
	// Fetch the CP Vehicle Events data from API and decode it.

	const response = await fetch(process.env.TRACKER_CP_API_URL, {
		headers: {
			'Authorization': `Bearer ${apiToken}`,
			'x-cp-connect-id': process.env.TRACKER_CP_API_KEY,
			'x-cp-connect-secret': process.env.TRACKER_CP_API_SECRET,
		},
	});

	const arrayBuffer = await response.arrayBuffer();

	console.log(arrayBuffer);
	console.log(response.status);
	const decodedMessage = await decodeGtfsRtFeed(arrayBuffer);

	const agentId = '[3]';
	return decodedMessage.entity?.map((entity) => {
		const tu = entity.trip_update;
		if (!tu) return tu;

		return {
			...tu,
			stop_time_update: tu.stop_time_update?.map(stu =>
				stu?.stop_id ? { ...stu, stop_id: `${agentId}${stu.stop_id}` } : stu,
			),
			trip: tu.trip?.trip_id
				? { ...tu.trip, trip_id: `${agentId}${tu.trip.trip_id}` }
				: tu.trip,
		};
	});
};
