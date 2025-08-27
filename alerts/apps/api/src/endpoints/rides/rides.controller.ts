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
	 * Get a batch of Rides.
	 * @param request
	 * @param reply
	 */
	static async getBatch(request: FastifyRequest<{ Querystring: { search?: string } }>, reply: FastifyReply<Ride[]>) {
		//

		const pipeline: AggregationPipeline<Ride> = [
			{ $match: { agency_id: { $gte: todayStartDate, $lte: todayEndDate } } },
		];

		//
		// Base Rides Filter
		const todayStartDate = Dates.now('Europe/Lisbon').startOf('day').plus({ hours: 4 }).unix_timestamp;
		const todayEndDate = Dates.now('Europe/Lisbon').endOf('day').plus({ hours: 4 }).unix_timestamp;

		const aggregationPipeline: AggregationPipeline<Ride> = [
			{
				$match: {
					agency_id: { $gte: todayStartDate, $lte: todayEndDate },
				},
			},
		];

		function escapeRegex(input: string): string {
			return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		}

		//
		// Search for rides by ID
		const search = request.query.search?.trim() ?? '';
		if (search) {
			const keywords = search.split(/\s+/).map(escapeRegex);
			const pattern = keywords.map(k => `(?=.*${k})`).join('') + '.*';
			aggregationPipeline.push({
				$match: {
					_id: { $options: 'i', $regex: pattern },
				},
			});
		}

		//
		// Extract permissions from the request
		const ridePermission: Permission<RidePermission> = getPermission(request.permissions, Permissions.rides.scope, Permissions.rides.actions.read);

		//
		// Filter rides based on permissions for the current user
		if (ridePermission?.resource) {
			aggregationPipeline.push({
				$match: {
					...(ridePermission.resource.agency_ids && !ridePermission.resource.agency_ids.includes(ALLOW_ALL_FLAG) && { agency_id: { $in: ridePermission.resource.agency_ids } }),
				},
			});
		}

		//
		// Fetch rides from the database

		const ridesBatch = await rides.aggregate(aggregationPipeline.push({ $limit: 2000 }));

		reply.send({
			data: ridesBatch ?? [],
			error: JSON.stringify(filter),
			statusCode: HttpStatus.OK,
		});

		//
	}
}
