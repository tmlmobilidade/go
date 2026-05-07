/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { apiCache } from '@tmlmobilidade/databases';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { transformAlert } from '@tmlmobilidade/go-alerts-pckg-transform';
import { getEmptyGtfsRtFeedMessage } from '@tmlmobilidade/gtfs-rt';
import { alerts } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { GtfsRtFeedEntity, type GtfsRtFeedMessage } from '@tmlmobilidade/types';

/* * */

export class GtfsController {
	//

	/**
	 * Returns a GTFS feed with service alerts for Carris Metropolitana.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async carrisMetropolitana(request: FastifyRequest, reply: FastifyReply<GtfsRtFeedMessage>) {
		//

		//
		// Retrieve active alerts from the database

		const findResult = await alerts.findMany(
			{
				$and: [
					{
						$or: [
							{ publish_end_date: { $gte: Dates.now('Europe/Lisbon').unix_timestamp } },
							{ publish_end_date: null },
							{ publish_end_date: undefined },
							{ publish_end_date: { $exists: false } },
						],
						publish_start_date: { $lte: Dates.now('Europe/Lisbon').unix_timestamp },
						publish_status: 'published',
					},
				],
			},
			{
				sort: { created_at: -1 },
			},
		);

		Logger.info(`Retrieved ${findResult.length} active alerts from the database for Carris Metropolitana GTFS feed.`);

		//
		// Transform alerts into GTFS-RT feed entities

		const transformedItems = await Promise.all(findResult.map(transformAlert));

		const transformResult: GtfsRtFeedEntity[] = transformedItems.filter(Boolean);

		Logger.info(`Transformed ${transformResult.length} alerts into GTFS-RT feed entities for Carris Metropolitana GTFS feed.`);

		//
		// Send the GTFS-RT feed as the response

		reply.send({
			data: {
				entity: transformResult,
				header: {
					gtfs_realtime_version: '2.0',
					incrementality: 'FULL_DATASET',
					timestamp: Dates.now('Europe/Lisbon').unix_timestamp,
				},
			},
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	/**
	 * Returns a GTFS feed with service alerts for Carris Metropolitana.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async carrisMetropolitana2(request: FastifyRequest, reply: FastifyReply<GtfsRtFeedMessage>) {
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
				data: JSON.parse(cachedFeedMessageString),
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
