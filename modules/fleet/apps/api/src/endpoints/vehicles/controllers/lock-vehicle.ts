/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type Vehicle } from '@tmlmobilidade/types';

/**
 * Toggles the lock status of a vehicle by ID.
 * @param request Fastify request containing vehicle ID in params.
 * @param reply Fastify reply.
 */
export async function lockVehicle(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Vehicle>) {
	await goDb.operation.vehicles.toggleLockById(request.params.id);
	const foundVehicle = await goDb.operation.vehicles.findById(request.params.id);
	if (!foundVehicle) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
	reply.send({ data: foundVehicle, error: null, statusCode: HTTP_STATUS.OK });
}
