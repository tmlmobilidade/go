/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/**
 * Retrieves the last event for a given vehicle.
 * @param request Fastify request containing vehicle ID in params
 * @param reply Fastify reply
 */
export async function getLastVehicleEventHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<SimplifiedVehicleEvent>) {
	//

	//
	// Parse the composite vehicle ID

	const [agencyId, vehicleId] = request.params.id.split('-');

	if (!vehicleId || !agencyId) {
		return sendErrorApiResponse(reply, {
			error: 'Invalid vehicle ID',
			status_code: '400',
		});
	}

	//
	// Fetch the last event for the vehicle

	const lastEvent = await labDb.operation.simplifiedVehicleEvents.queryFromString(
		`
			SELECT *
			WHERE vehicle_id = $1
			AND agency_id = $2
			ORDER BY created_at DESC
			LIMIT 1
		`,
		{ 1: vehicleId, 2: agencyId },
	);

	if (!lastEvent?.length) {
		return sendErrorApiResponse(reply, {
			error: 'No last event found for vehicle',
			status_code: '404',
		});
	}

	return sendSuccessApiResponse(reply, lastEvent[0]);
}
