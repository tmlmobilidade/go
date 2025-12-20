/* * */

import { fetchLines } from '@/utils/lines.js';
import { parseServiceAlert } from '@/utils/service-alert-parser.js';
import { HttpStatus } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { alerts } from '@tmlmobilidade/interfaces';
import { type ServiceAlertResponse } from '@tmlmobilidade/types';

/* * */

export class GtfsController {
	//

	/**
	 * Returns a GTFS feed with service alerts for Carris and Metropolitana.
	 * @param request The request object.
	 * @param reply The reply object.
	 */
	static async carrisMetropolitana(request: FastifyRequest, reply: FastifyReply<ServiceAlertResponse>) {
		const findResult = await alerts.findMany({
			$and: [
				{
					$or: [
						{ publish_end_date: { $gte: Dates.now('Europe/Lisbon').unix_timestamp } },
						{ publish_end_date: null },
						{ publish_end_date: undefined },
						{ publish_end_date: { $exists: false } },
					],
					publish_start_date: { $lte: Dates.now('Europe/Lisbon').unix_timestamp },
					publish_status: 'PUBLISHED',
				},
			],
		}, { sort: { created_at: -1 } });

		const lines = await fetchLines();
		const serviceAlerts = await Promise.all(findResult.map(async alert => await parseServiceAlert(alert, lines)));

		reply.send({
			data: {
				entity: serviceAlerts,
				header: { gtfs_realtime_version: '2.0', incrementality: 'FULL_DATASET', timestamp: Dates.now('Europe/Lisbon').unix_timestamp },
			},
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	//
}
