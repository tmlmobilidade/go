/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Deletes an vehicle by ID
 * @param request Fastify request containing vehicle ID in params
 * @param reply Fastify reply
 */
export async function deleteVehicleHandler(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	//

	//
	// Get the Vehicle from the database

	const vehicle = await goDb.operation.vehicles.findById(request.params.id);

	if (!vehicle) {
		return sendErrorApiResponse(reply, {
			error: 'Vehicle not found',
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to delete vehicles

	if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.delete)) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to delete vehicles',
			status_code: '403',
		});
	}

	//
	// Delete the vehicle

	await goDb.operation.vehicles.deleteById(request.params.id);

	return sendSuccessApiResponse(reply, undefined);
}
