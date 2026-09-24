/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateVehicleDto, CreateVehicleSchema, type Vehicle } from '@tmlmobilidade/go-types-operation';

/**
 * Creates a new Vehicle in the database.
 * @param request The request object containing the vehicle data in the body.
 * @param reply The reply object.
 */
export async function createVehicleHandler(request: FastifyRequest<{ Body: CreateVehicleDto }>, reply: FastifyReply<Vehicle>) {
	//

	//
	// Validate the request body

	const validatedVehicle = CreateVehicleSchema.safeParse({
		...request.body,
		created_by: request.me._id,
		updated_by: request.me._id,
	});

	if (!validatedVehicle.success) {
		return sendErrorApiResponse(reply, {
			error: validatedVehicle.error.message,
			status_code: '400',
		});
	}

	//
	// Create the vehicle in the database

	const insertResult = await goDb.operation.vehicles.insertOne(validatedVehicle.data);

	if (!insertResult) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to create vehicle',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, insertResult, { status_code: '201' });
}
