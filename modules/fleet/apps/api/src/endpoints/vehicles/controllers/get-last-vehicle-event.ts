/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type SimplifiedVehicleEvent } from '@tmlmobilidade/go-types-vehicle-events';

/**
 * Retrieves the last event for a given vehicle.
 * @param request Fastify request containing vehicle ID in params
 * @param reply Fastify reply
 */
export async function getLastVehicleEvent(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<SimplifiedVehicleEvent>) {
	//

	const [agencyId, vehicleId] = request.params.id.split('-');
	if (!vehicleId || !agencyId) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid vehicle ID');

	//
	// Fetch the last event for the vehicle

	const query = `
			SELECT *
			WHERE vehicle_id = '${vehicleId}'
			AND agency_id = '${agencyId}'
			ORDER BY created_at DESC
			LIMIT 1
		`;

	const lastEvent = await labDb.operation.vehicleEvents.queryFromString<SimplifiedVehicleEvent>(query);
	if (!lastEvent || lastEvent.length === 0) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'No last event found for vehicle');

	//
	// Send the last event for the vehicle back to the client
	reply.send({ data: lastEvent[0], error: null, statusCode: HTTP_STATUS.OK });
}
