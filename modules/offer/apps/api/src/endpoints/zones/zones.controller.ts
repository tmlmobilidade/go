/* * */

import { getOfferCatalogAgencyFilter, hasOfferCatalogResourceReadAccess } from '@/utils/catalog-permissions.js';
import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/fastify';
import { type Filter, zones } from '@tmlmobilidade/interfaces';
import { CreateZoneDto, PermissionCatalog, type UpdateZoneDto, type Zone } from '@tmlmobilidade/types';

/* * */;

export class ZonesController {
	//

	/**
	 * Creates a new zone.
	 * @param request Fastify request containing zone data
	 * @param reply Fastify reply
	 */
	static async create(request: FastifyRequest<{ Body: CreateZoneDto }>, reply: FastifyReply<Zone>) {
		//

		//
		// Get the resource permissions for zones for the current user.

		const userZonePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.create);

		//
		// If no permission found, deny access

		if (!userZonePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create zones');
		}

		//
		// Validate that user has permission for ALL the specified agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.zones.actions.create,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.zones.scope,
			value: request.body.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to create zones for these agencies. You must have permission for all agencies involved.');
		}

		//
		// Create the new zone

		const newZone = await zones.insertOne(request.body);

		//
		// Send the response

		reply.send({ data: newZone, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Deletes an zone by ID
	 * @param request Fastify request containing zone ID in params
	 * @param reply Fastify reply
	 */
	static async delete(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<void>) {
		const { id } = request.params;
		const zone = await zones.findById(id);

		if (!zone) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Zone not found');
		}

		//
		// Get the resource permissions for zones for the current user.

		const userZonePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.delete);

		//
		// If no permission found, deny access

		if (!userZonePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete zones');
		}

		//
		// Validate that user has permission for ALL of this zone's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.zones.actions.delete,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.zones.scope,
			value: zone.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to delete this zone. You must have permission for all agencies involved.');
		}

		//

		await zones.deleteById(id);

		reply.send({ data: undefined, error: null, statusCode: HTTP_STATUS.OK });
	}

	/**
	 * Retrieves all zones.
	 * @param request Fastify request
	 * @param reply Fastify reply
	 */
	static async getAll(request: FastifyRequest, reply: FastifyReply<Zone[]>) {
		//

		const queryFilters: Filter<Zone> = getOfferCatalogAgencyFilter(request.permissions, 'zones');

		//
		// Fetch zones based on query filters

		const allZones = await zones.findMany(queryFilters, { sort: { created_at: -1 } });

		return reply.send({ data: allZones, error: null, statusCode: HTTP_STATUS.OK });
		//
	}

	/**
	 * Retrieves a single zone by ID
	 * @param request Fastify request containing zone ID in params
	 * @param reply Fastify reply
	 */
	static async getById(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Zone>) {
		//

		//
		// Get the Zone from the database

		const zoneData = await zones.findById(request.params.id);

		if (!zoneData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Zone not found');
		}

		if (!hasOfferCatalogResourceReadAccess(request.permissions, 'zones', zoneData.agency_ids)) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to read this zone');
		}

		//
		// Fetch the zone data

		return reply.send({
			data: zoneData,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}

	/**
	 * Toggles the lock status of an zone by ID
	 * @param request Fastify request containing zone ID in params
	 * @param reply Fastify reply
	 */
	static async lock(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply<Zone>) {
		//

		//
		// Get the Zone from the database

		const zoneData = await zones.findById(request.params.id);

		if (!zoneData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Zone not found');
		}

		//
		// Get the resource permissions for zones for the current user.

		const userZonePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.lock);

		//
		// If no permission found, deny access

		if (!userZonePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to lock/unlock zones');
		}

		//
		// Validate that user has permission for ALL of this zone's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.zones.actions.lock,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.zones.scope,
			value: zoneData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to perform this action: toggle lock zone. You must have permission for all agencies involved.');
		}

		// If authorized, toggle the lock status of the zone
		await zones.toggleLockById(request.params.id);
		const foundZone = await zones.findById(request.params.id);
		if (!foundZone) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Zone not found');
		}

		return reply.send({ data: foundZone, error: null, statusCode: HTTP_STATUS.OK });

		//
	}

	/**
	 * Updates an existing zone by ID
	 * @param request Fastify request containing zone ID in params and update data in body
	 * @param reply Fastify reply
	 */
	static async update(request: FastifyRequest<{ Body: UpdateZoneDto, Params: { id: string } }>, reply: FastifyReply<Zone>) {
		//

		//
		// Get the Zone from the database

		const zoneData = await zones.findById(request.params.id);

		if (!zoneData) {
			throw new HttpException(HTTP_STATUS.NOT_FOUND, 'Zone not found');
		}

		//
		// Get the resource permissions for zones for the current user.

		const userZonePermissions = PermissionCatalog.get(request.permissions, PermissionCatalog.all.zones.scope, PermissionCatalog.all.zones.actions.update);

		//
		// If no permission found, deny access

		if (!userZonePermissions) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update zones');
		}

		//
		// Validate that user has permission for ALL of this zone's agencies

		const hasPermissionForAllAgencies = PermissionCatalog.hasPermissionResourceAll({
			action: PermissionCatalog.all.zones.actions.update,
			permissions: request.permissions,
			resource_key: 'agency_ids',
			scope: PermissionCatalog.all.zones.scope,
			value: zoneData.agency_ids,
		});

		if (!hasPermissionForAllAgencies) {
			throw new HttpException(HTTP_STATUS.FORBIDDEN, 'You are not authorized to update this zone. You must have permission for all agencies involved.');
		}

		//
		// Update the zone

		const updatedZone = await zones.updateById(zoneData._id, request.body);

		//
		// Send the updated zone data as the response

		reply.send({
			data: updatedZone,
			error: null,
			statusCode: HTTP_STATUS.OK,
		});

		//
	}
	//
}
