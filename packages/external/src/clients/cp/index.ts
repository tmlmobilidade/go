/* * */

import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

import { cpAuthClient } from './auth.js';

/* * */

const BASE_URL = process.env.CP_API_URL;

async function fetcher(endpoint: string): Promise<Response> {
	if (!BASE_URL) {
		throw new Error('Missing CP_API_URL environment variable.');
	}

	//
	// Get the API token

	const apiToken = await cpAuthClient.getToken();

	//
	// Fetch the CP Trip Updates data from API and decode it.

	const response = await fetch(`${BASE_URL}${endpoint}`, {
		headers: {
			'Authorization': `Bearer ${apiToken}`,
			'x-cp-connect-id': process.env.CP_API_KEY,
			'x-cp-connect-secret': process.env.CP_API_SECRET,
		},
	});

	if (!response.ok) {
		throw new Error(`Request failed (${response.status}): ${response.statusText}`);
	}

	return response;
}

const endpoints = {
	schedule: '/schedule/gtfs.zip',
	tripUpdates: '/realtime/TripUpdates.pb',
	vehiclePositions: '/realtime/VehiclePositions.pb',
};

export const CpClient = Object.freeze({
	//

	/**
	 * Fetches the latest GTFS static schedule feed (gtfs.zip) from the CP Partner API.
	 *
	 * @returns {Promise<Buffer>} A promise that resolves with the GTFS zip file as a Buffer.
	 */
	schedule: async (): Promise<Buffer> => {
		const response = await fetcher(endpoints.schedule);
		const arrayBuffer = await response.arrayBuffer();
		return Buffer.from(arrayBuffer);
	},

	/**
	 * Fetches the GTFS-RT Trip Updates feed from the CP Partner API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Trip Updates feed message.
	 */
	tripUpdates: async (): Promise<GtfsRtFeedMessage> => {
		const response = await fetcher(endpoints.tripUpdates);
		const arrayBuffer = await response.arrayBuffer();
		const decodedMessage = await decodeGtfsRtFeed(arrayBuffer);

		return decodedMessage;
	},

	/**
	 * Fetches the GTFS-RT Vehicle Positions feed from the CP Partner API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Vehicle Positions feed message.
	 */
	vehiclePositions: async (): Promise<GtfsRtFeedMessage> => {
		const response = await fetcher(endpoints.vehiclePositions);
		const arrayBuffer = await response.arrayBuffer();
		return decodeGtfsRtFeed(arrayBuffer);
	},
}) satisfies Record<keyof typeof endpoints, () => Promise<unknown>>;
