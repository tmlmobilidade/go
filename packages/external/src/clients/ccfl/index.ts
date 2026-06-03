/* * */

import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

const BASE_URL = process.env.CCFL_API_URL;
const fetcher = async (endpoint: string) => await fetch(`${BASE_URL}${endpoint}`);

const endpoints = {
	schedule: '/GTFS',
	vehiclePositions: '/GTFS/realtime/vehiclepositions',
};

export const CcflClient = Object.freeze({
	//

	/**
	 * Fetches GTFS-RT Vehicle Positions feed from the CCFL API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Vehicle Positions feed message.
	 */
	vehiclePositions: async (): Promise<GtfsRtFeedMessage> => {
		const response = await fetcher(endpoints.vehiclePositions);
		const arrayBuffer = await response.arrayBuffer();
		return decodeGtfsRtFeed(arrayBuffer);
	},

	/**
	 * Fetches GTFS-RT Schedule feed from the CCFL API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Schedule feed message.
	 */
	schedule: async (): Promise<Buffer> => {
		const response = await fetcher(endpoints.schedule);
		const arrayBuffer = await response.arrayBuffer();
		return Buffer.from(arrayBuffer);
	},
}) satisfies Record<keyof typeof endpoints, () => Promise<unknown>>;
