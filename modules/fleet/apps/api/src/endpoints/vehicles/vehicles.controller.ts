/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { simplifiedVehicleEventsNew } from '@tmlmobilidade/databases';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { vehicles } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type CreateVehicleDto, PermissionCatalog, SimplifiedVehicleEvent, type UpdateVehicleDto, type Vehicle } from '@tmlmobilidade/types';

/* * */;

export class VehiclesController {
	//

	/**
	 * Creates a new vehicle.
	 * @param request Fastify request containing vehicle data
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateVehicleDto | CreateVehicleDto[] }>, reply: FastifyReply<null | Vehicle>) {
		//

		//
		// Check if the user has permission to create vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.create)) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create vehicles');
			Logger.issue('error', error, {
				action: 'create',
				feature: 'vehicles',
				request,
			});
			throw error;
		}

		//
		// Create the new vehicle

		if (Array.isArray(request.body)) {
			await vehicles.insertMany(request.body);
			reply.send({ data: null, error: null, statusCode: HTTP_STATUS.CREATED });
		} else {
			const newVehicle = await vehicles.insertOne(request.body);
			reply.send({ data: newVehicle, error: null, statusCode: HTTP_STATUS.CREATED });
		}
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
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
			Logger.issue('error', error, {
				action: 'delete',
				feature: 'vehicles',
				request,
			});
			throw error;
		}

		//
		// Check if the user has permission to delete vehicles

		if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.delete)) {
			const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete vehicles');
			Logger.issue('error', error, {
				action: 'delete',
				feature: 'vehicles',
				request,
			});
			throw error;
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
		// Fetch all vehicles

		const allVehicles = await vehicles.findMany({}, { sort: { created_at: -1 } });

		return reply
			.header('Access-Control-Allow-Origin', '*')
			.send({ data: allVehicles, error: null, statusCode: HTTP_STATUS.OK });

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

		if (!vehicleData) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
			Logger.issue('error', error, {
				action: 'getById',
				feature: 'vehicles',
				request,
			});
			throw error;
		}

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

	/**
	 * Toggles the lock status of a stop by ID.
	 * @param request Fastify request containing stop ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Vehicle>) {
		await vehicles.toggleLockById(request.params.id);
		const foundVehicle = await vehicles.findById(request.params.id);
		if (!foundVehicle) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
			Logger.issue('error', error, {
				action: 'lock',
				feature: 'vehicles',
				request,
			});
			throw error;
		}

		reply.send({ data: foundVehicle, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Updates an existing vehicle by ID
	 * @param request Fastify request containing vehicle ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateVehicleDto | UpdateVehicleDto[], Params: { id: string | string[] } }>, reply: FastifyReply<null | Vehicle>) {
		//

		//
		// Get the Vehicle from the database
		if (Array.isArray(request.params.id)) {
			const vehicleData = await vehicles.findMany({ _id: { $in: request.params.id } });

			if (!vehicleData) {
				const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicles not found');
				Logger.issue('error', error, {
					action: 'update',
					feature: 'vehicles',
					request,
				});
				throw error;
			}

			//
			// Check if the user has permission to update vehicles

			if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.update)) {
				const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update vehicles');
				Logger.issue('error', error, {
					action: 'update',
					feature: 'vehicles',
					request,
				});
				throw error;
			}

			//
			// Update the vehicles

			for (const vehicle of vehicleData) {
				await vehicles.updateById(vehicle._id, vehicle);
			}

			//
			// Send the updated vehicles data as the response

			return reply.send({
				data: null,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		} else {
			const vehicleData = await vehicles.findById(request.params.id);

			if (!vehicleData) {
				const error = new HttpException(HTTP_STATUS.NOT_FOUND, 'Vehicle not found');
				Logger.issue('error', error, {
					action: 'update',
					feature: 'vehicles',
					request,
				});
				throw error;
			}

			//
			// Check if the user has permission to update vehicles

			if (!PermissionCatalog.hasPermission(request.permissions, PermissionCatalog.all.vehicles.scope, PermissionCatalog.all.vehicles.actions.update)) {
				const error = new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update vehicles');
				Logger.issue('error', error, {
					action: 'update',
					feature: 'vehicles',
					request,
				});
				throw error;
			}

			//
			// Update the vehicle

			const updatedVehicle = await vehicles.updateById(vehicleData._id, vehicleData);

			//
			// Send the updated vehicle data as the response

			return reply.send({
				data: updatedVehicle,
				error: null,
				statusCode: HTTP_STATUS.OK,
			});
		}

		//
	}

	/**
	 * Retrieves the last event for a given vehicle.
	 * @param request Fastify request containing vehicle ID in params
	 * @param reply Fastify reply
	 */
	static async getLastEvent(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<SimplifiedVehicleEvent>) {
		//
		const [agencyId, vehicleId] = request.params.id.split('-');
		if (!vehicleId || !agencyId) {
			const error = new HttpException(HTTP_STATUS.BAD_REQUEST, 'Invalid vehicle ID');
			Logger.issue('error', error, {
				action: 'getLastEvent',
				feature: 'vehicles',
				request,
			});
			throw error;
		}

		//
		// Fetch the last event for the vehicle
		const lastEvent = await simplifiedVehicleEventsNew.getLastEvent(vehicleId, agencyId);

		//
		// Send the last event for the vehicle back to the client
		reply.send({ data: lastEvent, error: null, statusCode: HTTP_STATUS.OK });
	}
}
