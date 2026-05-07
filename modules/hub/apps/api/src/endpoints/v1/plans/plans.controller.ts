/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { getEmptyGtfsRtFeedMessage } from '@tmlmobilidade/gtfs-rt';
import { Logger } from '@tmlmobilidade/logger';
import { type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

export class PlansController {
	//

	/**
	 * Returns a GTFS feed with service alerts for Carris Metropolitana.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getApproved(request: FastifyRequest, reply: FastifyReply<GtfsRtFeedMessage>) {
		//

		//
		// Retrieve prepared GTFS-RT feed from cache

		const cachedFeedMessageString = await apiCache.get('alerts:all');

		if (!cachedFeedMessageString) {
			Logger.error('No GTFS-RT feed found in cache. Returning empty feed message.');
			return reply
				.code(404)
				.header('cache-control', 'public, max-age=20')
				.send(getEmptyGtfsRtFeedMessage());
		};

		return reply
			.code(200)
			.header('cache-control', 'public, max-age=20')
			.type('application/json')
			.send({
				data: {
					entity: JSON.parse(cachedFeedMessageString),
					header: {
						gtfs_realtime_version: '2.0',
						incrementality: 'FULL_DATASET',
						timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
					},
				},
				error: null,
				statusCode: HTTP_STATUS.OK,
			});

		// const allItemsData = JSON.parse(allItemsTxt);
		// const FeedMessage = gtfsRealtime.root.lookupType('transit_realtime.FeedMessage');
		// const message = FeedMessage.fromObject(allItemsData);
		// const buffer = FeedMessage.encode(message).finish();
		// return reply
		// 	.code(200)
		// 	.header('cache-control', 'public, max-age=20')
		// 	.type('application/octet-stream')
		// 	.send(buffer);
	}

	/**
	 * Returns a GTFS feed with service alerts for Carris Metropolitana.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async getGtfs(request: FastifyRequest, reply: FastifyReply<GtfsRtFeedMessage>) {
		//

		//
		// Retrieve prepared GTFS-RT feed from cache

		const cachedFeedMessageString = await apiCache.get('alerts:all');

		if (!cachedFeedMessageString) {
			Logger.error('No GTFS-RT feed found in cache. Returning empty feed message.');
			return reply
				.code(404)
				.header('cache-control', 'public, max-age=20')
				.send(getEmptyGtfsRtFeedMessage());
		};

		return reply
			.code(200)
			.header('cache-control', 'public, max-age=20')
			.type('application/json')
			.send({
				data: {
					entity: JSON.parse(cachedFeedMessageString),
					header: {
						gtfs_realtime_version: '2.0',
						incrementality: 'FULL_DATASET',
						timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
					},
				},
				error: null,
				statusCode: HTTP_STATUS.OK,
			});

		// const allItemsData = JSON.parse(allItemsTxt);
		// const FeedMessage = gtfsRealtime.root.lookupType('transit_realtime.FeedMessage');
		// const message = FeedMessage.fromObject(allItemsData);
		// const buffer = FeedMessage.encode(message).finish();
		// return reply
		// 	.code(200)
		// 	.header('cache-control', 'public, max-age=20')
		// 	.type('application/octet-stream')
		// 	.send(buffer);
	}

	//
}
