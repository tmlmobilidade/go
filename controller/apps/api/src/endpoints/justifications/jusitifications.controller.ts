/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { rideJustifications } from '@tmlmobilidade/interfaces';
import { HttpStatus } from '@tmlmobilidade/lib';
import { Comment, CommentTypeSchema, UpdateRideJustificationDto } from '@tmlmobilidade/types';
import { RideJustification } from '@tmlmobilidade/types';
import { Dates, generateRandomString } from '@tmlmobilidade/utils';

/* * */

export class JustificationsController {
	/**
	 * Changes the status of a justification by trip ID
	 */
	static async changeStatus(request: FastifyRequest<{ Body: { acceptance_status: UpdateRideJustificationDto['acceptance_status'] }, Params: { trip_id: string } }>, reply: FastifyReply<RideJustification>) {
		//
		const oldJustificationData = await rideJustifications.findByTripId(request.params.trip_id);

		const comment: Comment = {
			_id: generateRandomString(),
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			created_by: request.me._id,
			updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
			updated_by: request.me._id,
			/* * */
			curr_status: oldJustificationData.acceptance_status,
			prev_status: request.body.acceptance_status,
			type: CommentTypeSchema.Values.status_changed,
		};

		const updateResult = await rideJustifications.updateByTripId(request.params.trip_id, {
			acceptance_status: request.body.acceptance_status,
			comments: [...oldJustificationData.comments, comment],
		});

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	/**
	 * Adds a comment to a justification by trip ID
	 */
	static async comment(request: FastifyRequest<{ Body: Comment, Params: { trip_id: string } }>, reply: FastifyReply<RideJustification>) {
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

		const oldJustificationData = await rideJustifications.findByTripId(request.params.trip_id);
		const comment: Comment = {
			_id: generateRandomString(),
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			created_by: 'system',
			updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
			updated_by: 'system',
			/* * */
			message: request.body.pto_message,
			metadata: {
				pto_user_id: request.me._id,
			},
			type: 'system_info',
		};
		const updateResult = await rideJustifications.updateByTripId(request.params.trip_id, {
			comments: [...oldJustificationData.comments, comment],
			pto_message: request.body.pto_message,
		});

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
		const oldJustificationData = await rideJustifications.findByTripId(request.params.trip_id);

		if (oldJustificationData.is_locked === request.body.is_locked) {
			return reply.send({
				data: oldJustificationData,
				error: null,
				statusCode: HttpStatus.OK,
			});
		}

		const comment: Comment = {
			_id: generateRandomString(),
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			created_by: request.me._id,
			updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
			updated_by: request.me._id,
			/* * */
			curr_status: oldJustificationData.is_locked,
			prev_status: request.body.is_locked,
			type: CommentTypeSchema.Values.status_changed,
		};

		const updateResult = await rideJustifications.updateByTripId(request.params.trip_id, {
			comments: [...oldJustificationData.comments, comment],
			is_locked: request.body.is_locked,
		});

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}
}
