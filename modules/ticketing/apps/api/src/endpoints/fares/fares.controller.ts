/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { fares } from '@tmlmobilidade/interfaces';
import { Fare, UpdateFareDto, UpdateFareSchema } from '@tmlmobilidade/types';

/* * */

export class FaresController {
	//

	/**
	 * Returns all Agencies sorted by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Fare[]>) {
		const allFares = await fares.findMany({}, { sort: { _id: 1 } });
		reply.send({ data: allFares, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Returns an Fare by ID.
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Fare>) {
		const fareData = await fares.findById(request.params.id);
		if (!fareData) throw new HttpException(HttpStatus.NOT_FOUND, 'Fare not found');
		reply.send({ data: fareData, error: null, statusCode: HttpStatus.OK });
	}

	/**
		 * Toggles the lock status of an agency by ID.
		 * @param request Fastify request containing agency ID in params.
		 * @param reply Fastify reply.
		 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Fare>) {
		await fares.toggleLockById(request.params.id);
		const foundFare = await fares.findById(request.params.id);
		if (!foundFare) throw new HttpException(HttpStatus.NOT_FOUND, 'Fare not found');
		reply.send({ data: foundFare, error: null, statusCode: HttpStatus.OK });
	}

	/**
	 * Updates an Fare in the database
	 * @param request The request object
	 * @param reply The reply object
	 */
	static async update(request: FastifyRequest<{ Body: UpdateFareDto, Params: { id: string } }>, reply: FastifyReply<Fare>) {
		// Validate the request body
		const validatedFare = UpdateFareSchema.safeParse(request.body);
		if (!validatedFare.success) throw new HttpException(HttpStatus.BAD_REQUEST, 'Dados inválidos', validatedFare.error);
		// Set the updated_by field to the current user's id
		validatedFare.data.updated_by = request.me._id;
		// Update the agency in the database
		const updatedFareData = await fares.updateById(request.params.id, validatedFare.data);
		reply.send({ data: updatedFareData, error: null, statusCode: HttpStatus.OK });
	}

	//
}
