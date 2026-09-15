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
	// Validate the request parameters

	const [agencyId, vehicleId] = request.params.id.split('-');

	if (!vehicleId || !agencyId) {
		return sendErrorApiResponse(reply, {
			error: 'Invalid vehicle ID',
			status_code: '400',
		});
	}

	//
	// Fetch the last event for the vehicle

	const query = `
			SELECT *
			WHERE vehicle_id = '${vehicleId}'
			AND agency_id = '${agencyId}'
			ORDER BY created_at DESC
			LIMIT 1
		`;

	const lastEvent = await labDb.operation.simplifiedVehicleEvents.queryFromString(query);

	if (!lastEvent || lastEvent.length === 0) {
		return sendErrorApiResponse(reply, {
			error: 'No last event found for vehicle',
			status_code: '404',
		});
	}

	//
	// Send the last event for the vehicle back to the client

	return sendSuccessApiResponse(reply, lastEvent[0]);
}
