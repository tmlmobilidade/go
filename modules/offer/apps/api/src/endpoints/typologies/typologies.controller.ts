/* * */

import { HttpException, HTTP_STATUS } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type Filter, typologies } from '@tmlmobilidade/interfaces';
import { CreateTypologyDto, PermissionCatalog, type Typology, type UpdateTypologyDto } from '@tmlmobilidade/types';

/* * */

export class TypologiesController {
	//

	/**
	 * Creates a new typology.
	 * @param request Fastify request containing typology data
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateTypologyDto }>, reply: FastifyReply<Typology>) {
		//

		//
		// Get the resource permissions for typologies for the current user.

		const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.create);

		//
		// If no permission found, deny access

		if (!userTypologyPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create typologies');
		}

		//
		// Validate that user has permission for ALL the specified agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.typologies.actions.create,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.typologies.scope,
			value: request.body.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create typologies for these agencies. You must have permission for all agencies involved.');
		}

		//
		// Create the new typology

		const newTypology = await typologies.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newTypology, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Deletes an typology by ID
	 * @param request Fastify request containing typology ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const typology = await typologies.findById(id);

		if (!typology) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Typology not found');
		}

		//
		// Get the resource permissions for typologies for the current user.

		const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.delete);

		//
		// If no permission found, deny access

		if (!userTypologyPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete typologies');
		}

		//
		// Validate that user has permission for ALL of this typology's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.typologies.actions.delete,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.typologies.scope,
			value: typology.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this typology. You must have permission for all agencies involved.');
		}

		//

		await typologies.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all typologies.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Typology[]>) {
		//

		//
		// Get the resource permissions for typologies for the current user.

		const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.read);

		//
		// If no permission found, deny access

		if (!userTypologyPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read typologies');
		}

		//
		// Build database query filters based on user permissions

		const queryFilters: Filter<Typology> = {};

		//
		// If agency IDs are specified in resources and do not include the ALLOW_ALL_FLAG,
		// filter typologies by those agency IDs.

		if ('resources' in userTypologyPermissions && 'agency_ids' in userTypologyPermissions.resources) {
			if (!userTypologyPermissions.resources['agency_ids'].includes(PermissionCatalog.ALLOW_ALL_FLAG)) {
				queryFilters.agency_ids = { $in: userTypologyPermissions.resources['agency_ids'] };
			}
		}

		//
		// Fetch typologies based on query filters

		const allTypologies = await typologies.findMany(queryFilters, { sort: { created_at: -1 } });

		return reply.send({ data: allTypologies, error: null, statusCode: HTTP_STATUS.OK });
		//
	}

	/**
	 * Retrieves a single typology by ID
	 * @param request Fastify request containing typology ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Typology>) {
		//

		//
		// Get the Typology from the database

		const typologyData = await typologies.findById(request.params.id);

		if (!typologyData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Typology not found');

		//
		// Get the resource permissions for typologies for the current user.

		const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.read);

		//
		// If no permission found, deny access

		if (!userTypologyPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read typologies');
		}

		//
		// Validate that user has permission for at least one of this typology's agencies

		const hasPermissionForAnyAgency = PermissionCatalog.hasPermissionResource({
			action: PermissionCatalog.all.typologies.actions.read,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.typologies.scope,
			value: typologyData.agency_ids,
		});

		if (!hasPermissionForAnyAgency) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this typology');
		}

		//
		// Fetch the typology data

		return reply.send({
			data: typologyData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of an typology by ID
	 * @param request Fastify request containing typology ID in params
	 * @param reply Fastify reply
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Typology>) {
		//

		//
		// Get the Typology from the database

		const typologyData = await typologies.findById(request.params.id);

		if (!typologyData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Typology not found');

		//
		// Get the resource permissions for typologies for the current user.

		const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.lock);

		//
		// If no permission found, deny access

		if (!userTypologyPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock typologies');
		}

		//
		// Validate that user has permission for ALL of this typology's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.typologies.actions.lock,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.typologies.scope,
			value: typologyData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock typology. You must have permission for all agencies involved.');
		}

		// If authorized, toggle the lock status of the typology
		await typologies.toggleLockById(request.params.id);
		const foundTypology = await typologies.findById(request.params.id);
		if (!foundTypology) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Typology not found');

		return reply.send({ data: foundTypology, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Updates an existing typology by ID
	 * @param request Fastify request containing typology ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateTypologyDto, Params: { id: string } }>, reply: FastifyReply<Typology>) {
		//

		//
		// Get the Typology from the database

		const typologyData = await typologies.findById(request.params.id);

		if (!typologyData) throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Typology not found');

		//
		// Get the resource permissions for typologies for the current user.

		const userTypologyPermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.typologies.scope, PermissionCatalog.all.typologies.actions.update);

		//
		// If no permission found, deny access

		if (!userTypologyPermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update typologies');
		}

		//
		// Validate that user has permission for ALL of this typology's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.typologies.actions.update,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.typologies.scope,
			value: typologyData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this typology. You must have permission for all agencies involved.');
		}

		//
		// Update the typology

		const updatedTypology = await typologies.updateById(typologyData._id, request.body);

		//
		// Send the updated typology data as the response

		reply.send({
			data: updatedTypology,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}
	//
}
