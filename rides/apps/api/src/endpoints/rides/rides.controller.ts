/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { rides } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { type Ride } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export class RidesController {
	//

	/**
	 * Get a batch of Rides.
	 * @param request
	 * @param reply
	 */
	static async getBatch(request: FastifyRequest, reply: FastifyReply<Ride[]>) {
		try {
			//

			//
			// If no query parameters are provided, return a batch of rides from 1 hour ago until 1 hour later.

			const pastUnixTimestamp = Dates.now('Europe/Lisbon').minus({ hours: 1 }).unix_timestamp;
			const futureUnixTimestamp = Dates.now('Europe/Lisbon').plus({ hours: 1 }).unix_timestamp;

			//
			// Fetch rides from the database

			const ridesBatch = await rides.findMany(
				{ start_time_scheduled: { $gte: pastUnixTimestamp, $lte: futureUnixTimestamp } },
				{ sort: { start_time_scheduled: 1 } },
			);

			reply.send({
				data: ridesBatch,
				error: null,
				status: HttpStatus.OK,
			});
		}
		catch (error) {
			reply
				.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
				.send({
					data: null,
					error: error.message,
					status: HttpStatus.INTERNAL_SERVER_ERROR,
				});
			//
		}
	}

	/**
	 * Get a Ride by ID.
	 * @param request
	 * @param reply
	 * @returns
	 */
	// static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
	// 	try {
	// 		const { id } = request.params;

	// 		const ride = await rides.findById(id);

	// 		if (!ride) {
	// 			reply.status(HttpStatus.NOT_FOUND).send({ message: 'Ride not found' });
	// 			return;
	// 		}

	// 		reply.send(ride);
	// 	}
	// 	catch (error) {
	// 		reply
	// 			.status(error.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR)
	// 			.send(error);
	// 	}
	// }
}
