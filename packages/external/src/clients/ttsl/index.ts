/* * */

import { decodeGtfsRtFeed } from '@tmlmobilidade/gtfs-rt';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

const BASE_URL = process.env.TTSL_API_URL;
const fetcher = async (endpoint: string) => await fetch(`${BASE_URL}${endpoint}`);

const endpoints = {
	vehiclePositions: '/files/gtfs_rt_vehicles.pb',
};

export const TtslClient = Object.freeze({
	//

	/**
	 * Fetches GTFS-RT Vehicle Positions feed from the TTSL API.
	 *
	 * @returns {Promise<GtfsRtFeedMessage>} A promise that resolves with the decoded GTFS-RT Vehicle Positions feed message.
	 */
	vehiclePositions: async (): Promise<GtfsRtFeedMessage> => {
		const response = await fetcher(endpoints.vehiclePositions);
		const arrayBuffer = await response.arrayBuffer();
		return decodeGtfsRtFeed(arrayBuffer);
	},
}) satisfies Record<keyof typeof endpoints, () => Promise<unknown>>;
