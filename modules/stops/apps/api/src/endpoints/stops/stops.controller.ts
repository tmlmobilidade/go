/* * */

import { generateStopId } from '@/utils/generate-stop-id.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type Filter, patterns, stops } from '@tmlmobilidade/interfaces';
import { CreateStopSchema, PermissionCatalog, type Stop, type StopId, type UpdateStopDto } from '@tmlmobilidade/types';

/**
 * This is an example controller that is using the stops interface.
 */

export class StopsController {
	//

	/**
	 * Creates a new Stop
	 * @param request Fastify request containing stop data in body
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest, reply: FastifyReply<Stop>) {
		//
		// Parse the request body
		const data = CreateStopSchema.parse(request.body);

		// ! There is no reference to agency_id in stop_creation

		// //
		// // Check if the user has permission to run this action
		// const hasPermission = PermissionCatalog.hasPermissionResource({
		// 	action: PermissionCatalog.all.stops.actions.create,
		// 	permissions: request.permissions,
		// 	resource_key: 'agency_ids',
		// 	scope: PermissionCatalog.all.stops.scope,
		// 	value: data.flags.flatMap(flag => flag.agency_ids),
		// });

		// if (!hasPermission) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create this stop, because you do not have permission for all the agencies involved in the stop.');

		const newStopId = await generateStopId();
		const result = await stops.insertOne({ ...data, _id: newStopId }, { unsafe: true });

		reply.send({ data: result, error: null, statusCode: HTTP_STATUS.CREATED });
	}

	/**
	 * Toggles the deleted status of a stop by ID.
	 * @param request Fastify request containing stop ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		//
		// Get the stop from the database
		const foundStop = await stops.findById(Number(request.params.id));
		if (!foundStop) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Stop not found');

		if (foundStop.flags.length !== 0) {
			// Check if the user has permission to run this action
			const hasPermission = PermissionCatalog.hasPermissionResource({
				action: PermissionCatalog.all.stops.actions.delete,
				permissions: request.permissions,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.stops.scope,
				value: foundStop.flags.flatMap(flag => flag.agency_ids),
			});

			if (!hasPermission) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this stop');
		}

		// If authorized, toggle the deleted status of the stop
		await stops.toggleDeleteById(request.params.id);

		reply.send({ data: foundStop, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all stops, sorted by creation date descending
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Stop[]>) {
		//

		// Get the resource permissions for stops for the current user.
		// The stops will be filtered by the agency_ids in the resources.
		const userStopPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.stops.scope, PermissionCatalog.all.stops.actions.read);

		const queryFilters: Filter<Stop> = {};
		if ('resources' in userStopPermissions && userStopPermissions.resources) {
			const resources = userStopPermissions.resources;
			if ('agency_ids' in resources && !resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
				queryFilters.$or = [
					{ flags: { $elemMatch: { agency_ids: { $in: resources['agency_ids'] } } } },
					{ flags: { $size: 0 } },
				];
			}
		}
		const data = await stops.findMany(queryFilters, {
			projection: { _id: 1, flags: 1, is_deleted: 1, latitude: 1, legacy_ids: 1, lifecycle_status: 1, longitude: 1, municipality_id: 1, name: 1, system_status: 1 },
			sort: { created_at: -1 },
		});
		if (!data) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Can not get stops from database');
			throw error;
		}
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Generates and retrieves a new unique Stop ID
	 * that does not conflict with existing IDs or deleted CM Stops.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getValidId(request: FastifyRequest, reply: FastifyReply<StopId>) {
		const newStopId = await generateStopId();
		if (!newStopId) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Can not generate a new stop ID');
			throw error;
		}

		reply.send({ data: newStopId, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves a single stop by ID.
	 * @param request Fastify request containing stop ID in params.
	 * @param reply Fastify reply.
	 */
	static async getById(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		// Get the stop from the database
		const foundStop = await stops.findById(Number(request.params.id));
		if (!foundStop) {
			const error = new HttpException(HTTP_STATUS.NOT_FOUND, `Can not find stop with ID ${request.params.id}`);
			throw error;
		}

		if (foundStop.flags.length !== 0) {
			// Check if the user has permission to run this action
			const hasPermission = PermissionCatalog.hasPermissionResource({
				action: PermissionCatalog.all.stops.actions.read,
				permissions: request.permissions,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.stops.scope,
				value: foundStop.flags.flatMap(flag => flag.agency_ids),
			});

			if (!hasPermission) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this stop');
		}

		//
		// Get pattern ids that reference this event in manual pattern rules

		const associatedPatterns = await patterns.findMany(
			{
				'path.stop_id': Number(request.params.id),
			},
			{
				projection: {
					_id: 1,
					code: 1,
					headsign: 1,
					line_id: 1,
					route_id: 1,
				},
				sort: { code: 1 },
			},
		);

		if (!associatedPatterns) {
			const error = new HttpException(HTTP_STATUS.INTERNAL_SERVER_ERROR, `Can not get associated patterns for stop with ID ${request.params.id}`);
			throw error;
		}

		reply.send({
			data: { ...foundStop, associated_patterns: associatedPatterns },
			error: null,
			statusCode: HTTP_STATUS.OK,
		});
	}

	/**
	 * Toggles the lock status of a stop by ID.
	 * @param request Fastify request containing stop ID in params.
	 * @param reply Fastify reply.
	 */
	static async lock(request: FastifyRequest<{ Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		// Get the stop from the database
		const foundStop = await stops.findById(Number(request.params.id));
		if (!foundStop) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Stop not found');

		if (foundStop.flags.length !== 0) {
			// Check if the user has permission to run this action
			const hasPermission = PermissionCatalog.hasPermissionResource({
				action: PermissionCatalog.all.stops.actions.lock,
				permissions: request.permissions,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.stops.scope,
				value: foundStop.flags.flatMap(flag => flag.agency_ids),
			});

			if (!hasPermission) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock or unlock this stop');
		}

		// If authorized, toggle the lock status of the stop
		await stops.toggleLockById(foundStop._id);

		reply.send({ data: foundStop, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Updates an existing stop by ID
	 * @param request Fastify request containing stop ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateStopDto, Params: { id: StopId } }>, reply: FastifyReply<Stop>) {
		// Get the stop from the database
		const foundStop = await stops.findById(Number(request.params.id));
		if (!foundStop) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Stop not found');

		if (
			foundStop.flags.length !== 0
			|| (
				request.body.flags?.length !== 0
				&& !foundStop.flags.flatMap(flag => flag.agency_ids).every(agencyId => request.body.flags?.flatMap(flag => flag.agency_ids).includes(agencyId))
			)
		) {
			// Check if the user has permission to run this action
			const hasPermission = PermissionCatalog.hasPermissionResource({
				action: PermissionCatalog.all.stops.actions.update,
				permissions: request.permissions,
				resource_key: 'agency_ids',
				scope: PermissionCatalog.all.stops.scope,
				value: foundStop.flags.flatMap(flag => flag.agency_ids),
			});

			if (!hasPermission) throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this stop');
		}

		// Ensure the flag IDs are saved in the legacy IDs array
		const flagIds = request.body.flags?.map(flag => flag.stop_id) || [];
		const existingLegacyIds = new Set(foundStop.legacy_ids || []);
		flagIds.forEach(flagId => existingLegacyIds.add(flagId));
		request.body.legacy_ids = Array.from(existingLegacyIds);
		// Perform the update
		const data = await stops.updateById(Number(request.params.id), request.body);
		reply.send({ data, error: null, statusCode: HTTP_STATUS.OK });
	}
}
