/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { AggregationPipeline } from '@tmlmobilidade/interfaces';
import { rides } from '@tmlmobilidade/interfaces';
import { ALLOW_ALL_FLAG, HttpStatus, Permissions } from '@tmlmobilidade/lib';
import { Permission, Ride, RidePermission } from '@tmlmobilidade/types';
import { Dates, getPermission } from '@tmlmobilidade/utils';

/* * */

export class RidesController {
	/**
	 * Gets a batch of Rides built with an aggregation pipeline.
	 */
	static async getBatch(request: FastifyRequest<{ Querystring: { lineId?: string, search?: string, stopId?: string } }>, reply: FastifyReply<Ride[]>) {
		//

		const pipeline: AggregationPipeline<Ride> = [];

		//
		// 1. Match rides between today's start and end date
		const startDate = Dates.now('Europe/Lisbon').minus({ minutes: 30 }).unix_timestamp;
		const todayEndDate = Dates.now('Europe/Lisbon').endOf('day').plus({ hours: 4 }).unix_timestamp;

		pipeline.push({ $match: { end_time_scheduled: { $gte: startDate, $lt: todayEndDate } } });

		//

		// 2. Filter rides by line ID & stop ID
		if (request.query.lineId) {
			pipeline.push({ $match: { line_id: Number(request.query.lineId) } });
		}

		//
		// 3. If search is provided, match rides by ID
		const search = request.query.search?.trim() ?? '';
		if (search) {
			const keywords = search.split(/\s+/).map(v => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
			const pattern = keywords.map(k => `(?=.*${k})`).join('') + '.*';
			pipeline.push({
				$match: { _id: { $options: 'i', $regex: pattern } },
			});
		}

		//
		// 4. Filter rides based on permissions for the current user
		const ridePermission: Permission<RidePermission> = getPermission(request.permissions, Permissions.rides.scope, Permissions.rides.actions.analysis_read);

		if (ridePermission?.resource) {
			// 4.1. Filter rides based on agency IDs
			if (ridePermission.resource.agency_ids && !ridePermission.resource.agency_ids.includes(ALLOW_ALL_FLAG)) {
				pipeline.push({ $match: { agency_id: { $in: ridePermission.resource.agency_ids } } });
			}
		}

		//
		// 5. Add a list of stop IDs to each ride based on the Shape Trip associated to the Ride
		pipeline.push(
			{ $lookup: { as: 'shape_details', foreignField: '_id', from: 'hashed_trips', localField: 'hashed_trip_id' } },
			{ $unwind: '$shape_details' },
			{ $addFields: { stop_ids: '$shape_details.path.stop_id' } },
			{ $project: { shape_details: 0 } },
			{ $sort: { start_time_scheduled: 1 } },
		);

		//
		// 6. Filter rides by stop ID
		if (request.query.stopId) {
			pipeline.push({ $match: { stop_ids: request.query.stopId } });
		}

		//
		// 7. Final pipeline stages
		pipeline.push({ $limit: 2000 }, { $sort: { start_time_scheduled: 1 } });

		//
		// 8. Fetch rides from the database
		const ridesBatch = await rides.aggregate(pipeline);

		//
		// Send the response
		reply.send({
			data: ridesBatch ?? [],
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}
}
