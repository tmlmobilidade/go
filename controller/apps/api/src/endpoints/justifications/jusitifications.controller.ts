/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { rideJustifications } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { RideJustificationComment, UpdateRideJustificationDto } from '@tmlmobilidade/types';
import { RideJustification } from '@tmlmobilidade/types';

/* * */

export class JustificationsController {
	/**
	 * Changes the status of a justification by trip ID
	 */
	static async changeStatus(request: FastifyRequest<{ Body: { acceptance_status: UpdateRideJustificationDto['acceptance_status'] }, Params: { trip_id: string } }>, reply: FastifyReply<RideJustification>) {
		//

		const updateResult = await rideJustifications.updateByTripId(request.params.trip_id, request.body);

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	/**
	 * Adds a comment to a justification by trip ID
	 */
	static async comment(request: FastifyRequest<{ Body: RideJustificationComment, Params: { trip_id: string } }>, reply: FastifyReply<RideJustification>) {
		//

		const justificationData = await rideJustifications.findByTripId(request.params.trip_id);

		if (!justificationData) {
			return reply.status(HttpStatus.NOT_FOUND).send({
				data: null,
				error: 'Justification not found.',
				statusCode: HttpStatus.NOT_FOUND,
			});
		}

		const updateResult = await rideJustifications.updateByTripId(
			request.params.trip_id,
			{ comments: [...justificationData.comments, request.body] },
		);

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	/**
	 * Gets a justification by trip ID
	 */
	static async get(request: FastifyRequest<{ Params: { trip_id: string } }>, reply: FastifyReply<RideJustification>) {
		//

		const justificationData = await rideJustifications.findByTripId(request.params.trip_id);

		return reply.send({
			data: justificationData,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	/**
	 * Justifies a justification by trip ID
	 */
	static async justify(request: FastifyRequest<{ Body: { pto_message: UpdateRideJustificationDto['pto_message'] }, Params: { trip_id: string } }>, reply: FastifyReply<RideJustification>) {
		//

		const updateResult = await rideJustifications.updateByTripId(request.params.trip_id, request.body);

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	/**
	 * Locks a justification by trip ID
	 */
	static async lock(request: FastifyRequest<{ Body: { is_locked: UpdateRideJustificationDto['is_locked'] }, Params: { trip_id: string } }>, reply: FastifyReply<RideJustification>) {
		//

		const updateResult = await rideJustifications.updateByTripId(request.params.trip_id, request.body);

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}
}
