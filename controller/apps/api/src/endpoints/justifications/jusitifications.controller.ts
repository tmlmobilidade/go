/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { rideAcceptances } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/lib';
import { CommentTypeSchema, FieldChangedComment, NoteComment, UpdateRideAcceptanceDto } from '@tmlmobilidade/types';
import { RideAcceptance } from '@tmlmobilidade/types';
import { Dates, generateRandomString } from '@tmlmobilidade/utils';

/* * */

export class JustificationsController {
	/**
	 * Changes the status of a justification by trip ID
	 */
	static async changeStatus(request: FastifyRequest<{ Body: { acceptance_status: UpdateRideAcceptanceDto['acceptance_status'] }, Params: { trip_id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//
		const oldJustificationData = await rideAcceptances.findByRideId(request.params.trip_id);

		const comment: FieldChangedComment<RideAcceptance, 'acceptance_status'> = {
			_id: generateRandomString(),
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			created_by: request.me._id,
			updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
			updated_by: request.me._id,
			/* * */
			curr_value: oldJustificationData.acceptance_status,
			field: 'acceptance_status',
			prev_value: request.body.acceptance_status,
			type: CommentTypeSchema.Values.field_changed,
		};

		const updateResult = await rideAcceptances.updateByRideId(request.params.trip_id, {
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
	static async comment(request: FastifyRequest<{ Body: NoteComment, Params: { trip_id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//

		const justificationData = await rideAcceptances.findByRideId(request.params.trip_id);

		if (!justificationData) {
			return reply.status(HttpStatus.NOT_FOUND).send({
				data: null,
				error: 'Justification not found.',
				statusCode: HttpStatus.NOT_FOUND,
			});
		}

		const updateResult = await rideAcceptances.updateByRideId(
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
	static async get(request: FastifyRequest<{ Params: { trip_id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//

		const justificationData = await rideAcceptances.findByRideId(request.params.trip_id);

		if (!justificationData) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Esta viagem não ainda não tem uma justificação.');
		}

		return reply.send({
			data: justificationData,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	/**
	 * Justifies a justification by trip ID
	 */
	static async justify(request: FastifyRequest<{ Body: { pto_message: string }, Params: { trip_id: string } }>, reply: FastifyReply<RideAcceptance>) {
		throw new HttpException(HttpStatus.NOT_IMPLEMENTED, 'Not implemented');
		// //

		// const oldJustificationData = await rideAcceptances.findByRideId(request.params.trip_id);
		// const comment: FieldChangedComment<RideAcceptance, 'pto_message'> = {
		// 	_id: generateRandomString(),
		// 	created_at: Dates.now('Europe/Lisbon').unix_timestamp,
		// 	created_by: 'system',
		// 	updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
		// 	updated_by: 'system',
		// 	/* * */
		// 	curr_value: request.body.pto_message,
		// 	field: 'pto_message',
		// 	prev_value: oldJustificationData.justification.pto_message,
		// 	type: CommentTypeSchema.Values.field_changed,
		// };
		// const updateResult = await rideAcceptances.updateByRideId(request.params.trip_id, {
		// 	comments: [...oldJustificationData.comments, comment],
		// });

		// return reply.send({
		// 	data: updateResult,
		// 	error: null,
		// 	statusCode: HttpStatus.OK,
		// });
	}

	/**
	 * Locks a justification by trip ID
	 */
	static async lock(request: FastifyRequest<{ Body: { is_locked: UpdateRideAcceptanceDto['is_locked'] }, Params: { trip_id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//
		const oldJustificationData = await rideAcceptances.findByRideId(request.params.trip_id);

		if (oldJustificationData.is_locked === request.body.is_locked) {
			return reply.send({
				data: oldJustificationData,
				error: null,
				statusCode: HttpStatus.OK,
			});
		}

		const comment: FieldChangedComment<RideAcceptance, 'is_locked'> = {
			_id: generateRandomString(),
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			created_by: request.me._id,
			updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
			updated_by: request.me._id,
			/* * */
			curr_value: oldJustificationData.is_locked,
			field: 'is_locked',
			prev_value: request.body.is_locked,
			type: CommentTypeSchema.Values.field_changed,
		};

		const updateResult = await rideAcceptances.updateByRideId(request.params.trip_id, {
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
