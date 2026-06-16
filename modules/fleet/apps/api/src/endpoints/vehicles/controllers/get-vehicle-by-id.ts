/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { vehicles } from '@tmlmobilidade/interfaces';
import { type Vehicle } from '@tmlmobilidade/types';

/**
 * Retrieves a single vehicle by ID
 * @param request Fastify request containing vehicle ID in params
 * @param reply Fastify reply
 */
export async function getVehicleById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Vehicle>) {
	//

	//
	// Get the Vehicle from the database

	const vehicleData = await vehicles.findById(request.params.id);

	if (!vehicleData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
	//
	// Fetch the vehicle data

	return reply
		.header('Access-Control-Allow-Origin', '*')
		.send({
			data: vehicleData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

	//
}
