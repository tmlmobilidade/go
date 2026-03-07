/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { Dates } from '@tmlmobilidade/dates';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { enrichUserRefs, rideAcceptances } from '@tmlmobilidade/interfaces';
import { type AlertCause, type NoteComment, type RideAcceptance, RideAcceptanceStatusSchema, type UpdateRideAcceptanceDto } from '@tmlmobilidade/types';

/* * */

export class RideAcceptanceController {
	/**
	 * Changes the status of a ride acceptance by trip ID
	 */
	static async changeStatus(request: FastifyRequest<{ Body: { acceptance_status: UpdateRideAcceptanceDto['acceptance_status'] }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//

		const updateResult = await rideAcceptances.updateByRideId(request.params.id, {
			acceptance_status: request.body.acceptance_status,
			updated_by: request.me._id,
		});

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	/**
	 * Adds a comment to a ride acceptance by trip ID
	 */
	static async comment(request: FastifyRequest<{ Body: NoteComment, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//

		const rideAcceptanceData = await rideAcceptances.findByRideId(request.params.id);

		if (!rideAcceptanceData) {
			return reply.status(HTTP_STATUS.NOT_FOUND).send({
				data: null,
				error: 'Ride acceptance not found.',
				statusCode: HTTP_STATUS.NOT_FOUND,
			});
		}

		const updateResult = await rideAcceptances.updateByRideId(
			request.params.id,
			{ comments: [...rideAcceptanceData.comments, { ...request.body, created_by: request.me._id, updated_by: request.me._id }], updated_by: request.me._id },
		);

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	/**
	 * Gets a ride acceptance by trip ID
	 */
	static async get(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//

		const rideAcceptanceData = await rideAcceptances.findByRideId(request.params.id);

		if (!rideAcceptanceData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Esta viagem não ainda não tem uma aprovação.');
		}

		return reply.send({
			data: await enrichUserRefs(rideAcceptanceData),
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	/**
	 * Justifies a ride acceptance by trip ID
	 */
	static async justify(request: FastifyRequest<{ Body: { justification_cause: AlertCause, manual_trip_id?: string, pto_message: string }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//

		const updateResult = await rideAcceptances.updateByRideId(request.params.id, {
			acceptance_status: RideAcceptanceStatusSchema.Values.under_review,
			justification: {
				created_at: Dates.now('utc').unix_timestamp,
				created_by: request.me._id,
				justification_cause: request.body.justification_cause,
				justification_source: 'MANUAL',
				manual_trip_id: request.body.manual_trip_id,
				pto_message: request.body.pto_message,
				updated_at: Dates.now('utc').unix_timestamp,
			},
			updated_by: request.me._id,
		});

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	/**
	 * Locks a justification by trip ID
	 */
	static async lock(request: FastifyRequest<{ Body: { is_locked: UpdateRideAcceptanceDto['is_locked'] }, Params: { id: string } }>, reply: FastifyReply<RideAcceptance>) {
		//
		const oldJustificationData = await rideAcceptances.findByRideId(request.params.id);

		if (oldJustificationData.is_locked === request.body.is_locked) {
			return reply.send({
				data: oldJustificationData,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		}

		const updateResult = await rideAcceptances.updateByRideId(request.params.id, { is_locked: request.body.is_locked, updated_by: request.me._id });

		return reply.send({
			data: updateResult,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}
}
