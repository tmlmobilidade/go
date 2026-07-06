/* * */

import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

const BASE_URL = process.env.MOBI_API_URL;
const AUTH_TOKEN = Buffer.from(`${process.env.MOBI_API_USERNAME}:${process.env.MOBI_API_PASSWORD}`).toString('base64');

async function mobiFetch(endpoint: string): Promise<Response> {
	if (!BASE_URL) {
		throw new Error('Missing MOBI_API_URL environment variable.');
	}

	const response = await fetch(`${BASE_URL}${endpoint}`, { headers: { Authorization: `Basic ${AUTH_TOKEN}` } });

	if (!response.ok) {
		throw new Error(`Request failed (${response.status}): ${response.statusText}`);
	}

	return response;
}

const endpoints = {
	tripUpdates: '/gtfs-rt/tripUpdates',
	vehiclePositions: '/gtfs-rt/vehiclePositions',
};

export const MobiClient = Object.freeze({
	//

	/**
	 * Fetches GTFS-RT Trip Updates feed from the Mobi API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Trip Updates feed message.
	 */
	tripUpdates: async (): Promise<GtfsRtFeedMessage> => {
		const response = await mobiFetch(endpoints.tripUpdates);
		const arrayBuffer = await response.arrayBuffer();
		return decodeGtfsRtFeed(arrayBuffer);
	},

	/**
	 * Fetches GTFS-RT Vehicle Positions feed from the Mobi API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Vehicle Positions feed message.
	 */
	vehiclePositions: async (): Promise<GtfsRtFeedMessage> => {
		const response = await mobiFetch(endpoints.vehiclePositions);
		const arrayBuffer = await response.arrayBuffer();
		return decodeGtfsRtFeed(arrayBuffer);
	},
}) satisfies Record<keyof typeof endpoints, () => Promise<unknown>>;
