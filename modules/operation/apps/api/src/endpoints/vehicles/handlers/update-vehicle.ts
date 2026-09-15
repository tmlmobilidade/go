/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type UpdateVehicleDto, type Vehicle } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Updates an existing vehicle by ID
 * @param request Fastify request containing vehicle ID in params and update data in body
 * @param reply Fastify reply
 */
export async function updateVehicleHandler(request: FastifyRequest<{ Body: UpdateVehicleDto | UpdateVehicleDto[], Params: { id: string | string[] } }>, reply: FastifyReply<null | Vehicle>) {
	//

	//
	// Update multiple vehicles when a list of IDs is given

	if (Array.isArray(request.params.id)) {
		//

		//
		// Get the Vehicles from the database

		const vehicleData = await goDb.operation.vehicles.findMany({ _id: { $in: request.params.id } });

		if (!vehicleData) {
			return sendErrorApiResponse(reply, {
				error: 'Vehicles not found',
				status_code: '404',
			});
		}

		//
		// Check if the user has permission to update vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.update)) {
			return sendErrorApiResponse(reply, {
				error: 'You are not authorized to update vehicles',
				status_code: '403',
			});
		}

		//
		// Update the vehicles

		for (const vehicle of vehicleData) {
			await goDb.operation.vehicles.updateById(vehicle._id, vehicle);
		}

		return sendSuccessApiResponse(reply, null);
	}

	//
	// Get the Vehicle from the database

	const vehicleData = await goDb.operation.vehicles.findById(request.params.id);

	if (!vehicleData) {
		return sendErrorApiResponse(reply, {
			error: 'Vehicle not found',
			status_code: '404',
		});
	}

	//
	// Check if the user has permission to update vehicles

	if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.update)) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to update vehicles',
			status_code: '403',
		});
	}

	//
	// Update the vehicle

	const updatedVehicle = await goDb.operation.vehicles.updateById(vehicleData._id, vehicleData);

	return sendSuccessApiResponse(reply, updatedVehicle);
}
