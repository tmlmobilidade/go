/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type UpdateVehicleDto, UpdateVehicleSchema, type Vehicle } from '@tmlmobilidade/go-types-operation';

/**
 * Updates a Vehicle in the database.
 * @param request The request object
 * @param reply The reply object
 */
export async function updateVehicleHandler(request: FastifyRequest<{ Body: UpdateVehicleDto, Params: { id: string } }>, reply: FastifyReply<Vehicle>) {
	//

	//
	// Validate the request body

	const validatedVehicle = UpdateVehicleSchema.safeParse({
		...request.body,
		updated_by: request.me._id,
	});

	if (!validatedVehicle.success) {
		return sendErrorApiResponse(reply, {
			error: validatedVehicle.error.message,
			status_code: '400',
		});
	}

	//
	// Update the vehicle in the database

	const updatedVehicle = await goDb.operation.vehicles.updateById(request.params.id, validatedVehicle.data);

	return sendSuccessApiResponse(reply, updatedVehicle);
}
