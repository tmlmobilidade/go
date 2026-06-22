/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { vehicles } from '@tmlmobilidade/interfaces';
import { type CreateVehicleDto, PermissionCatalog, type Vehicle } from '@tmlmobilidade/types';

/**
 * Creates a new vehicle.
 * @param request Fastify request containing vehicle data
 * @param reply Fastify reply
 */
export async function createVehicle(request: FastifyRequest<{ Body: CreateVehicleDto | CreateVehicleDto[] }>, reply: FastifyReply<null | Vehicle>) {
	//

	//
	// Check if the user has permission to create vehicles

	if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.create)) {
		throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create vehicles');
	}

	//
	// Create the new vehicle

	if (Array.isArray(request.body)) {
		await vehicles.insertMany(request.body);
		reply.send({ data: null, error: null, statusCode: HTTP_STATUS.CREATED });
	} else {
		const newVehicle = await vehicles.insertOne(request.body);
		reply.send({ data: newVehicle, error: null, statusCode: HTTP_STATUS.CREATED });
	}
}
