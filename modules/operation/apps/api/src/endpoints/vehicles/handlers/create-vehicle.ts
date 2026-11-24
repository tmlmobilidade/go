/* * */

import { type FastifyReply, type FastifyRequest, sendErrorApiResponse, sendSuccessApiResponse } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateVehicleDto, CreateVehicleSchema, type Vehicle } from '@tmlmobilidade/go-types-operation';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/**
 * Creates or replaces one or more Vehicles in the database.
 * @param request The request object containing a vehicle or an array of vehicles in the body.
 * @param reply The reply object.
 */
export async function createVehicleHandler(request: FastifyRequest<{ Body: CreateVehicleDto | CreateVehicleDto[] }>, reply: FastifyReply<Vehicle | Vehicle[]>) {
	//

	//
	// Validate the request body

	const vehicles = Array.isArray(request.body) ? request.body : [request.body];

	const validatedVehicles = CreateVehicleSchema.array().min(1).safeParse(vehicles.map(vehicle => ({
		...vehicle,
		created_by: request.me._id,
		updated_by: request.me._id,
	})));

	if (!validatedVehicles.success) {
		return sendErrorApiResponse(reply, {
			error: validatedVehicles.error,
			status_code: '400',
		});
	}

	//
	// Create or replace the vehicles with their supplied _ids

	const nowMs = Dates.now('utc').unix_milliseconds;

	const vehicleData: Vehicle[] = validatedVehicles.data.map(vehicle => ({
		...vehicle,
		created_at: nowMs,
		updated_at: nowMs,
	}));

	const upsertResult = await goDb.operation.vehicles.upsertManyUnsafe(vehicleData);

	if (!upsertResult.isOk()) {
		return sendErrorApiResponse(reply, {
			error: 'Failed to save vehicles',
			status_code: '500',
		});
	}

	return sendSuccessApiResponse(reply, Array.isArray(request.body) ? vehicleData : vehicleData[0], { status_code: '201' });
}
