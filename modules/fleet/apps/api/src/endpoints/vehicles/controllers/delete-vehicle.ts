/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { vehicles } from '@tmlmobilidade/interfaces';
import { PermissionCatalog } from '@tmlmobilidade/types';

/**
 * Deletes an vehicle by ID
 * @param request Fastify request containing vehicle ID in params
 * @param reply Fastify reply
 */
export async function deleteVehicle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
	const { id } = request.params;
	const vehicle = await vehicles.findById(id);

	if (!vehicle) {
		throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
	}

	//
	// Check if the user has permission to delete vehicles

	if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.delete)) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete vehicles');
	}

	//

	await vehicles.deleteById(id);

	reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
}
