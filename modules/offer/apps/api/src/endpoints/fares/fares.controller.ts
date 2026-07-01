/* * */

import { getOfferCatalogAgencyFilter, hasOfferCatalogResourceReadAccess } from '@/utils/catalog-permissions.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { fares, type Filter } from '@tmlmobilidade/interfaces';
import { CreateFareDto, type Fare, PermissionCatalog, type UpdateFareDto } from '@tmlmobilidade/types';

/* * */;

export class FaresController {
	//

	/**
	 * Creates a new fare.
	 * @param request Fastify request containing fare data
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateFareDto }>, reply: FastifyReply<Fare>) {
		//

		//
		// Get the resource permissions for fares for the current user.

		const userFarePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.create);

		//
		// If no permission found, deny access

		if (!userFarePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create fares');
		}

		//
		// Validate that user has permission for ALL the specified agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.fares.actions.create,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.fares.scope,
			value: request.body.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create fares for these agencies. You must have permission for all agencies involved.');
		}

		//
		// Create the new fare

		const newFare = await fares.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newFare, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Deletes an fare by ID
	 * @param request Fastify request containing fare ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const fare = await fares.findById(id);

		if (!fare) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Fare not found');
		}

		//
		// Get the resource permissions for fares for the current user.

		const userFarePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.delete);

		//
		// If no permission found, deny access

		if (!userFarePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete fares');
		}

		//
		// Validate that user has permission for ALL of this fare's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.fares.actions.delete,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.fares.scope,
			value: fare.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this fare. You must have permission for all agencies involved.');
		}

		//

		await fares.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all fares.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Fare[]>) {
		//

		const queryFilters: Filter<Fare> = getOfferCatalogAgencyFilter(request.permissions, 'fares');

		//
		// Fetch fares based on query filters

		const allFares = await fares.findMany(queryFilters, { sort: { created_at: -1 } });

		return reply.send({ data: allFares, error: null, statusCode: HTTP_STATUS.OK });
		//
	}

	/**
	 * Retrieves a single fare by ID
	 * @param request Fastify request containing fare ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Fare>) {
		//

		//
		// Get the Fare from the database

		const fareData = await fares.findById(request.params.id);

		if (!fareData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Fare not found');
		}

		if (!hasOfferCatalogResourceReadAccess(request.permissions, 'fares', fareData.agency_ids)) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this fare');
		}

		//
		// Fetch the fare data

		return reply.send({
			data: fareData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of an fare by ID
	 * @param request Fastify request containing fare ID in params
	 * @param reply Fastify reply
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Fare>) {
		//

		//
		// Get the Fare from the database

		const fareData = await fares.findById(request.params.id);

		if (!fareData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Fare not found');
		}

		//
		// Get the resource permissions for fares for the current user.

		const userFarePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.lock);

		//
		// If no permission found, deny access

		if (!userFarePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock fares');
		}

		//
		// Validate that user has permission for ALL of this fare's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.fares.actions.lock,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.fares.scope,
			value: fareData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock fare. You must have permission for all agencies involved.');
		}

		// If authorized, toggle the lock status of the fare
		await fares.toggleLockById(request.params.id);
		const foundFare = await fares.findById(request.params.id);
		if (!foundFare) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Fare not found');
		}

		return reply.send({ data: foundFare, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Updates an existing fare by ID
	 * @param request Fastify request containing fare ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateFareDto, Params: { id: string } }>, reply: FastifyReply<Fare>) {
		//

		//
		// Get the Fare from the database

		const fareData = await fares.findById(request.params.id);

		if (!fareData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Fare not found');
		}

		//
		// Get the resource permissions for fares for the current user.

		const userFarePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.fares.scope, PermissionCatalog.all.fares.actions.update);

		//
		// If no permission found, deny access

		if (!userFarePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update fares');
		}

		//
		// Validate that user has permission for ALL of this fare's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.fares.actions.update,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.fares.scope,
			value: fareData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this fare. You must have permission for all agencies involved.');
		}

		//
		// Update the fare

		const updatedFare = await fares.updateById(fareData._id, request.body);

		//
		// Send the updated fare data as the response

		reply.send({
			data: updatedFare,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}
	//
}
