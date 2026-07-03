/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { SimplifiedVehicleEvent } from '@tmlmobilidade/types';

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
	const lastEvent = await simplifiedVehicleEventsNew.getLastEvent(vehicleId, agencyId);

	//
	// Send the last event for the vehicle back to the client
	reply.send({ data: lastEvent, error: null, statusCode: HTTP_STATUS.OK });
}
