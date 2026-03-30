/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { vehicles } from '@tmlmobilidade/interfaces';
import { type CreateVehicleDto, PermissionCatalog, SimplifiedVehicleEvent, type UpdateVehicleDto, type Vehicle } from '@tmlmobilidade/types';

/* * */;

export class VehiclesController {
	//

	/**
	 * Creates a new vehicle.
	 * @param request Fastify request containing vehicle data
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateVehicleDto }>, reply: FastifyReply<Vehicle>) {
		//

		//
		// Check if the user has permission to create vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.create)) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create vehicles');
		}

		//
		// Create the new vehicle

		const newVehicle = await vehicles.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newVehicle, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Deletes an vehicle by ID
	 * @param request Fastify request containing vehicle ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const vehicle = await vehicles.findById(id);

		if (!vehicle) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
		}

		//
		// Check if the user has permission to delete vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.delete)) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete vehicles');
		}

		//

		await vehicles.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all vehicles.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Vehicle[]>) {
		//

		//
		// Check if the user has permission to read vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.read)) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read vehicles');
		}

		//
		// Fetch all vehicles

		const allVehicles = await vehicles.findMany({}, { sort: { created_at: -1 } });

		return reply.send({ data: allVehicles, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Retrieves a single vehicle by ID
	 * @param request Fastify request containing vehicle ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Vehicle>) {
		//

		//
		// Get the Vehicle from the database

		const vehicleData = await vehicles.findById(request.params.id);

		if (!vehicleData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');

		//
		// Check if the user has permission to read vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.read)) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read vehicles');
		}

		//
		// Fetch the vehicle data

		return reply.send({
			data: vehicleData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of a stop by ID.
	 * @param request Fastify request containing stop ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Vehicle>) {
		await vehicles.toggleLockById(request.params.id);
		const foundVehicle = await vehicles.findById(request.params.id);
		if (!foundVehicle) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
		reply.send({ data: foundVehicle, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Updates an existing vehicle by ID
	 * @param request Fastify request containing vehicle ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateVehicleDto, Params: { id: string } }>, reply: FastifyReply<Vehicle>) {
		//

		//
		// Get the Vehicle from the database

		const vehicleData = await vehicles.findById(request.params.id);

		if (!vehicleData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');

		//
		// Check if the user has permission to update vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.update)) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update vehicles');
		}

		//
		// Update the vehicle

		const updatedVehicle = await vehicles.updateById(vehicleData._id, request.body);

		//
		// Send the updated vehicle data as the response

		reply.send({
			data: updatedVehicle,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Retrieves the last event for a given vehicle.
	 * @param request Fastify request containing vehicle ID in params
	 * @param reply Fastify reply
	 */
	static async getLastEvent(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<SimplifiedVehicleEvent>) {
		const lastEvent = await simplifiedVehicleEventsNew.getLastEvent(request.params.id);
		reply.send({ data: lastEvent, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves the latest position per vehicle from recent simplified vehicle events.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getPositions(request: FastifyRequest, reply: FastifyReply<SimplifiedVehicleEvent[]>) {
		const positions = await simplifiedVehicleEventsNew.getPositions();
		reply
			.send({
				data: positions,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
	}
}
