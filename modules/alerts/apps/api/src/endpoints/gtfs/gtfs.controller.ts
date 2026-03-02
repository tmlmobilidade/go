/* * */

import { HTTP_STATUS } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { transformAlert } from '@tmlmobilidade/go-alerts-pckg-transform';
import { alerts } from '@tmlmobilidade/interfaces';
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

		//
		// Transfor alerts into GTFS-RT feed entities

		const transformResult: GtfsRtFeedEntity[] = [];

		for (const item of findResult) {
			const transformedItem = await transformAlert(item);
			if (transformedItem) transformResult.push(transformedItem);
		}

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

	//
}
