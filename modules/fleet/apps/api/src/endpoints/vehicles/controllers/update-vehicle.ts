/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { vehicles } from '@tmlmobilidade/interfaces';
import { PermissionCatalog, type UpdateVehicleDto, type Vehicle } from '@tmlmobilidade/types';

/**
 * Updates an existing vehicle by ID
 * @param request Fastify request containing vehicle ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateVehicle(request: FastifyRequest<{ Body: UpdateVehicleDto | UpdateVehicleDto[], Params: { id: string | string[] } }>, reply: FastifyReply<null | Vehicle>) {
	//

	//
	// Get the Vehicle from the database
	const vehicleIds = Array.isArray(request.params.id) ? request.params.id : request.params.id.split(',').filter(Boolean);
	if (vehicleIds.length === 0) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid vehicle ID');

	if (vehicleIds.length > 1) {
		if (!Array.isArray(request.body)) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid request body');

		const vehicleData = await vehicles.findMany({ _id: { $in: vehicleIds } });
		if (vehicleData.length !== vehicleIds.length) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'One or more vehicles not found');
		}

		//
		// Check if the user has permission to update vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.update)) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update vehicles');
		}

		//
		// Update the vehicles

		for (const vehicle of vehicleData) {
			await vehicles.updateById(vehicle._id, vehicle);
		}

		//
		// Send the updated vehicles data as the response

		return reply.send({
			data: null,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	} else {
		const vehicleId = vehicleIds[0];
		const vehicleData = await vehicles.findById(vehicleId);

		if (!vehicleData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');

		if (Array.isArray(request.body)) throw new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid request body');

		//
		// Check if the user has permission to update vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.update)) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update vehicles');
		}

		//
		// Update the vehicle

		const updatedVehicle = await vehicles.updateById(vehicleData._id, vehicleData);

		//
		// Send the updated vehicle data as the response

		return reply.send({
			data: updatedVehicle,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	//
}
