/* * */

import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

const BASE_URL = process.env.CRTM_LAVELOZ_API_URL;

async function fetcher(endpoint: string): Promise<Response> {
	if (!BASE_URL) {
		throw new Error('Missing CRTM_LAVELOZ_API_URL environment variable.');
	}

	const response = await fetch(
		`${BASE_URL}${endpoint}`,
		{
			headers: {
				Accept: 'application/json, text/plain',
				Authorization: process.env.CRTM_LAVELOZ_API_KEY,
			},
		},
	);

	if (!response.ok) {
		throw new Error(`Request failed (${response.status}): ${response.statusText}`);
	}

	return response;
}

const endpoints = {
	serviceAlerts: '/gtfs-rt-alerts/v2',
	tripUpdates: '/gtfs-rt-trip-updates',
	vehiclePositions: '/gtfs-rt-vehicle-positions',
};

export const CrtmLaVelozClient = Object.freeze({
	//

	/**
	 * Fetches GTFS-RT Vehicle Positions feed from the CRTM La Veloz API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Vehicle Positions feed message.
	 */
	vehiclePositions: async (): Promise<GtfsRtFeedMessage> => {
		const response = await fetcher(endpoints.vehiclePositions);
		const arrayBuffer = await response.arrayBuffer();
		return decodeGtfsRtFeed(arrayBuffer);
	},

	/**
	 * Fetches GTFS-RT Trip Updates feed from the CRTM La Veloz API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Trip Updates feed message.
	 */
	tripUpdates: async (): Promise<GtfsRtFeedMessage> => {
		const response = await fetcher(endpoints.tripUpdates);
		const arrayBuffer = await response.arrayBuffer();
		return decodeGtfsRtFeed(arrayBuffer);
	},

	/**
	 * Fetches GTFS-RT Service Alerts feed from the CRTM La Veloz API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Service Alerts feed message.
	 */
	serviceAlerts: async (): Promise<GtfsRtFeedMessage> => {
		const response = await fetcher(endpoints.serviceAlerts);
		const arrayBuffer = await response.arrayBuffer();
		return decodeGtfsRtFeed(arrayBuffer);
	},
}) satisfies Record<keyof typeof endpoints, () => Promise<unknown>>;
