/* * */

import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

const BASE_URL = process.env.CRTM_AISA_API_URL;

async function fetcher(endpoint: string): Promise<Response> {
	if (!BASE_URL) {
		throw new Error('Missing CRTM_AISA_API_URL environment variable.');
	}

	const response = await fetch(`${BASE_URL}${endpoint}`);

	if (!response.ok) {
		throw new Error(`Request failed (${response.status}): ${response.statusText}`);
	}

	return response;
}

const endpoints = {
	schedule: '/GTFS-SC/gtfs_sc.zip',
	tripUpdates: '/GTFS-RT/actualizacionViaje',
	vehiclePositions: '/GTFS-RT/vehiculosPosicion',
};

export const CrtmAisaClient = Object.freeze({
	//

	/**
	 * Fetches GTFS-RT Vehicle Positions feed from the CRTM AISA API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Vehicle Positions feed message.
	 */
	vehiclePositions: async (): Promise<GtfsRtFeedMessage> => {
		const response = await fetcher(endpoints.vehiclePositions);
		const arrayBuffer = await response.arrayBuffer();
		return decodeGtfsRtFeed(arrayBuffer);
	},

	/**
	 * Fetches GTFS-RT Trip Updates feed from the CRTM AISA API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Trip Updates feed message.
	 */
	tripUpdates: async (): Promise<GtfsRtFeedMessage> => {
		const response = await fetcher(endpoints.tripUpdates);
		const arrayBuffer = await response.arrayBuffer();
		return decodeGtfsRtFeed(arrayBuffer);
	},

	/**
	 * Fetches GTFS-RT Schedule feed from the CRTM AISA API.
	 *
	 * @returns {Promise<Buffer>} A promise that resolves with the GTFS zip file as a Buffer.
	 */
	schedule: async (): Promise<Buffer> => {
		const response = await fetcher(endpoints.schedule);
		const arrayBuffer = await response.arrayBuffer();
		return Buffer.from(arrayBuffer);
	},
}) satisfies Record<keyof typeof endpoints, () => Promise<unknown>>;
