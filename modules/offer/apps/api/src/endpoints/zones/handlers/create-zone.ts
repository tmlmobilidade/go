/* * */

import { HTTP_STATUS, HttpException } from '@tmlmobilidade/consts';
import { type FastifyReply, type FastifyRequest } from '@tmlmobilidade/go-clients-fastify';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type CreateZoneDto, type Zone } from '@tmlmobilidade/go-types-offer';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';

/**
 * Creates a new zone.
 * @param request Fastify request containing zone data
 * @param reply Fastify reply
 */
export async function createZoneHandler(request: FastifyRequest<{ Body: CreateZoneDto }>, reply: FastifyReply<Zone>) {
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

	const newZone = await goDb.offer.zones.insertOne({
		...request.body,
		created_by: request.me._id,
		geojson: request.body.geojson ?? { features: [], type: 'FeatureCollection' },
		is_locked: false,
		updated_by: request.me._id,
	});

	//
	// Send the response

	reply.send({ data: newZone, error: null, statusCode: HTTP_STATUS.OK });

	//
}
