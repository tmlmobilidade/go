/* * */

import { HttpException, HttpStatus } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { Vehicles } from '@tmlmobilidade/interfaces';
import { type CreateVehicleDto, PermissionCatalog, type UpdateVehicleDto, type Vehicle } from '@tmlmobilidade/types';

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

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.fleet.scope, PermissionCatalog.all.fleet.actions.create)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to create vehicles');
		}

		//
		// Create the new vehicle

		const newVehicle = await Vehicles.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newVehicle, error: null, statusCode: HttpStatus.OK });

		//
	}

	/**
	 * Deletes an vehicle by ID
	 * @param request Fastify request containing vehicle ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const vehicle = await Vehicles.findById(id);

		if (!vehicle) {
			throw new HttpException(HttpStatus.NOT_FOUND, 'Vehicle not found');
		}

		//
		// Check if the user has permission to delete vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.fleet.scope, PermissionCatalog.all.fleet.actions.delete)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to delete vehicles');
		}

		//

		await Vehicles.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HttpStatus.OK });
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

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.fleet.scope, PermissionCatalog.all.fleet.actions.read)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read vehicles');
		}

		//
		// Fetch all vehicles

		const allVehicles = await Vehicles.findMany({}, { sort: { created_at: -1 } });

		return reply.send({ data: allVehicles, error: null, statusCode: HttpStatus.OK });

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

		const vehicleData = await Vehicles.findById(request.params.id);

		if (!vehicleData) throw new HttpException(HttpStatus.NOT_FOUND, 'Vehicle not found');

		//
		// Check if the user has permission to read vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.fleet.scope, PermissionCatalog.all.fleet.actions.read)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to read vehicles');
		}

		//
		// Fetch the vehicle data

		return reply.send({
			data: vehicleData,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of a stop by ID.
	 * @param request Fastify request containing stop ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Vehicle>) {
		await Vehicles.toggleLockById(request.params.id);
		const foundVehicle = await Vehicles.findById(request.params.id);
		if (!foundVehicle) throw new HttpException(HttpStatus.NOT_FOUND, 'Vehicle not found');
		reply.send({ data: foundVehicle, error: null, statusCode: HttpStatus.OK });
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

		const vehicleData = await Vehicles.findById(request.params.id);

		if (!vehicleData) throw new HttpException(HttpStatus.NOT_FOUND, 'Vehicle not found');

		//
		// Check if the user has permission to update vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.fleet.scope, PermissionCatalog.all.fleet.actions.update)) {
			throw new HttpException(HttpStatus.FORBIDDEN, 'You are not authorized to update vehicles');
		}

		//
		// Update the vehicle

		const updatedVehicle = await Vehicles.updateById(vehicleData._id, request.body);

		//
		// Send the updated vehicle data as the response

		reply.send({
			data: updatedVehicle,
			error: null,
			statusCode: HttpStatus.OK,
		});

		//
	}
	//
}
