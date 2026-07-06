/* * */

import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

const BASE_URL = process.env.TCB_API_URL;

async function fetcher(endpoint: string): Promise<Response> {
	if (!BASE_URL) {
		throw new Error('Missing TCB_API_URL environment variable.');
	}

	const response = await fetch(`${BASE_URL}${endpoint}`);

	if (!response.ok) {
		throw new Error(`Request failed (${response.status}): ${response.statusText}`);
	}

	return response;
}

const endpoints = {
	vehiclePositions: '/gtfs-realtime',
};

export const TcbClient = Object.freeze({
	//

	/**
	 * Fetches GTFS-RT Vehicle Positions feed from the TCB API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Vehicle Positions feed message.
	 */
	vehiclePositions: async (): Promise<GtfsRtFeedMessage> => {
		const response = await fetcher(endpoints.vehiclePositions);
		const arrayBuffer = await response.arrayBuffer();
		return decodeGtfsRtFeed(arrayBuffer);
	},
}) satisfies Record<keyof typeof endpoints, () => Promise<unknown>>;
