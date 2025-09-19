/* * */

import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/connectors';
import { rideAcceptances } from '@tmlmobilidade/interfaces';
import { HttpException, HttpStatus } from '@tmlmobilidade/lib';
import { CommentTypeSchema, FieldChangedComment, NoteComment, RideJustificationCause, UpdateRideAcceptanceDto } from '@tmlmobilidade/types';
import { RideAcceptance } from '@tmlmobilidade/types';
import { Dates, generateRandomString } from '@tmlmobilidade/utils';

/* * */

export class RideAcceptanceController {
	/**
	 * Changes the status of a ride acceptance by trip ID
	 */
	static async changeStatus(request: FastifyRequest<{ Body: { acceptance_status: UpdateRideAcceptanceDto['acceptance_status'] }, Params: { trip_id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//
		const oldRideAcceptanceData = await rideAcceptances.findByRideId(request.params.trip_id);

		const comment: FieldChangedComment<RideAcceptance, 'acceptance_status'> = {
			_id: generateRandomString(),
			created_at: Dates.now('Europe/Lisbon').unix_timestamp,
			created_by: request.me._id,
			updated_at: Dates.now('Europe/Lisbon').unix_timestamp,
			updated_by: request.me._id,
			/* * */
			curr_value: oldRideAcceptanceData.acceptance_status,
			field: 'acceptance_status',
			prev_value: request.body.acceptance_status,
			type: CommentTypeSchema.Values.field_changed,
		};

		const updateResult = await rideAcceptances.updateByRideId(request.params.trip_id, {
			acceptance_status: request.body.acceptance_status,
			comments: [...oldRideAcceptanceData.comments, comment],
		});

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	/**
	 * Adds a comment to a ride acceptance by trip ID
	 */
	static async comment(request: FastifyRequest<{ Body: NoteComment, Params: { trip_id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//

		const rideAcceptanceData = await rideAcceptances.findByRideId(request.params.trip_id);

		if (!rideAcceptanceData) {
			return reply.status(HttpStatus.NOT_FOUND).send({
				data: null,
				error: 'Ride acceptance not found.',
				statusCode: HttpStatus.NOT_FOUND,
			});
		}

		const updateResult = await rideAcceptances.updateByRideId(
			request.params.trip_id,
			{ comments: [...rideAcceptanceData.comments, request.body], updated_by: request.me._id },
		);

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	/**
	 * Gets a ride acceptance by trip ID
	 */
	static async get(request: FastifyRequest<{ Params: { trip_id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//

		const rideAcceptanceData = await rideAcceptances.findByRideId(request.params.trip_id);

		if (!rideAcceptanceData) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Esta viagem não ainda não tem uma aprovação.');
		}

		return reply.send({
			data: rideAcceptanceData,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}

	/**
	 * Justifies a ride acceptance by trip ID
	 */
	static async justify(request: FastifyRequest<{ Body: { justification_cause: RideJustificationCause, pto_message: string }, Params: { trip_id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//

		const updateResult = await rideAcceptances.updateByRideId(request.params.trip_id, {
			justification: {
				created_at: Dates.now('utc').unix_timestamp,
				created_by: request.me._id,
				justification_cause: request.body.justification_cause,
				justification_source: 'MANUAL',
				pto_message: request.body.pto_message,
				updated_at: Dates.now('utc').unix_timestamp,
			},
		});

		reply.send({
			data: updateResult,
			error: null,
			statusCode: HttpStatus.OK,
		});

		process.exit(0);
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

		const updateResult = await rideAcceptances.updateByRideId(request.params.trip_id, { is_locked: request.body.is_locked, updated_by: request.me._id });

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HttpStatus.OK,
		});
	}
}
