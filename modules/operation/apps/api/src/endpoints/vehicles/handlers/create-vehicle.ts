/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateVehicleDto, CreateVehicleSchema, type Vehicle } from '@tmlmobilidade/go-types-operation';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new vehicle.
 * @param request Fastify request containing vehicle data
 * @param reply Fastify reply
 */
export async function createVehicleHandler(request: FastifyRequest<{ Body: CreateVehicleDto | CreateVehicleDto[] }>, reply: FastifyReply<null | Vehicle>) {
	//

	//
	// Check if the user has permission to create vehicles

	if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.create)) {
		return sendErrorApiResponse(reply, {
			error: 'You are not authorized to create vehicles',
			status_code: '403',
		});
	}

	//
	// Validate the request body and create the new vehicle(s)

	if (Array.isArray(request.body)) {
		//

		const validatedVehicles = CreateVehicleSchema.array().safeParse(request.body);

		if (!validatedVehicles.success) {
			return sendErrorApiResponse(reply, {
				error: validatedVehicles.error.message,
				status_code: '400',
			});
		}

		await goDb.operation.vehicles.insertMany(validatedVehicles.data);

		return sendSuccessApiResponse(reply, null, { status_code: '201' });
	}

	const validatedVehicle = CreateVehicleSchema.safeParse(request.body);

	if (!validatedVehicle.success) {
		return sendErrorApiResponse(reply, {
			error: validatedVehicle.error.message,
			status_code: '400',
		});
	}

	const newVehicle = await goDb.operation.vehicles.insertOne(validatedVehicle.data);

	return sendSuccessApiResponse(reply, newVehicle, { status_code: '201' });
}
